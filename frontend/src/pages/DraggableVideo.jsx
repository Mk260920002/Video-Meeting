import React, { useState, useRef } from "react";

const DraggableVideo = React.memo(({ stream }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const isDragging = useRef(false);

  const handleDragStart = (e) => {
    e.preventDefault();
    isDragging.current = true;
    const offsetX = e.clientX - position.x;
    const offsetY = e.clientY - position.y;

    const onMove = (mE) => {
      if (isDragging.current) {
        setPosition({ x: mE.clientX - offsetX, y: mE.clientY - offsetY });
      }
    };

    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className="local-video"
      onMouseDown={handleDragStart}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: "absolute",
        cursor: "grab"
      }}
    >
      <video
        autoPlay
        playsInline
        ref={(v) => {
          if (v && stream) {
            const muted = new MediaStream(stream.getVideoTracks());
            v.srcObject = muted;
          }
        }}
      />
    </div>
  );
});

export default DraggableVideo;