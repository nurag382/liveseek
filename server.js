const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidV4 } = require("uuid");
const cors = require("cors");
const { ExpressPeerServer } = require("peer");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.static("public")); // Serve static frontend files

// Setup PeerJS Server
const peerServer = ExpressPeerServer(server, { debug: true });
app.use("/peerjs", peerServer);

// Homepage Route
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Handle User Connections
io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    });

    // Handle Chat Messages
    socket.on("send-message", (message) => {
        io.emit("receive-message", message);
    });
});

// Start Server
server.listen(3000, () => console.log("Server running on http://localhost:3000"));
