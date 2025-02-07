const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { PeerServer } = require('peer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"]
    }
});

// 🔹 Render Ke Liye Port Fix
const PORT = process.env.PORT || 10000; // Default port 10000 use kar lo

// 🔹 Public Folder Serve Karna
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Home Page Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🔹 PeerJS Server
const peerServer = PeerServer({ port: 9000, path: '/' });

// 🔹 WebSocket Connection
io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// 🔹 Server Start
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
