    // server.js (Backend Server)
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PeerServer } = require("peer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 10000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const peerServer = PeerServer({ port: 9000, path: "/" });

let waitingUser = null;

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    if (waitingUser) {
        io.to(socket.id).emit("match", waitingUser);
        io.to(waitingUser).emit("match", socket.id);
        waitingUser = null;
    } else {
        waitingUser = socket.id;
    }

    socket.on("chat message", (msg) => {
        socket.broadcast.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (waitingUser === socket.id) waitingUser = null;
    });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
