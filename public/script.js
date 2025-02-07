const socket = io();

// 🔹 Chat Messages Send Karo
document.getElementById("sendBtn").addEventListener("click", () => {
    let message = document.getElementById("messageInput").value;
    if (message.trim() !== "") {
        socket.emit("chat message", message);
        document.getElementById("messageInput").value = "";
    }
});

// 🔹 Chat Messages Receive Karo
socket.on("chat message", (msg) => {
    let chatBox = document.getElementById("chatBox");
    let messageElement = document.createElement("p");
    messageElement.textContent = msg;
    chatBox.appendChild(messageElement);
});
