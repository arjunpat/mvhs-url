CREATE TABLE IF NOT EXISTS users (
	email VARCHAR(100) PRIMARY KEY,
	first_name VARCHAR(50),
	last_name VARCHAR(50),
	profile_pic VARCHAR(1000),
	created_time BIGINT UNSIGNED,
	is_suspended BOOLEAN NOT NULL default 0
);
CREATE TABLE IF NOT EXISTS urls (
	id VARCHAR(30) PRIMARY KEY,
	shortened VARCHAR(50),
	redirects_to TEXT,
	created_time BIGINT UNSIGNED,
	expires BIGINT UNSIGNED,
	registered_to VARCHAR(100),
	INDEX (shortened),
	INDEX (registered_to),
	INDEX (created_time)
);
CREATE TABLE IF NOT EXISTS hits (
	db_id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	time BIGINT UNSIGNED,
	url_id VARCHAR(30),
	ip TINYTEXT,
	referrer TINYTEXT,
	email VARCHAR(100),
	qrcode BOOLEAN,
	INDEX (url_id),
	INDEX (email),
	INDEX (time)
)
