import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socketContext";
import { usePeer } from "../context/webrtc";
import LocalVideo from "./LocalVideo"; // Import the component we created above

const Room = () => {
  const { roomId } = useParams();
  const { socket } = useSocket();
  const {
    localStream,
    remoteStream,
    setupLocalStream,
    handleNewUser,
    switchCamera,
    canFlip
  } = usePeer();

  useEffect(() => {
    setupLocalStream();
    socket.on("other-user-joined", handleNewUser);
    return () => {
      socket.off("other-user-joined", handleNewUser);
    };
  }, []);

  const HandleRoomLeave = () => {
    socket.emit("user-leave", { id: socket.id });
    window.location.href = "/";
  };

  return (
    <div className="room-container">
      <h1>Welcome to <span>Room {roomId}</span></h1>
      <div className="video-container">
        {/* Pass necessary data to the isolated component */}
        {localStream && (
          <LocalVideo 
            localStream={localStream} 
            canFlip={canFlip} 
            switchCamera={switchCamera} 
          />
        )}

        {remoteStream ? (
          <div className="remote-video">
            <video
              autoPlay
              playsInline
              ref={(v) => { if (v) v.srcObject = remoteStream; }}
            />
            <p>Remote Video</p>
          </div>
        ) : (
          <p>Waiting for remote stream...</p>
        )}
      </div>
      <button className="leave-button" onClick={HandleRoomLeave}>Leave</button>
    </div>
  );
};

export default Room;