const router = require('express').Router();
let database, adminEmails, httpToken;

router.get('/:shortened', async (req, res, next) => {
	let now = Date.now();
	let result = await database.getUrlByShortened(req.params.shortened);

	if (!result || (typeof result.expires === 'number' && result.expires < now)) {
		return next();
	}

	res.redirect(302, result.redirects_to);

	await database.createNewHit({
		time: now,
		url_id: result.id,
		ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
		referrer: req.headers.referer || null
	});
});

module.exports = (a, b, c) => {
	httpToken = a;
	database = b;
	adminEmails = c;
	
	return router
}
