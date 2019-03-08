require('dotenv').config();

const express = require('express');
const app = express();

const Database = require('./lib/Database');
const HttpToken = require('./lib/HttpToken');

const {
  MYSQL_USER,
  MYSQL_PASS,
  MYSQL_DB,
  MYSQL_HOST,
  ENCRYPTION_SECRET,
  INIT_VECTOR,
  CLIENT_SECRET,
  ADMIN_EMAILS
} = process.env;
const database = new Database(
  MYSQL_USER,
  MYSQL_PASS,
  MYSQL_DB,
  MYSQL_HOST
);
const adminEmails = ADMIN_EMAILS.split(',');
const httpToken = new HttpToken(ENCRYPTION_SECRET, INIT_VECTOR, CLIENT_SECRET);

const api = require('./lib/api')(httpToken, database, adminEmails);
const adminApi = require('./lib/admin-api')(httpToken, database, adminEmails);
const urlHandler = require('./lib/url-handler')(httpToken, database, adminEmails);

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

app.use('/api', api);
app.use('/api/admin', adminApi);
app.use('/', express.static('public'));
app.get('/oauth', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use('/', urlHandler);
app.all('*', (req, res) => {
  res.redirect(302, '/#/not-found');
});

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
