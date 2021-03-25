function getUserById(users, id) {
    return users.find(user => user.user_id == id)
}

function getUserByUsername(users, username) {
    return users.find(user => user.username == username)
}

function getUserNameById(users,id) {
    return getUserById(users,id)['user_fullname'] || getUserById(users,id)['username'] 
}

module.exports = {
    getUserById,
    getUserByUsername,
    getUserNameById,
}

