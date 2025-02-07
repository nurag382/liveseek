const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { PeerServer } = require("peer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 🔹 PORT Fix
const PORT = process.env.PORT || 10000;

// 🔹 Static Files Serve Karo
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Home Page Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔹 PeerJS Server
const peerServer = PeerServer({ port: 9000, path: "/" });

// 🔹 WebSocket Connection (FIXED)
io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    // Join Room
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);
    });

    // Chat Message Event (FIXED)
    socket.on("chat message", (msg) => {
        console.log("Message received:", msg);
        io.emit("chat message", msg); // Broadcast message
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// 🔹 Start Server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
