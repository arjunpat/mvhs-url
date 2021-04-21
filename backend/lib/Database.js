const fs = require('fs');
const mysql = require('mysql');
const helpers = require('./helpers.js');

class Database {

  constructor(user, password, database, host) {
    this.conn = mysql.createConnection({
      user,
      password,
      database,
      host
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

  query(sql, vals) {
    return new Promise((resolve, reject) => {
      this.conn.query(sql, vals, (err, res) => {
        if (err)
          reject(err);

        resolve(res);
      })
    });
  }

  // helper methods
  getUserByEmail(email) {
    return this.query('SELECT * FROM users WHERE email = ?', [ email ]).then(results => {
      if (results.length !== 1) return false;

      return results[0];
    });
  }

  getLatestUrlByShortened(shortened) {
    return this.query('SELECT * FROM urls WHERE shortened = ? ORDER BY created_time DESC LIMIT 1', [ shortened ]).then(results => {
      if (results.length !== 1) return false;
      
      return results[0];
    });
  }

  getUrlSummaryById(id) {
    return this.query('SELECT shortened, redirects_to, created_time, expires, registered_to, (SELECT COUNT(*) FROM hits WHERE url_id = id) as clicks, (SELECT COUNT(*) FROM hits WHERE url_id = id AND qrcode = true) as qrcode_clicks FROM urls WHERE id = ?', [ id ]).then(result => {
      if (result.length !== 1) return false;

      return result[0];
    });
  }

  getUrlSummaryByEmail(email) {
    return this.query('SELECT id, shortened, redirects_to, created_time, expires, (SELECT COUNT(*) FROM hits WHERE url_id = id) as clicks FROM urls WHERE registered_to = ?', [ email ]);
  }

  getHistoryByEmail(email, before) {
    return this.query(`
      SELECT h.time, h.qrcode, u.shortened, u.redirects_to, u.expires, a.first_name, a.last_name
      FROM hits h
        LEFT JOIN urls u ON h.url_id = u.id
        LEFT JOIN users a ON u.registered_to = a.email
      WHERE h.email = ? AND h.time < ?
      ORDER BY h.db_id DESC LIMIT 5`, [email, before])
  }

  getAllUrls() {
    return this.query('SELECT * FROM urls');
  }

  getAllUsers() {
    return this.query('SELECT * FROM users');
  }

  getHitsCountAfter(time) {
    return this.query('SELECT COUNT(*) FROM hits WHERE time > ?', [time]).then(res => res[0]['COUNT(*)']);
  }

  getUrlById(id) {
    return this.query('SELECT * FROM urls WHERE id = ?', [id]);
  }
  
  toggleSuspension(email) {
    return this.query('UPDATE users SET is_suspended = !is_suspended WHERE email = ?', [ email ]);
  }

  createNewUser(d) {
    return this.query(
      'INSERT INTO users (email, first_name, last_name, profile_pic, created_time) VALUES (?, ?, ?, ?, ?)',
      [d.email, d.first_name, d.last_name, d.profile_pic, helpers.getTime()],
    );
  }

  createNewHit(d) {
    return this.query(
      'INSERT INTO hits (time, url_id, ip, referrer, email, qrcode) VALUES (?, ?, ?, ?, ?, ?)',
      [d.time, d.url_id, d.ip, d.referrer, d.email, d.qrcode]
    );
  }

  createNewUrl(d) {
    return this.query(
      'INSERT INTO urls (id, shortened, redirects_to, created_time, expires, registered_to) VALUES (?, ?, ?, ?, ?, ?)',
      [d.id, d.shortened, d.redirects_to, d.now, d.expires, d.registered_to]
    );
  }

  cancelUrlById(id) {
    return this.query('UPDATE urls SET expires = ? WHERE id = ?', [ helpers.getTime(), id ]);
  }

  updateUser(vals) {
    return this.query(
      'UPDATE users SET first_name = ?, last_name = ?, profile_pic = ? WHERE email = ?',
      [vals.first_name, vals.last_name, vals.profile_pic, vals.email]
    );
  }

  removeFromHistory(email, time) {
    return this.query('UPDATE hits SET email = NULL WHERE email = ? AND time = ?', [email, time]);
  }
}

module.exports = Database;
