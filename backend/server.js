const express = require('express');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS for both Express and Socket.IO
app.use(cors());

// Body parser middleware for JSON requests
app.use(bodyParser.json());

// Create the HTTP server
const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

// defining of map for storing number people prsent in perticular room
const myMap=new Map();
const SocketToRoomId= new Map();
function Increment(key,value) {
  // Check if the key exists in the Map
  if (myMap.has(key)) {
    // Increment the existing value by 1
    myMap.set(key, myMap.get(key) + value);
  } else {
    // If the key doesn't exist, initialize it with 1
    myMap.set(key, 1);
  }
}

function Decrement(key,value) {
  // Check if the key exists in the Map
  if (myMap.has(key)) {
    // Increment the existing value by 1
    myMap.set(key, myMap.get(key) + value);
  } 
}
// Create the Socket.IO server (attached to the existing HTTP server)
const io = socketio(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle Socket.IO events here
  socket.on("join-room", (data) => {
    const { name, email, roomId } = data;
      let is_room_full=false;
     if(myMap.has(roomId)){

      let curr_count=myMap.get(roomId);
      if(curr_count==2){
        socket.emit("room-full");
        is_room_full=true;
      }
      else Increment(roomId,1);
     }
     else myMap.set(roomId,1);

    SocketToRoomId.set(socket.id,roomId);
    // console.log(socket.id);
    // console.log(myMap.get(roomId));
    if(!is_room_full){
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('other-user-joined', { name, email });
    socket.emit('user-joined',{roomId});
    }
    
    // console.log(`User ${name} joined room ID ${roomId}`);
  });
// listner for sharing offer between two user that present in same room

    socket.on('offer',(offer)=>{
      // console.log('oofer is', offer);
      const roomId=SocketToRoomId.get(socket.id);
      socket.broadcast.to(roomId).emit('offer',offer);
    })
 // listner for exchanging answers
  
 socket.on('answer',(answer)=>{
  const roomId=SocketToRoomId.get(socket.id);
  socket.broadcast.to(roomId).emit('answer',answer);
})

// listner for sharing iceCandidate

 socket.on('iceCandidate', (candidate)=>{
 // console.log('icecandidate', candidate);
  const roomId=SocketToRoomId.get(socket.id);
  socket.broadcast.to(roomId).emit('iceCandidate',candidate);
 
 })
  socket.on('user-leave',data=>{
    const {id}=data;
    if(SocketToRoomId.has(id)){
      Decrement(SocketToRoomId.get(id),-1);
      // console.log('user-leave',id,SocketToRoomId.get(id));
      SocketToRoomId.delete(id);
    }
   
    
  })
  // Handle disconnections
  socket.on("disconnect", () => {
    if(SocketToRoomId.has(socket.id)){
      Decrement(SocketToRoomId.get(socket.id),-1);
      SocketToRoomId.delete(socket.id);
    }

    console.log('A user disconnected');
  });
  
});
