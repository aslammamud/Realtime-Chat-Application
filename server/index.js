const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { adduser,removeUser,getUser,getUserInRoom } = require('./users.js');

const PORT = process.env.PORT || 5000;
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connecton',(socket) => {
  socket.on('join',({ name, room }, callback) =>{
    const { error,user } = adduser({ id: socket.id,name,room });

    if(error) return callback(error);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined `});
    socket.join(user.room);

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name , text: message});

    callback();
  });

  socket.on('disconnect',() => {
    console.log('User left');
  });
});

app.use(router);
server.listen(PORT, ()=> console.log(`Server has started on port ${PORT}`));
