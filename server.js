const express = require("express");
const { METHODS } = require("http");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server,{
    cors: {
        origin: "*", // Allow all origins (or specify frontend URL)
        methods: ["GET","POST"]
    }
});

app.use(express.static(path.join(__dirname, "/public")));

io.on("connection", function(socket){
    // socket.on("newuser", function(username){
    //     socket.username = username;
    //     socket.broadcast.emit("update", username + " joined the conversation");
    // });

    // socket.on("exituser", function(username){
    //     socket.broadcast.emit("update", username + " left the conversation");
    // });

    // socket.on("disconnect", function(){
    //     socket.broadcast.emit("update", socket.username + " disconnected");
    // });

    // socket.on("chat", function(message){
    //     socket.broadcast.emit("chat", message);
    // });



    // User joins a room
    socket.on("joinRoom", function({ username, room }){
        socket.join(room);
        socket.broadcast.to(room).emit("update", `${username} joined the chat`);
    });

    // Handle chat messages (Send to the correct room)
    socket.on("chat", function({ username, text, room }){
        // io.to(room).emit("chat", { username, text });
        socket.broadcast.to(room).emit("chat", { username, text });
    });

    // Handle user exit
    socket.on("exituser", function({ username, room }){
        socket.leave(room);
        socket.broadcast.to(room).emit("update", `${username} left the chat`);
    });

    // Handle disconnection
    socket.on("disconnect", function(){
        // No need to broadcast, as the room is already managed above
    });

});

server.listen(5000);
//module.exports = server;
