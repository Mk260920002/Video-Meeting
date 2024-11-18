import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socketContext";
import { usePeer } from "../context/webrtc";
import { useNavigate } from "react-router-dom";

const Room = () => {
  const [dragging, setDragging] = useState(false);
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
  } = usePeer();

  const handleDragStart = (e) => {
    setDragging(true);
    const offsetX = e.clientX - position.x;
    const offsetY = e.clientY - position.y;

    const onMouseMove = (moveEvent) => {
      if (dragging) {
        setPosition({
          x: moveEvent.clientX - offsetX,
          y: moveEvent.clientY - offsetY,
        });
      }
    };

    const onMouseUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const HandleRoomLeave = () => {
    socket.emit("user-leave", { id: socket.id });
    window.location.href = "/";
  };

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
              position: "absolute", // Make video draggable
            }}
            onMouseDown={handleDragStart}
          >
            <video
              autoPlay
              playsInline
              ref={(video) => {
                if (video) {
                  const mutedStream = new MediaStream();
                  localStream
                    .getVideoTracks()
                    .forEach((track) => mutedStream.addTrack(track));
                  video.srcObject = mutedStream;
               
                }
              }}
            />
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
