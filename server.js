const express = require('express');
const socketIo = require('socket.io');
const structure = require('./structure')

const app = express();

app.use(express.static(__dirname + '/public'));

const httpServer = app.listen(3000);
const io = socketIo(httpServer, {
    cors: {
        origin: '*'
    }
});
io. on('connention', (socket) => {
        let nsData = structure.map((namespace) => {
        return {
            title: namespace.title,
            endpoint: namespace.endpoint
        }
    });
    socket.emit('namespaceLoad', nsData)
});

structure.forEach((namespace) => {
    console.log('new user connected to' + namespace.endpoint);
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        nsSocket.username = nsSocket.handshake.query.username;
        nsSocket.emit('roomLoad', namespace.romms);

        nsSocket.on('joinRoom', (roomName) => {

            let lastRoomName = Array.from(nsSocket.rooms)[1];
            nsSocket.leave(lastRoomName);
            updateOnlineUsers(namespace.endpoint, lastRoomName);

            nsSocket.join(roomName);
            updateOnlineUsers(namespace.endpoint, roomName);

            let roomInfo = namespace.rooms.find((room) => { return room.name === roomName });
            nsSocket.emit('roominformation', roomInfo);
        })

        nsSocket.on('newMessageFromClient', (message) => {
            let currentRoomName = Array.from(nsSocket.rooms)[1];
            let messageStruct = {
                username: nsSocket.username,
                avatar: 'avatar.png',
                text: message,
                time: new Date().toLocalString()
            }
            console.log(messageStruct);
            let room = namespace.rooms.find((room) => { return room.name === currentRoomName })
            room.addMessage(messageStruct);

            io.of(namespace.endpoint).in(room.name).emit('newMessageFromServer', messageStruct);
        })

        nsSocket.on('disconnecting', () => {
            let lastRoomName = Array.from(nsSocket.rooms)[1];
            nsSocket.leave(lastRoomName);
            updateOnlineUsers(namespace.endpoint, lastRoomName);
        })
    })
})

async function updateOnlineUsers(endpoint, roomName){
    let onlineUsers = await io.of(endpoint).in(roomName).allSockets()
    io.of(endpoint).in(roomName).emit('updateOnlineUsers', Array.from(onlineUsers).length);
}