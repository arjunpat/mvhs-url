const router = require('express').Router();
const helpers = require('./helpers.js');
let database, adminEmails, httpToken;

router.get('/:shortened', async (req, res, next) => {
  let now = helpers.getTime();
  let result = await database.getLatestUrlByShortened(req.params.shortened);

  if (!result || (typeof result.expires === 'number' && result.expires < now)) {
    return next();
  }

  res.redirect(302, result.redirects_to);

  // assign to account if possible
  let email = null;
  if (req.cookies.mvhs_url) {
    let tokenContents = httpToken.verifyAndDecrypt(req.cookies.mvhs_url);
    if (tokenContents) {
      email = tokenContents.email;
    }
  }

  await database.createNewHit({
    time: now,
    url_id: result.id,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    referrer: req.headers.referer || null,
    email,
    qrcode: !!req.query.qrcode
  });
});

module.exports = (a, b, c) => {
  httpToken = a;
  database = b;
  adminEmails = c;
  
  return router
}
