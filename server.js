const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static('public'));

let waitingUser = null;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    if (waitingUser) {
        io.to(socket.id).emit('user-connected', waitingUser);
        io.to(waitingUser).emit('user-connected', socket.id);
        waitingUser = null;
    } else {
        waitingUser = socket.id;
    }

    socket.on('send-message', (message) => {
        socket.broadcast.emit('receive-message', message);
    });

    socket.on('find-new-partner', () => {
        waitingUser = socket.id;
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (waitingUser === socket.id) {
            waitingUser = null;
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
