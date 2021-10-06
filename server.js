const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000);
app.use(express.static(path.join(__dirname, 'public')));

// - listeners
let connectedUsers = [];

io.on('connection', (socket) => {
    console.log("Conexão estabelecida");

    socket.on('join-request', (username) => {
        socket.username = username;
        connectedUsers.push(username);

        socket.emit('user-ok', connectedUsers);
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });
    });

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter( u => u != socket.username );

        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });

    socket.on('send-message', (msg) => {
        let obj = {
            sender: socket.username,
            message: msg
        }
        socket.emit('show-message', obj);
        socket.broadcast.emit('show-message', obj);
    });
});
