const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ✅ Static Files Serve (Fix for "Cannot GET /")
app.use(express.static(path.join(__dirname, 'public')));

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
