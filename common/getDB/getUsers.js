const db = require('../database.js')

let users = getUsers()

async function getUsers() {
    let rows = await db.query("SELECT * FROM users")
    return rows
}

module.exports = users