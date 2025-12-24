// src/features/lesson/components/VideoPlayer.jsx
import React, { useEffect, useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService";
import { userProgressService } from "@utils/userProgressService";
import "./VideoPlayer.css";
import VideoProgress from "@components/VideoPlayer/VideoProgress";

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

const VideoPlayer = ({ item, progress }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false); // Toggle state

  // Get current user from local storage to reliably get userId
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    } catch {
      return {};
    }
  })();

  const handleVideoComplete = async () => {
    if (!user.id || !item?.id) return;
    try {
      await userProgressService.saveLessonProgress({
        userId: user.id,
        lessonId: item.id,
        sessionId: item.sessionId || 0, // Fallback if missing
        courseId: item.courseId || 0,   // Fallback if missing
        type: "video",
        status: "COMPLETED",
        progressPercent: 100
      });
      // console.log("Video completed, progress saved.");
    } catch (error) {
      console.error("Failed to save progress", error);
    }
  };

  useEffect(() => {
    if (!item?.id) {
      setLoading(false);
      return;
    }

    const fetchVideo = async () => {
      try {
        const res = await lessonVideoService.getVideosByLesson(item.id);
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
        {match ? (
          <>
            <iframe
              src={embedUrl}
              title={video.title || item.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            {/* Overlay button for manual complete can be kept or removed if redundant with progress tracking */}
            <div style={{ padding: '10px', display: 'flex', justifyContent: 'flex-end', position: 'absolute', bottom: 0, right: 0 }}>
              <button
                onClick={handleVideoComplete}
                style={{ background: 'rgba(40, 167, 69, 0.9)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                ✅ Đã xem xong
              </button>
            </div>
          </>
        ) : (
          <VideoProgress
            src={video.videoUrl}
            onEnded={handleVideoComplete}
          />
        )}
      </div>

      {/* 2. Phần Thông tin chi tiết (Figma Style) */}
      <div className="video-info-container">

        {/* HEADER: Title & Progress */}
        <div className="vp-info-header">
          <h1 className="vp-title">{video.title || item.title}</h1>

          {/* Progress Badge */}
          {(() => {
            // Extract numbers from "1/10 Bài học" string
            const match = typeof progress === 'string' ? progress.match(/(\d+)\/(\d+)/) : null;
            const current = match ? parseInt(match[1]) : 0;
            const total = match ? parseInt(match[2]) : 1;
            const percent = total > 0 ? Math.round((current / total) * 100) : 0;

            // SVG Logic for Circle
            const radius = 18;
            const circumference = 2 * Math.PI * radius; // ~113.097
            const offset = circumference - (percent / 100) * circumference;

            return (
              <div className="vp-progress-badge">
                <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background Circle */}
                    <circle cx="24" cy="24" r={radius} stroke="#E0E0E0" strokeWidth="4" fill="none" />
                    {/* Progress Circle (Orange) */}
                    <circle
                      cx="24" cy="24" r={radius}
                      stroke="#F05123" strokeWidth="4" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 'bold', color: '#333'
                  }}>
                    {percent}%
                  </div>
                </div>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#333' }}>
                  {current}/{total} Bài học
                </span>
              </div>
            );
          })()}
        </div>

        {/* DATE INFO */}
        <div className="vp-meta-date">
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
          </svg>
          <span>Cập nhật: {formatDate(video.updatedAt || video.createdAt || new Date())}</span>
        </div>

        {/* DESCRIPTION BOX */}
        <div className="vp-desc-box">
          <div className="vp-desc-header">Mô tả</div>

          <div className={`vp-desc-content ${descExpanded ? 'expanded' : 'collapsed'}`}>
            {video.description ? (
              <p style={{ margin: 0 }}>{video.description}</p>
            ) : (
              <p className="no-desc" style={{ margin: 0 }}>Nội dung đang được cập nhật...</p>
            )}
          </div>

          {/* Toggle Button (only if lengthy description) */}
          {(video.description && video.description.length > 100) && (
            <button className="vp-desc-toggle" onClick={() => setDescExpanded(!descExpanded)}>
              {descExpanded ? "Ẩn bớt" : "Xem thêm"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default VideoPlayer;
