// src/features/lesson/components/VideoPlayer.jsx
import React, { useEffect, useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService";
import "./VideoPlayer.css";

const VideoPlayer = ({ item }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item?.id) {
      setLoading(false);
      return;
    }

    const fetchVideo = async () => {
      try {
        // Fetch video theo lessonId giống như Admin
        const res = await lessonVideoService.getVideosByLesson(item.id);
        const videos = res.data || [];
        if (videos.length > 0) {
          setVideo(videos[0]);
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [item.id]);

  if (loading) {
    return <div className="video-player-wrapper">Đang tải video...</div>;
  }

  if (!video || !video.videoUrl) {
    return <div className="video-player-wrapper">Chưa có video</div>;
  }

  // Convert YouTube URL to embed if needed
  let embedUrl = video.videoUrl;
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = video.videoUrl.match(youtubeRegex);
  if (match) {
    embedUrl = `https://www.youtube.com/embed/${match[1]}`;
  }

  return (
    <div className="video-player-wrapper">
      <iframe
        style={{ margin: "0 auto", display: "block" }}
        width="100%"
        height="100%"
        src={embedUrl}
        title={video.title || item.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
