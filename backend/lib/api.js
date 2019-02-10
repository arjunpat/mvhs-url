const router = require('express').Router();
const responses = require('./responses');
const Database = require('./Database');
const HttpToken = require('./HttpToken');

const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

let {
	MYSQL_USER,
	MYSQL_PASS,
	MYSQL_DB,
	MYSQL_HOST,
	ENCRYPTION_SECRET,
	INIT_VECTOR,
	CLIENT_SECRET
} = process.env;

const database = new Database(
	MYSQL_USER,
	MYSQL_PASS,
	MYSQL_DB,
	MYSQL_HOST
);

const httpToken = new HttpToken(ENCRYPTION_SECRET, INIT_VECTOR, CLIENT_SECRET);

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
	}

	let token = httpToken.generateToken({
		email: profile.email
	});

	res.cookie('mvhs_url', token, {
		maxAge: 2592000000
	});

	res.send(responses.success({ token }));
});


router.post('/create', async (req, res) => {
	let token = req.cookies.mvhs_url;

	if (!token)
		return res.send(responses.error('no_cookie'));

	let tokenContents = httpToken.verifyAndDecrypt(token);

	if (!tokenContents)
		return res.send(responses.error('bad_token'));
	
	let email = tokenContents.email;
	let profile = await database.getUserByEmail(email);

	if (!profile)
		return res.send(responses.error('no_account'));

	let { shortened, redirects_to, expires_in, recaptchaToken } = req.body;
	let now = Date.now();
	let expires = now;

	if (!shortened || !redirects_to || !expires_in || !recaptchaToken)
		return res.send(responses.error('missing_data'));
	
	// TODO recaptcha validation

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
	
	if (typeof expires_in === 'number') {
		expires += expires_in;
	} else {
		expires = null;
	}
	
	let result = await database.createNewUrl({
		shortened,
		redirects_to,
		expires,
		now,
		registered_to: email
	});

	if (result.affectedRows === 1) {
		res.send(responses.success());
	} else {
		res.send(responses.error('shortened_exists'))
	}
});

router.get('/account-urls', async (req, res) => {
	let token = req.cookies.mvhs_url;

	if (!token)
		return res.send(responses.error('no_cookie'));

	let tokenContents = httpToken.verifyAndDecrypt(token);

	if (!tokenContents)
		return res.send(responses.error('bad_token'));
	
	let email = tokenContents.email;
	let profile = await database.getUserByEmail(email);

	if (!profile)
		return res.send(responses.error('no_account'));

	let results = await database.getUrlsByEmail(email);
	let hits = await database.getHitsByEmail(email);
	let urls = [];

	for (let i = 0; i < results.length; i++) {
		let result = results[i];
		urls.push({
			shortened: result.shortened,
			redirects_to: result.redirects_to,
			expires: result.expires,
			created_time: result.created_time,
			clicks: hits.filter(h => h.shortened === result.shortened).length
		})
	}

	res.send(responses.success(urls));

});

router.get('/profile', async (req, res) => {
	let token = req.cookies.mvhs_url;

	if (!token)
		return res.send(responses.error('no_cookie'));

	let tokenContents = httpToken.verifyAndDecrypt(token);

	if (!tokenContents)
		return res.send(responses.error('bad_token'));
	
	let email = tokenContents.email;
	let profile = await database.getUserByEmail(email);

	if (!profile)
		return res.send(responses.error('no_account'));
	
	res.send(responses.success({
		first_name: profile.first_name,
		last_name: profile.last_name,
		profile_pic: profile.profile_pic,
		email: profile.email
	}));
});

router.get('/:shortened', async (req, res, next) => {
	if (!req.originalUrl.startsWith('/u/'))
		return next();

	let result = await database.getUrlByShortened(req.params.shortened);

	if (!result)
		return next();

	res.redirect(302, result.redirects_to);

	await database.createNewHit({
		shortened: req.params.shortened,
		ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
		referrer: req.headers.referer || null
	});
});

module.exports = router;
