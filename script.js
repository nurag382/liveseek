const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

const peer = new Peer(undefined, { host: "/", port: 3000, path: "/peerjs" });

let myStream;

// Get video & audio permissions
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        myStream = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", call => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", userStream => addVideoStream(video, userStream));
        });

        socket.on("user-connected", userId => {
            connectToNewUser(userId, stream);
        });
    })
    .catch(error => console.error("Error accessing media:", error));

// PeerJS - Generate unique ID
peer.on("open", id => {
    socket.emit("join-room", "1234", id); // Static room for testing
});

socket.on("user-disconnected", userId => {
    console.log("User disconnected:", userId);
});

// Connect new user
function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", userStream => addVideoStream(video, userStream));
}

// Add video to grid
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => video.play());
    videoGrid.appendChild(video);
}

// Handle chat messages
function sendMessage() {
    const message = document.getElementById("messageInput").value;
    socket.emit("send-message", message);
    document.getElementById("messageInput").value = "";
}

socket.on("receive-message", message => {
    const messages = document.getElementById("messages");
    const msgElement = document.createElement("p");
    msgElement.textContent = message;
    messages.appendChild(msgElement);
});
