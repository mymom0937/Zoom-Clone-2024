const express = require("express");
const app = express();
// const PORT = 3000;
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const PeerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidv4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", PeerServer);
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// // ****
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    // Broadcast to all other users in the room that a new user has connected
    socket.to(roomId).emit("user-connected", userId);

    socket.on("message", (message) => {
      console.log(`Message received: ${message}`);
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});
// // ***

//  ***************222
// io.on("connection", (socket) => {
//   socket.on("join-room", (roomId, userId) => {
//     socket.join(roomId);
//     // Broadcast to all other users in the room that a new user has connected
//     socket.to(roomId).broadcast.emit("user-connected", userId);
//   });
// });

// ***************222

server.listen(process.env.PORT || 3000);
