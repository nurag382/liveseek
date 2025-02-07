const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { PeerServer } = require('peer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Public folder ko static serve karna
app.use(express.static('public'));

// PeerJS server setup
const peerServer = PeerServer({ port: 9000, path: '/' });

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
`
