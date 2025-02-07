// public/script.js (Frontend Logic)
const socket = io();
const peer = new Peer(undefined, {
    host: "your-peer-server.com", // Replace with actual PeerJS server
    port: 9000,
    path: "/peer"
});

let myStream;
let currentPeer;
let myId;

peer.on("open", (id) => {
    myId = id;
    socket.emit("join", id);
});

socket.on("match", (userId) => {
    console.log("Matched with", userId);
    connectToNewUser(userId);
});

function connectToNewUser(userId) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            myStream = stream;
            const call = peer.call(userId, stream);
            call.on("stream", (userStream) => {
                addVideoStream(userStream);
            });
            currentPeer = call;
        });
}

peer.on("call", (call) => {
    call.answer(myStream);
    call.on("stream", (userStream) => {
        addVideoStream(userStream);
    });
    currentPeer = call;
});

function addVideoStream(stream) {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    document.getElementById("video-container").append(video);
}

document.getElementById("send-btn").addEventListener("click", () => {
    const message = document.getElementById("message-input").value;
    socket.emit("chat message", { message, to: currentPeer.peer });
});

socket.on("chat message", ({ message }) => {
    const chatBox = document.getElementById("chat-box");
    const msgElement = document.createElement("p");
    msgElement.innerText = message;
    chatBox.append(msgElement);
});
