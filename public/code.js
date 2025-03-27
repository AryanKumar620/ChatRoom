(function(){
    const app = document.querySelector(".app");
    const socket = io();

    let uname;
    let room;

    // Join chat
    app.querySelector(".join-screen #join-user").addEventListener("click", function(){
        let username = app.querySelector(".join-screen #username").value;
        let roomName = app.querySelector(".join-screen #room-name").value;

        if(username.length == 0 || roomName.length == 0) {
            return;
        }
        uname = username;
        room = roomName;

        socket.emit("newuser", uname);
        // Emit event to join a specific room
        socket.emit("joinRoom", { username: uname, room: room });

        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    // Send message when clicking the "Send" button
    app.querySelector(".chat-screen #send-message").addEventListener("click", sendMessage);

    // Send message when pressing "Enter" key
    app.querySelector(".chat-screen #message-input").addEventListener("keypress", function(event){
        if (event.key === "Enter") {
            event.preventDefault(); // Prevents new line in the input field
            sendMessage();
        }
    });

    // Function to send message
    function sendMessage() {
        let messageInput = app.querySelector(".chat-screen #message-input");
        let message = messageInput.value.trim();

        if(message.length == 0) {
            return;
        }

        renderMessage("my", {
            username: uname,
            text: message
        });

        // Send message to the specific room
        socket.emit("chat", { username: uname, text: message, room: room });

        messageInput.value = ""; // Clear input field after sending
    }

    // Listen for messages in a room
    socket.on("chat", function(data){
        renderMessage("other", data);
    });

    // Listen for updates (join/leave messages)
    socket.on("update", function(message){
        renderMessage("update", message);
    });

    // Listen for user disconnection
    socket.on("user-disconnected", function(username){
        renderMessage("update", `${username} left the chat`);
    });

    // Exit chat
    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function(){
        socket.emit("exituser", { username: uname, room: room });
        window.location.href = window.location.href;
    });

    // Function to render messages
    function renderMessage(type, message){
        let messageContainer = app.querySelector(".chat-screen .messages");
        let el = document.createElement("div");

        if(type === "my") {
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
            <div>
                <div class="name">You</div>
                <div class="text">${message.text}</div>
            </div>
            `;
        } else if(type === "other") {
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
            <div>
                <div class="name">${message.username}</div>
                <div class="text">${message.text}</div>
            </div>
            `;
        } else if(type === "update") {
            el.setAttribute("class", "update");
            el.innerText = message;
        }

        messageContainer.appendChild(el);
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
})();
