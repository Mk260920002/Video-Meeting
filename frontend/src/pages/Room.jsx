import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socketContext";
import { usePeer } from "../context/webrtc";
import { useNavigate } from "react-router-dom";

const Room = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { socket } = useSocket();
  const {
    localStream,
    remoteStream,
    createOffer,
    setupLocalStream,
    setLocalStream,
    setRemoteStream,
    handleNewUser,
    peerConnection,
    setPeerConnection
  } = usePeer();

  const HandleRoomLeave = () => {
    socket.emit("user-leave", { id: socket.id });
    window.location.href = "/"; 
  };
 const HandleNewUserJoined=(data)=>{
    console.log('user-joined' ,data);
    handleNewUser();
 }
  useEffect( () => {
    const setup = async () => {
      console.log("Setting up local stream...");
      await setupLocalStream();
  
      console.log("Local stream is ready. Setting up event listeners.");
      socket.on("other-user-joined", HandleNewUserJoined);
    };
  
    setup();
    const cleanup = async () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }
      socket.off('other-user-joined',HandleNewUserJoined);
    };
    
    
    return cleanup;
  }, []);

  return (
    <div>
      <h1>Welcome to room {roomId}</h1>
      <div>
        {localStream && (
          
          <video
            autoPlay
            playsInline
            ref={(video) => {
              if (video) {
                // Create a new MediaStream with audio muted
                const mutedStream = new MediaStream();
                localStream
                  .getVideoTracks()
                  .forEach((track) => mutedStream.addTrack(track));

                video.srcObject = mutedStream;
              }
            }}
          />
        )}

{remoteStream ? (
  
  <video
    autoPlay
    playsInline
    ref={(video) => {
      if (video) {
        console.log("Setting remote stream video:", remoteStream);
        video.srcObject = remoteStream;
      }
    }}
  />
) : (
  <p>Waiting for remote stream...</p>
)}
      </div>
      <button
        onClick={HandleRoomLeave}
        style={{
          backgroundColor: "red",
          borderRadius: "5px",
          padding: "10px 20px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Leave
      </button>
    </div>
  );
};

export default Room;
