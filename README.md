# Video Chat Application

A real-time video chat application that enables seamless peer-to-peer communication between users using WebRTC and Node.js. Users can join a room and start video calls by simply sharing a unique room ID.  

## Features

- Real-time video and audio streaming using **WebRTC**.  
- Simple room-based system: users can join a call by sharing the same room ID.  
- Responsive user interface built with **React**.  
- Backend signaling server using **Node.js** and **Socket.IO** to manage room creation and media negotiation.  
- Automatic handling of ICE candidates for reliable media exchange.  
- Clean disconnection logic when users leave a room.  

## Tech Stack

- **Frontend**: React, Context API  
- **Backend**: Node.js, Socket.IO  
- **Real-Time Communication**: WebRTC  
- **Styling**: CSS  
- **Development Tools**: VSCode, npm  

## Installation and Setup


   ```
    git clone https://github.com/Mk260920002/Video-Meeting.git
  
   ```
   ```
    cd Video-Meeting
   ```
   ```
   cd frontend
   ```
   ```
   npm install
   ```
   ```
   cd ..
   ```
   ```
   cd backend
   ```
   ```
  npm install
  ```
  ```
  npm start
  ```
  ```
  cd ..
  ```
  ```
  cd frontend
 ```
 ```
  npm start
 ```
 Now copy the below url and paste it into your browser
 ```
 http://localhost:3000
 ```

## How to Use

1. **Join a Room**:
   - Enter your **Name**, **Email**, and a **Room ID** (this can be any unique identifier, shared between users to connect).
   - Click on the **Join Room** button.

2. **Connect with Another User**:
   - Share the same **Room ID** with another user.
   - Both users will automatically connect to each other, and video/audio streams will begin once both are in the same room.

3. **Leave the Room**:
   - Press the **Leave** button to exit the room and disconnect from the call.
