const crypto = require('crypto');
const router = require('express').Router();
const responses = require('./responses');

const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

let database, adminEmails, httpToken;

function generateId(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

function verifyToken(req, res) {
  let token = req.cookies.mvhs_url;

  if (!token) {
    res.send(responses.error('no_cookie'));
    return false;
  }

  let tokenContents = httpToken.verifyAndDecrypt(token);

  if (!tokenContents) {
    res.send(responses.error('bad_token'));
    return false;
  }
  
  return tokenContents.email;
}

function inUse(url, time) {
  return url && (url.expires > time || url.expires === null);
}

router.post('/login', async (req, res) => {
  let accessToken = req.body.accessToken;

  let result = await fetch('https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + accessToken);
  result = await result.json();
  
  if (!result.email_verified)
    return responses.error('email_not_verified');
  
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
  let email = verifyToken(req, res);

  if (!email) {
    return;
  }

  let profile = await database.getUserByEmail(email);

  if (!profile)
    return res.send(responses.error('no_account'));

  if (profile.is_suspended)
    return res.send(responses.error('suspended_account'));

  let { shortened, redirects_to, expires_in, recaptchaToken } = req.body;
  let now = Date.now();
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
  
  let result = await database.createNewUrl({
    id: generateId(30),
    shortened,
    redirects_to,
    expires,
    now,
    registered_to: email
  });

  if (result.affectedRows === 1) {
    res.send(responses.success());
  }
});

router.get('/account-urls', async (req, res) => {
  let email = verifyToken(req, res);

  if (!email) {
    return;
  }

  let profile = await database.getUserByEmail(email);

  if (!profile)
    return res.send(responses.error('no_account'));

  let results = await database.getUrlsByEmail(email);
  let hits = await database.getHitsByEmail(email);
  let urls = [];

  for (let i = 0; i < results.length; i++) {
    let result = results[i];
    urls.push({
      id: result.id,
      shortened: result.shortened,
      redirects_to: result.redirects_to,
      expires: result.expires,
      created_time: result.created_time,
      clicks: hits.filter(h => h.url_id === result.id).length
    })
  }

  res.send(responses.success(urls));
});

router.get('/profile', async (req, res) => {
  let email = verifyToken(req, res);

  if (!email) {
    return;
  }

  let profile = await database.getUserByEmail(email);

  if (!profile)
    return res.send(responses.error('no_account'));
  
  res.send(responses.success({
    first_name: profile.first_name,
    last_name: profile.last_name,
    profile_pic: profile.profile_pic,
    email: profile.email,
    isAdmin: adminEmails.includes(email),
    isSenior: (() => {
      return profile.email.length === 18 && seniorInformation[profile.email.substring(0, 9)];
    })()
  }));
});

router.get('/details/:url_id', async (req, res) => {
  let email = verifyToken(req, res); // || return;

  if (!email) {
    return;
  }

  let url_id = req.params.url_id;
  let url = await database.getUrlById(url_id);

  if (!url) {
    return res.send(responses.error('does_not_exist'));
  }

  if (!adminEmails.includes(email) && url.registered_to !== email) {
    return res.send(responses.error('not_auth'));
  }

  let hits = await database.getHitsByUrlId(url_id);

  let timezoneOffsetMs = (new Date()).getTimezoneOffset() * 60 * 1000;

  let hitsByDay = {};
  if (hits.length > 0) {
    let oneWeekTimeFromLastHit = hits[hits.length - 1].time - 6.048e8;
    for (let i = hits.length - 1; i >= 0; i--) {
      let hit = hits[i];

      if (hit.time < oneWeekTimeFromLastHit) {
        break;
      }
      let d = new Date(hit.time - timezoneOffsetMs);
      let dateString = d.toISOString().split('T')[0];

      if (hitsByDay[dateString]) {
        hitsByDay[dateString]++;
      } else {
        hitsByDay[dateString] = 1;
      }
    }
  }

  res.send(responses.success({
    hitsByDay,
    shortened: url.shortened,
    redirects_to: url.redirects_to,
    created_time: url.created_time,
    expires: url.expires,
    clicks: hits.length
  }));
});

router.post('/cancel', async (req, res) => {
  let email = verifyToken(req, res); // || return;

  if (!email) {
    return;
  }

  let url_id = req.body.url_id;
  let url = await database.getUrlById(url_id);

  if (!adminEmails.includes(email) && url.registered_to !== email) {
    return res.send(responses.error('not_auth'));
  }

  if (!url) {
    return res.send(responses.error('does_not_exist'));
  }

  await database.cancelUrlById(url_id);

  res.send(responses.success());
});

router.post('/availability', async (req, res) => {
  let email = verifyToken(req, res);

  if (!email) {
    return;
  }

  let url = await database.getLatestUrlByShortened(req.body.shortened);

  if (inUse(url, Date.now())) {
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

setTimeout(async () => {
  seniorInformation = await getSeniorInformation();
}, 3 * 60 * 1000);

module.exports = (a, b, c) => {
  httpToken = a;
  database = b;
  adminEmails = c;

  return router
}
