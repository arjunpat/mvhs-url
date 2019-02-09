require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
const api = require('./lib/api');

app.use(express.json());
app.use(require('cookie-parser')());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Headers', 'content-type');
	res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	if (req.headers.origin)
		res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
	
	next();
});

app.use(['/api', '/u'], api);
app.use('/', express.static('public'));

app.all('*', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.listen(process.env.PORT, () => {
	console.log(`Server started on port ${process.env.PORT}`);
});
