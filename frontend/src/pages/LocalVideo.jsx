import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCameraRotate } from '@fortawesome/free-solid-svg-icons';

const LocalVideo = ({ localStream, canFlip, switchCamera }) => {
  const localVideoRef = useRef(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const isDragging = useRef(false);

  // Sync the video stream to the element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      const mutedStream = new MediaStream();
      localStream.getVideoTracks().forEach((track) => mutedStream.addTrack(track));
      localVideoRef.current.srcObject = mutedStream;
    }
  }, [localStream]);

  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    isDragging.current = true;
    setDragging(true);

    const offsetX = clientX - position.x;
    const offsetY = clientY - position.y;

    // We use a ref to store the "ID" of the animation frame so we can cancel it if needed
    let animationFrameId = null;

    const onMove = (moveEvent) => {
      if (isDragging.current) {
        const moveX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const moveY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

        // Cancel any pending frame to avoid "backlog"
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        // Schedule the update for the next browser paint
        animationFrameId = requestAnimationFrame(() => {
          setPosition({ 
            x: moveX - offsetX, 
            y: moveY - offsetY 
          });
        });
      }
    };

    const onEnd = () => {
      isDragging.current = false;
      setDragging(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  };
  return (
    <div
      className="local-video"
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: "absolute",
        cursor: dragging ? "grabbing" : "grab",
        zIndex: 100,
        userSelect: "none",
        touchAction: "none"
      }}
    >
      <video autoPlay playsInline ref={localVideoRef} />
      {canFlip && (
        <button 
          className="flip-icon-btn" 
          onClick={(e) => { e.stopPropagation(); switchCamera(); }}
          style={{
            position: "absolute", top: "10px", right: "10px", zIndex: 101,
            background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%",
            padding: "8px", color: "white", cursor: "pointer"
          }}
        >
          <FontAwesomeIcon icon={faCameraRotate} />
        </button>
      )}
      <p>Your Video</p>
    </div>
  );
};

export default React.memo(LocalVideo);