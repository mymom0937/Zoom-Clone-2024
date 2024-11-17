// const socket = io();
const socket = io("http://localhost:3000"); // Explicitly specify the server URL

const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443", // Ensure the correct port:"3000",
});

const peers = {};
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

let myVideoStream;

// Access the user's media (video and audio)
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // Listen for calls and answer them with the local stream
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // Listen for new users joining the room
    socket.on("user-connected", (userId) => {
      console.log("New user connected:", userId);
      connectToNewUser(userId, stream);
    });

    // Chat functionality
    // const textInput = $("#chat_message");
    // $("html").keydown((e) => {
    //   if (e.which === 13) {
    //     // Enter key
    //     console.log("Enter key pressed");
    //     if (textInput.val().length !== 0) {
    //       console.log("Message to send:", textInput.val());
    //       socket.emit("message", textInput.val());
    //       textInput.val("");
    //     }
    //   }
    // });

    const textInput = document.getElementById("chat_message");
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && textInput.value.trim() !== "") {
        console.log("Message to send:", textInput.value);
        socket.emit("message", textInput.value);
        textInput.value = "";
      }
    });

    // Listen for new messages and add them to the chat
    // socket.on("createMessage", (message) => {
    //   console.log("New message received:", message);
    //   $("ul.message").append(
    //     `<li class="message"><b>User:</b><br/>${message}</li>`
    //   );
    // });

    // Listen for new messages and add them to the chat
    socket.on("createMessage", (message) => {
      console.log("New message received:", message);
      const messageList = document.querySelector("ul.message"); // Get the list element
      const newMessage = document.createElement("li"); // Create a new list item
      newMessage.className = "message"; // Add the class
      newMessage.innerHTML = `<b>User</b><br/>${message}`; // Set the content
      messageList.appendChild(newMessage); // Append to the list
    });
  });

// Emit the peer ID when the connection is established
myPeer.on("open", (id) => {
  console.log("Peer connected with ID:", id);
  socket.emit("join-room", ROOM_ID, id);
});

// Handle user disconnections
socket.on("user-disconnected", (userId) => {
  console.log("User disconnected:", userId);
  if (peers[userId]) {
    peers[userId].close();
  }
});

// Add video stream to the grid
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

// Connect to a new user and share the video stream
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

const muteUnmute = () => {
  let enabled = myVideoStream.getAudioTracks()[0].enabled;
  console.log(myVideoStream.getAudioTracks());
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i>
  <span>Stop Video</span>`;
  document.querySelector(".main_video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `<i class="stop fas fa-video-slash"></i>
  <span>Play Video</span>`;
  document.querySelector(".main_video_button").innerHTML = html;
};

const setMuteButton = () => {
  const html = `<i class="fas fa-microphone"></i>
  <span>Mute</span>`;
  document.querySelector(".main_mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fas fa-microphone-slash"></i>
  <span>Unmute</span>`;
  document.querySelector(".main_mute_button").innerHTML = html;
};