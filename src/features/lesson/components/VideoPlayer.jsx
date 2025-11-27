// src/features/lesson/components/VideoPlayer.jsx
import React, { useEffect, useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService";
import "./VideoPlayer.css";

// Hàm format ngày tháng (để hiển thị ngày cập nhật)
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

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
        const res = await lessonVideoService.getVideosByLesson(item.id);
        // Dựa vào JSON bạn cung cấp, API trả về mảng object
        const videos = res.data || [];
        if (videos.length > 0) {
          setVideo(videos[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [item.id]);

  if (loading) {
    return (
      <div className="video-player-wrapper loading">Đang tải video...</div>
    );
  }

  if (!video || !video.videoUrl) {
    return <div className="video-player-wrapper empty">Chưa có video</div>;
  }

  // Convert YouTube URL to embed
  let embedUrl = video.videoUrl;
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = video.videoUrl.match(youtubeRegex);
  if (match) {
    embedUrl = `https://www.youtube.com/embed/${match[1]}`;
  }

  return (
    <div className="video-component-container">
      {/* 1. Phần Player */}
      <div className="video-player-wrapper">
        <iframe
          src={embedUrl}
          title={video.title || item.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* 2. Phần Thông tin chi tiết (Title, Date, Description) */}
      <div className="video-info-container">
        <h1 className="video-main-title">{video.title || item.title}</h1>

        <div className="video-meta-info">
          <span className="meta-date">
            {/* Icon đồng hồ đơn giản bằng CSS hoặc text */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>{" "}
            Cập nhật: {formatDate(video.updatedAt || video.createdAt)}
          </span>
        </div>

        <div className="video-description-box">
          <h3 className="desc-title">Mô tả</h3>
          <div className="desc-content">
            {video.description ? (
              <p>{video.description}</p>
            ) : (
              <p className="no-desc">Không có mô tả cho video này.</p>
            )}
          </div>
          {/* Nút xem thêm giả lập nếu description dài */}
          {video.description && video.description.length > 300 && (
            <button className="btn-read-more">Xem thêm</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
