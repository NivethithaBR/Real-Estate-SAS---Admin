const { Server } = require("socket.io");
const corsOptions = require("../config/CorsOptions");
const {connectedUsers} = require("./connectedUsers");

let io;
function initSocket(server) {
  io = new Server(server, { cors: corsOptions });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.user_id;

    if (userId) {
      connectedUsers[userId] = socket.id;
    }

    console.log("Connected Users:", connectedUsers);

    socket.on("disconnect", () => {
      for (const [uid, sid] of Object.entries(connectedUsers)) {
        if (sid === socket.id) delete connectedUsers[uid];
      }
    });
  });

  return { io, connectedUsers };
}

function useIo(){
  if(io){
    console.log("Socket in connection")
      return io;

  }else{
    console.log("Socket not connected")
  }
}

module.exports = {initSocket,useIo};
