import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socketContext";
import { usePeer } from "../context/webrtc";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCameraRotate } from '@fortawesome/free-solid-svg-icons';

const Room = () => {
  const localVideoRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const isDragging = useRef(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
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
    setPeerConnection,
    switchCamera,
    canFlip
  } = usePeer();

const handleDragStart = (e) => {
  // 1. Support both mouse and touch initial position
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  isDragging.current = true;
  setDragging(true);

  const offsetX = clientX - position.x;
  const offsetY = clientY - position.y;

  const onMove = (moveEvent) => {
    if (isDragging.current) {
      // 2. Support both mousemove and touchmove
      const moveX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

      setPosition({
        x: moveX - offsetX,
        y: moveY - offsetY,
      });
    }
  };

  const onEnd = () => {
    isDragging.current = false;
    setDragging(false);
    
    // Cleanup both types of listeners
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);
  };

  // Add listeners for both Desktop and Mobile
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onEnd);
  document.addEventListener("touchmove", onMove, { passive: false });
  document.addEventListener("touchend", onEnd);
};

  const HandleRoomLeave = () => {
    socket.emit("user-leave", { id: socket.id });
    window.location.href = "/";
  };
  
  useEffect(() => {
  if (localVideoRef.current && localStream) {
    // We create the muted stream to avoid audio feedback locally
    const mutedStream = new MediaStream();
    localStream.getVideoTracks().forEach((track) => mutedStream.addTrack(track));
    
    localVideoRef.current.srcObject = mutedStream;
  }
}, [localStream]); // This runs every time the camera flips!


  const HandleNewUserJoined = (data) => {
    console.log("user-joined", data);
    handleNewUser();
  };
  
  useEffect(() => {
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
      socket.off("other-user-joined", HandleNewUserJoined);
    };

    return cleanup;
  }, []);

  return (
    <div className="room-container">
      <h1>Welcome to <span>Room {roomId}</span></h1>
      <div className="video-container">
          {localStream && (
            <div
              className="local-video"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                position: "absolute",
                cursor: dragging ? "grabbing" : "grab", // Visual cue for the user
                zIndex: 100, // Ensure it stays on top of the remote video
                userSelect: "none", // Prevents text highlighting during drag
                touchAction: "none"
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              {/* <video
                autoPlay
                playsInline
                ref={(video) => {
                  if (video && !video.srcObject) { // Optimization: don't reset if already set
                    const mutedStream = new MediaStream();
                    localStream
                      .getVideoTracks()
                      .forEach((track) => mutedStream.addTrack(track));
                    video.srcObject = mutedStream;
                  }
                }}
              /> */}
              <video
                  autoPlay
                  playsInline
                  ref={localVideoRef} // Use the permanent ref here
                />
                
           {canFlip && (<button 
              className="flip-icon-btn" 
              onClick={(e) => {
                e.stopPropagation(); // Prevents triggering drag when clicking the button
                switchCamera();
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 101, // Ensure it sits above the video
                background: "rgba(0,0,0,0.5)",
                border: "none",
                borderRadius: "50%",
                padding: "8px",
                color: "white"
              }}
            >
              <FontAwesomeIcon icon={faCameraRotate} />
            </button>)
            }
              <p>Your Video</p>
            </div>
          )}

        {remoteStream ? (
          <div className="remote-video">
            <video
              autoPlay
              playsInline
              ref={(video) => {
                if (video) {
                  video.srcObject = remoteStream;
                }
              }}
            />
            <p>Remote Video</p>
          </div>
        ) : (
          <p>Waiting for remote stream...</p>
        )}
      </div>

      <button className="leave-button" onClick={HandleRoomLeave}>
        Leave
      </button>
    </div>
  );
};

export default Room;
