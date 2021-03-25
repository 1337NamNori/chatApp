const config = require('./config');
let mysql = require('mysql');
let sqlstring = require('sqlstring');


let conn = null;


function connect() {
    if (conn != null) return;

    let __conn = mysql.createConnection({
        host: config.database.host,
        user: config.database.username,
        password: config.database.password,
        database: config.database.schema,
        port: config.database.port,
    });

    __conn.on('error', err => {
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            // set to null to reconnect in the next query
            console.log('Database connection lost');
            conn = null;
        } else throw err;
    });

    return new Promise((resolve, reject) => {
        __conn.connect(err => {
            if (err) reject(err);
            else {
                conn = __conn;
                resolve();
            }
        });
    });
}

function escape(s) {
    return sqlstring.escape(s);
}

function query(sql, args) {
    if (conn == null) {
        console.log('Database connection not ready, connecting...');
        return connect().then(result => {
            return query(sql, args);
        });
    }

    return new Promise((resolve, reject) => {
        conn.query(sql, args, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

module.exports = {
    connect: connect,
    escape: escape,
    query: query,
};