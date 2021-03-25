const socket_io = require('socket.io');
const moment = require('moment');
const { getUserById } = require('./functions.js')
let io = socket_io();
let socketAPI = {};
let userList = [];


socketAPI.io = io;

io.on('connection', async (socket) => {
    const users = await require('./getDB/getUsers.js')
    // console.log("connected! id: ", socket.id);
    // handle when user log in
    socket.on('log-in', userID => {

        let isUserExist = userList.some(user => user.userID == userID)
        if (!isUserExist) {
            let newUser = {
                id: socket.id,
                userID,
                ...getUserById(users, userID),
                user_isOnline: 1,
                user_password: null,
            }
            userList.push(newUser)

            socket.broadcast.emit('new-user-log-in', newUser)
        }
        io.to(socket.id).emit('render-user-list', userList)

    })

    // handle when user log out
    socket.on('disconnect', () => {
        let index = userList.findIndex(user => user.id === socket.id)
        if (index > -1) {
            let userID = userList[index].userID
            userList.splice(index, 1)
            io.emit('disconnect-user', userID)
        }
    })

    socket.on('user-send-message', ({ userID, toID, message, time }) => {
        console.log(userID, toID, message, time)
        let receiveUser = userList.find(user => user.userID == toID)
        let sendUser = userList.find(user => user.userID == userID)
        io.to(receiveUser.id).emit('receive-message',{sendID:userID, message, time})
    })

})

io.on('disconnect', async (socket) => {

})

module.exports = {
    socketAPI,
    userList
}
