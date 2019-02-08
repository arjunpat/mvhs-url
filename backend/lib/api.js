const router = require('express').Router();
const responses = require('./responses');
const Database = require('./Database');

const database = new Database(
	process.env.MYSQL_USER,
	process.env.MYSQL_PASS,
	process.env.MYSQL_DB,
	process.env.MYSQL_Host
);


module.exports = router;
