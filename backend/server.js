require('dotenv').config();

const express = require('express');
const app = express();

const cors = require('cors');
const api = require('./lib/api');

app.use(express.json());

app.options('*', cors());
app.use(cors({
	origin(origin, callback) {
		callback(null, true);
	}
}));

app.use('/api', api);
app.use('/', express.static('public'));

app.all('*', (req, res) => {
	res.sendFile('./public/index.html');
});

app.listen(process.env.PORT, () => {
	console.log(`Server started on port ${process.env.PORT}`);
});
