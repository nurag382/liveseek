const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",  // अगर सिर्फ अपने domain के लिए रखना है तो इसे बदलो
        methods: ["GET", "POST"]
    }
});

let users = {};  

io.on('connection', socket => {
    console.log('New user connected:', socket.id);

    socket.on('join-room', peerId => {
        users[socket.id] = peerId;
        const otherUsers = Object.keys(users).filter(id => id !== socket.id);
        if (otherUsers.length > 0) {
            const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            io.to(randomUser).emit('user-connected', peerId);
            io.to(socket.id).emit('user-connected', users[randomUser]);
        }
    });

    socket.on('send-message', message => {
        console.log("Message received:", message);
        socket.broadcast.emit('receive-message', message);
    });

    socket.on('find-new-partner', () => {
        delete users[socket.id];
        socket.broadcast.emit('partner-left');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];
        socket.broadcast.emit('partner-left');
    });
});

// ✅ Render Port Fix: Use `process.env.PORT`
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
