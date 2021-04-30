const router = require('express').Router();
const responses = require('./responses');

const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const helpers = require('./helpers.js');

let database, adminEmails, httpToken;

function generateId(length) {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function inUse(url, time) {
  return url && (url.expires > time || url.expires === null);
}

router.all('*', (req, res, next) => {
  if (req.originalUrl === '/api/login') {
    return next();
  }

  let token = req.cookies.mvhs_url;

  if (!token) {
    return res.send(responses.error('no_cookie'));
  }

  let tokenContents = httpToken.verifyAndDecrypt(token);

  if (!tokenContents) {
    return res.send(responses.error('bad_token'));
  }
  
  req.email = tokenContents.email;
  next();
});

router.post('/login', async (req, res) => {
  let accessToken = req.body.accessToken;

  let result = await fetch('https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + accessToken);
  result = await result.json();
  
  if (!result.email_verified)
    return res.send(responses.error('email_not_verified'));
  
  let profile = await database.getUserByEmail(result.email);

  if (!profile) {
    profile = {
      email: result.email,
      first_name: result.given_name,
      last_name: result.family_name,
      profile_pic: result.picture
    }

    await database.createNewUser(profile);
  } else {
    await database.updateUser({
      email: result.email,
      first_name: result.given_name,
      last_name: result.family_name,
      profile_pic: result.picture
    });
  }

  let token = httpToken.generateToken({
    email: profile.email,
    admin: adminEmails.includes(profile.email)
  });

  res.cookie('mvhs_url', token, {
    maxAge: 2592000000
  });

  res.send(responses.success({ token }));
});

router.post('/logout', async (req, res) => {
  res.clearCookie('mvhs_url');

  res.send(responses.success());
});

router.post('/create', async (req, res) => {
  let profile = await database.getUserByEmail(req.email);

  if (!profile)
    return res.send(responses.error('no_account'));

  if (profile.is_suspended)
    return res.send(responses.error('suspended_account'));

  let { shortened, redirects_to, expires_in, recaptchaToken } = req.body;
  let now = helpers.getTime();
  let expires = now;

  if (!shortened || !redirects_to || !expires_in || !recaptchaToken)
    return res.send(responses.error('missing_data'));

  if (!/((http(s)?(\:\/\/))+(www\.)?([\w\-\.\/])*(\.[a-zA-Z]{2,3}\/?))[^\s\b\n|]*[^.,;:\?\!\@\^\$ -]/.test(redirects_to))
    return res.send(responses.error('not_valid_redirects_to'));

  if (!/^[A-Za-z0-9-_.]+$/g.test(shortened))
    return res.send(responses.error('bad_shortened'));

  let params = new URLSearchParams();
  params.append('secret', process.env.RECAPTCHA_SECRET);
  params.append('response', req.body.recaptchaToken);

  let recaptchaVerification = await (await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: params
  })).json();

  if (!recaptchaVerification.success) {
    return res.json(responses.error('bad_recaptcha'));
  }

  let url = await database.getLatestUrlByShortened(shortened);

  if (inUse(url, now)) {
    return res.send(responses.error('shortened_exists'));
  }
  
  if (typeof expires_in === 'number') {
    expires += expires_in;
  } else {
    expires = null;
  }
  
  let id = generateId(6);
  let result = await database.createNewUrl({
    id,
    shortened,
    redirects_to,
    expires,
    now,
    registered_to: req.email
  });

  if (result.affectedRows === 1) {
    res.send(responses.success({ id }));
  }
});

router.get('/account-urls', async (req, res) => {
  let results = await database.getUrlSummaryByEmail(req.email);

  res.send(responses.success(results));
});

router.get('/account-history/:before', async (req, res) => {
  let before = parseInt(req.params.before);

  res.send(responses.success(await database.getHistoryByEmail(req.email, before)));
});

router.post('/remove-history', async (req, res) => {
  await database.removeFromHistory(req.email, parseInt(req.body.time))

  res.send(responses.success());
});

router.get('/profile', async (req, res) => {
  let profile = await database.getUserByEmail(req.email);

  if (!profile)
    return res.send(responses.error('no_account'));
  
  res.send(responses.success({
    first_name: profile.first_name,
    last_name: profile.last_name,
    profile_pic: profile.profile_pic,
    email: profile.email,
    isAdmin: adminEmails.includes(req.email),
    isSenior: (() => {
      return seniorInformation[profile.email.substring(0, profile.email.indexOf('@'))] || false;
    })()
  }));
});

router.get('/details/:url_id', async (req, res) => {
  let url_id = req.params.url_id;
  let url = await database.getUrlSummaryById(url_id);

  if (!url) {
    return res.send(responses.error('does_not_exist'));
  }

  if (!adminEmails.includes(req.email) && url.registered_to !== req.email) {
    return res.send(responses.error('not_auth'));
  }

  let hits = (await database.query('SELECT time FROM hits WHERE url_id = ? AND time > (SELECT time FROM hits WHERE url_id = ? ORDER BY db_id DESC LIMIT 1) - 6.048e8', [ url_id, url_id ])).map(h => h.time);

  let hitsByDay = {};
  let timezoneOffsetMs = (new Date()).getTimezoneOffset() * 60 * 1000;
  let dateString;

  for (let i = 0; i < hits.length; i++) {
    dateString = new Date(hits[i] - timezoneOffsetMs).toISOString().split('T')[0];

    if (hitsByDay[dateString]) {
      hitsByDay[dateString]++;
    } else {
      hitsByDay[dateString] = 1;
    }
  }

  res.send(responses.success({
    hitsByDay,
    ...url
  }));
});

router.post('/cancel', async (req, res) => {
  let url_id = req.body.url_id;
  let url = await database.getUrlById(url_id);

  if (!adminEmails.includes(req.email) && url.registered_to !== req.email) {
    return res.send(responses.error('not_auth'));
  }

  if (!url) {
    return res.send(responses.error('does_not_exist'));
  }

  await database.cancelUrlById(url_id);

  res.send(responses.success());
});

router.post('/availability', async (req, res) => {
  let url = await database.getLatestUrlByShortened(req.body.shortened);

  if (inUse(url, helpers.getTime())) {
    return res.send(responses.success({
      availability: 'none'
    }));
  }

  res.send(responses.success({
    availability: 'available'
  }));
});


/* temp */
const getSeniorInformation = require('./get-senior-information');
let seniorInformation = {};
getSeniorInformation().then(data => {
  seniorInformation = data;
});

/*setInterval(async () => {
  seniorInformation = await getSeniorInformation();
}, 30 * 1000 * 60);*/

module.exports = (a, b, c) => {
  httpToken = a;
  database = b;
  adminEmails = c;

  return router
}
