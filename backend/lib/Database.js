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
                console.log(val)
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
        return this.query('SELECT * FROM urls WHERE shortened = ?', [ shortened ]).then(results => {
            if (results.length !== 1) return false;
            
            return results[0];
        });
    }

    createNewUser(d) {
        return this.query(
            'INSERT INTO users (email, first_name, last_name, profile_pic, created_time) VALUES (?, ?, ?, ?, ?)',
            [d.email, d.first_name, d.last_name, d.profile_pic, Date.now()],
        );
    }

    createNewHit(d) {
        return this.query(
            'INSERT INTO hits (time, url, ip, referrer) VALUES (?, ?, ?, ?)',
            [Date.now(), d.url, d.ip, d.referrer]
        );
    }

    createNewUrl(d) {
        return this.query(
            'INSERT INTO urls (shortened, redirects_to, created_time, expires, registered_to) VALUES (?, ?, ?, ?, ?)',
            [d.shortened, d.redirects_to, Date.now(), d.expires, d.registered_to]
        );
    }

    updateUser(vals) {
        return this.query(
            'UPDATE users SET first_name = ?, last_name = ?, profile_pic = ? WHERE email = ?',
            [vals.first_name, vals.last_name, vals.profile_pic, vals.email]
        );
    }
}

module.exports = Database;
