// src/features/lesson/components/VideoPlayer.jsx
import React from "react";

const VideoPlayer = ({ item }) => {
  return (
    <div className="video-player-wrapper">
      <iframe
        width="100%"
        height="100%"
        src={item.videoUrl}
        title={item.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
