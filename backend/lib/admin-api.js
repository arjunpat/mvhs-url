const router = require('express').Router();
const responses = require('./responses');

let database, adminEmails, httpToken;

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
  
  return adminEmails.includes(tokenContents.email) && tokenContents.email;
}

router.get('/all', async (req, res) => {
  let email = verifyToken(req, res);

  if (!email) {
    return;
  }

  let timezoneOffsetMs = (new Date()).getTimezoneOffset() * 60 * 1000;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  let [ users, urls, urlClicksToday ] = await Promise.all([
    database.getAllUsers(),
    database.getAllUrls(),
    database.getHitsCountAfter(today.getTime() - timezoneOffsetMs)
  ]);

  res.send(responses.success({
    users,
    urls,
    urlClicksToday
  }));
    
});

router.post('/toggle-suspension', async (req, res) => {
  let email = verifyToken(req, res);

  if (!email) {
    return;
  }

  if (!req.body.email) {
    return res.send(responses.error('missing_data'));
  }

  await database.toggleSuspension(req.body.email);

  return res.send(responses.success());
});

module.exports = (a, b, c) => {
  httpToken = a;
  database = b;
  adminEmails = c;
  
  return router
}
