// src/features/lesson/components/VideoPlayer.jsx
import React from "react";
import "./VideoPlayer.css";

const VideoPlayer = ({ item }) => {
  return (
    <div className="video-player-wrapper">
      <iframe
        style={{ margin: "0 auto", display: "block" }}
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
