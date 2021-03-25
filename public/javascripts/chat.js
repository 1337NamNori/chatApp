import { getUserNameById } from './fe_functions.js'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)


let socket = io();
let userList = []

// get element nodes
const inputField = $('.messages__input')
const sendBtn = $('.messages__send')
const historyList = $('.history__list')
const activeList = $('.active__list')
const messagesBoxNav = $('.nav-mess')
const messagesBox = $('.messages__wrap')
const navName = $('.nav-mess__user-name')
let activeUsers = $$('.active__item')



// console.log(activeUsers)


//  functions
function renderAvtiveUserList(userList, userID) {
    let output = ''
    userList.map(user => {
        if (user.userID == userID) return
        output += `
                <li class="active__item" id="user-${user.userID}">
                    <div class="active__avatar-wrap">
                        ${(typeof user === 'undefined' || !user.user_avatar) ?
                '<img src="/images/user_avatar.png" alt="" class="history__user-img">'
                : '<img src="/images/steve.jpg" alt="" class="history__user-img">'} 
                    </div>
                    <p class="active__username">
                        ${user.user_fullname ? user.user_fullname : user.username}
                    </p>
                </li>
        `
    })
    if (output !== '') {
        $('.active__wrap').classList.remove('active__wrap--empty')

    }
    activeList.innerHTML = output
}
function renderNewAvtiveUser(user) {
    $('.active__wrap').classList.remove('active__wrap--empty')


    let output = `
                <li class="active__item" id="user-${user.userID}">
                    <div class="active__avatar-wrap">
                        ${(typeof user === 'undefined' || !user.user_avatar) ?
            '<img src="/images/user_avatar.png" alt="" class="history__user-img">'
            : '<img src="/images/steve.jpg" alt="" class="history__user-img">'} 
                    </div>
                    <p class="active__username">
                        ${user.user_fullname ? user.user_fullname : user.username}
                    </p>
                </li>
    `
    activeList.innerHTML += output
}

function sendMessage(userID, toID, message) {
    message = message.trim()
    if (message === '') return
    let isContinue = false
    if ($('.messages__wrap').firstElementChild) {
        isContinue = $('.messages__wrap').firstElementChild.classList.contains('messages__outgoing')
    }
    console.log(isContinue)
    let time = moment()
    console.log(time)
    let newMsgItem = `<li title="${moment(time).format('HH:mm')}" class="messages__sent messages__outgoing-item">${message}</li>`

    if (isContinue) {
        let outgoingMsgList = $('.messages__wrap').firstElementChild.firstElementChild
        outgoingMsgList.innerHTML = newMsgItem + outgoingMsgList.innerHTML
    } else {
        let newOutgoing = `
            <div class="messages__outgoing">
                <ul class="messages__outgoing-list">
                   ${newMsgItem}
                </ul>
            </div>
            `
        $('.messages__wrap').innerHTML = newOutgoing + $('.messages__wrap').innerHTML
    }

    if ($('.messages__seen')) $('.messages__seen').remove()
    inputField.value = ''
    inputField.focus()
    socket.emit('user-send-message', { userID, toID, message, time })
}

function receiveMessage(sendID, message, time) {
    if ($(`.messages__wrap#box-user-${sendID}`)) {
        let isContinue = false
        if ($('.messages__wrap').firstElementChild) {
            isContinue = $('.messages__wrap').firstElementChild.classList.contains('messages__incoming')
        }
        console.log(isContinue)
        let newMsgItem = `<li title="${moment(time).format('HH:mm')}" class="messages__sent messages__incoming-item">${message}</li>`

        if (isContinue) {
            let incomingMsgList = $('.messages__wrap').firstElementChild.firstElementChild
            incomingMsgList.innerHTML = newMsgItem + incomingMsgList.innerHTML
        } else {
            let newIncoming = `
                <div class="messages__incoming">
                    <ul class="messages__incoming-list">
                       ${newMsgItem}
                    </ul>
                </div>
                `
            $('.messages__wrap').innerHTML = newIncoming + $('.messages__wrap').innerHTML
        }
    }
    // socket.emit('user-send-message', { userID, toID, message, time })
}

function disconnectUser(userID) {
    let disconnectUserElement = $(`#user-${userID}`)
    if (disconnectUserElement) {
        disconnectUserElement.remove()
    }
}
function selectBox() {
    activeUsers.forEach((activeUser, index) => {
        activeUser.onclick = function () {
            switchToBox(activeUser.id.split('-')[1])
        }
    })
}
function switchToBox(userID) {
    messagesBoxNav.id = `nav-user-${userID}`
    navName.textContent = getUserNameById(userList, userID)
    messagesBox.id = `box-user-${userID}`
}

// --------------- END FUNCTION -----------------



// event listener DOM
inputField.onkeyup = function (e) {
    if (e.keyCode === 13) {
        let toID = messagesBox.id.split('-')[2]
        sendMessage(userID, toID, this.value)
    }
}
sendBtn.onclick = function () {
    let toID = messagesBox.id.split('-')[2]
    sendMessage(userID, toID, inputField.value)
}
// ---------------- END DOM ----------------


// SOCKET.IO LOGIC HERE

// login
socket.emit('log-in', userID)
socket.on('new-user-log-in', newUser => {
    // console.log(newUser)
    // console.log(userList)
    renderNewAvtiveUser(newUser)
    activeUsers = $$('.active__item')
    userList.push(newUser)
    selectBox()
})
socket.on('render-user-list', newUserList => {
    // console.log(userList)
    userList = newUserList
    renderAvtiveUserList(userList, userID)
    activeUsers = $$('.active__item')
    selectBox()
})

// when a user log out
socket.on('disconnect-user', userID => {
    disconnectUser(userID)
})

// receive message
socket.on('receive-message', ({ sendID, message, time }) => {
    receiveMessage(sendID, message, time)
})

// ------------------- END SOCKET.IO ---------------------











