const fs = require('fs');
const mysql = require('mysql');

class Database {

	constructor(user, password, database, host) {
		this.conn = mysql.createConnection({
			user,
			password,
			database,
			host
		});

		this.query = (sql, vals) => new Promise((resolve, reject) => {
			this.conn.query(sql, vals, (err, res) => {
				if (err)
					reject(err);

				resolve(res);
			})
		});

		let sql = fs.readFileSync(__dirname + '/../setup.sql').toString().split(';');

		for (let i = 0; i < sql.length; i++) {
			if (!sql[i])
				continue;

			this.query(sql[i], []).then(val => {
				// console.log(val)
			}).catch(err => {
				console.log(err);
				process.exit(1);
			});
		}
		
	}

	// helper methods
	getUserByEmail(email) {
		return this.query('SELECT * FROM users WHERE email = ?', [ email ]).then(results => {
			if (results.length !== 1) return false;

			return results[0];
		});
	}

	getUrlByShortened(shortened) {
		return this.query('SELECT * FROM urls WHERE shortened = ? ORDER BY created_time DESC LIMIT 1', [ shortened ]).then(results => {
			if (results.length !== 1) return false;
			
			return results[0];
		});
	}

	getUrlById(id) {
		return this.query('SELECT * FROM urls WHERE id = ?', [ id ]).then(result => {
			if (result.length !== 1) return false;

			return result[0];
		});
	}

	getUrlsByEmail(email) {
		return this.query('SELECT * FROM urls WHERE registered_to = ?', [ email ]);
	}
	
	getHitsByEmail(email) {
		return this.query(
			'SELECT * FROM hits WHERE url_id IN (SELECT id FROM urls WHERE registered_to = ?)',
			[ email ]
		);
	}

	getHitsByUrlId(id) {
		return this.query('SELECT * FROM hits WHERE url_id = ?', [ id ]);
	}

	createNewUser(d) {
		return this.query(
			'INSERT INTO users (email, first_name, last_name, profile_pic, created_time) VALUES (?, ?, ?, ?, ?)',
			[d.email, d.first_name, d.last_name, d.profile_pic, Date.now()],
		);
	}

	createNewHit(d) {
		return this.query(
			'INSERT INTO hits (time, url_id, ip, referrer) VALUES (?, ?, ?, ?)',
			[d.time, d.url_id, d.ip, d.referrer]
		);
	}

	createNewUrl(d) {
		return this.query(
			'INSERT INTO urls (id, shortened, redirects_to, created_time, expires, registered_to) VALUES (?, ?, ?, ?, ?, ?)',
			[d.id, d.shortened, d.redirects_to, d.now, d.expires, d.registered_to]
		);
	}

	cancelUrlById(id) {
		return this.query('UPDATE urls SET expires = ? WHERE id = ?', [ Date.now(), id ]);
	}

	updateUser(vals) {
		return this.query(
			'UPDATE users SET first_name = ?, last_name = ?, profile_pic = ? WHERE email = ?',
			[vals.first_name, vals.last_name, vals.profile_pic, vals.email]
		);
	}
}

module.exports = Database;
