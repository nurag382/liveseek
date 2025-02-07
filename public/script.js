const socket = io();
const peer = new Peer();
const videoContainer = document.getElementById("video-container");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

let localStream;
let myPeerId;

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localStream = stream;
        const video = document.createElement("video");
        video.srcObject = stream;
        video.muted = true;
        video.autoplay = true;
        videoContainer.appendChild(video);
    })
    .catch(err => console.error("Error accessing media: ", err));

peer.on("open", id => {
    myPeerId = id;
    socket.emit("join-room", id);
});

socket.on("user-connected", userId => {
    const call = peer.call(userId, localStream);
    call.on("stream", userVideoStream => addVideo(userVideoStream));
});

peer.on("call", call => {
    call.answer(localStream);
    call.on("stream", userVideoStream => addVideo(userVideoStream));
});

function addVideo(stream) {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    videoContainer.appendChild(video);
}

sendBtn.addEventListener("click", () => {
    const message = messageInput.value;
    if (message.trim() !== "") {
        socket.emit("send-message", message);
        appendMessage("You: " + message);
        messageInput.value = "";
    }
});

socket.on("receive-message", message => {
    appendMessage("Stranger: " + message);
});

function appendMessage(message) {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}
