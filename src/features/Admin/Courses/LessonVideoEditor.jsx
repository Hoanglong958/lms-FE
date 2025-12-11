import React, { useState, useEffect } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";
import { uploadService } from "@utils/uploadService";

import "../Courses/CoursesCSS/LessonVideoEditor.css";
import VideoProgress from "@components/VideoPlayer/VideoProgress";

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function isVideoFile(url) {
  return /\.(mp4|webm|ogg)$/i.test(url);
}
function isYouTubeUrl(url) {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
}
export function isValidVideoUrl(url) {
  return isValidUrl(url) && (isVideoFile(url) || isYouTubeUrl(url));
}

export default function LessonVideoEditor({ video, onUpdated }) {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    title: "",
    videoUrl: "",
    durationSeconds: 0,
    description: "",
  });

  // Khi video prop thay đổi → reset form
  useEffect(() => {
    if (!video) return;
    setForm({
      title: video.title || "",
      videoUrl: video.videoUrl || "",
      durationSeconds: video.durationSeconds || 0,
      description: video.description || "",
    });
    setEditing(false);
  }, [video]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const [uploading, setUploading] = useState(false);

  async function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadService.uploadVideo(file);
      const url = res.data.url || res.data;
      setForm((prev) => ({ ...prev, videoUrl: url }));
    } catch (err) {
      alert("Upload video thất bại!");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.videoUrl) {
      alert("Vui lòng upload video trước khi lưu!");
      return;
    }

    const res = await lessonVideoService.updateVideo(video.videoId, {
      lessonId: video.lessonId,
      title: form.title,
      videoUrl: form.videoUrl,
      durationSeconds: Number(form.durationSeconds),
      description: form.description,
    });

    onUpdated(res.data);
    setEditing(false);
  }

  // ============================
  //   HIỂN THỊ VIDEO (iframe)
  // ============================
  const renderVideo = () => {
    if (!video.videoUrl) return <p className="info-text">Chưa có video</p>;

    const url = video.videoUrl;

    // Nếu là YouTube thì convert sang embed link
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(youtubeRegex);
    // URL for file videos (assuming MP4/WebM)
    // We can also double check using isValidUrl or isVideoFile logic if needed,
    // but typically if it's not a YouTube link we assume it's a file for this player.
    if (!match) {
      return (
        <div style={{ marginBottom: "20px" }}>
          <VideoProgress src={url} />
        </div>
      );
    }

    // YouTube Embed
    const embedUrl = `https://www.youtube.com/embed/${match[1]}`;

    return (
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%",
          height: 0,
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <iframe
          src={embedUrl}
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}
        ></iframe>
      </div>
    );
  };

  // ============================
  //   VIEW MODE
  // ============================
  if (!editing) {
    return (
      <div className="lessonVideoWrapper">
        {/* Phần Header chứa thông tin + Nút sửa */}
        <div className="lessonVideoHeader">
          <div className="headerContent">
            {/* Hàng 1: Tiêu đề - Thời lượng - Nút Sửa */}
            <div className="headerTopRow">
              <div className="titleGroup">
                <h2 className="videoTitle">{video.title}</h2>
                <span className="durationBadge">
                  <svg
                    width="14"
                    height="14"
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
                  {video.durationSeconds} giây
                </span>
              </div>

              <button className="editButton" onClick={() => setEditing(true)}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Sửa video
              </button>
            </div>

            {/* Hàng 2: Mô tả */}
            <div className="headerDescription">
              <p>{video.description || "Chưa có mô tả"}</p>
            </div>
          </div>
        </div>

        {/* Phần Video Player */}
        <div className="videoholderlesson">{renderVideo()}</div>
      </div>
    );
  }

  // ============================
  //   EDIT MODE
  // ============================
  return (
    <div>
      <h3 className="edit-title">Sửa Video</h3>

      <div className="title-container">
        <label className="title-label">Tiêu đề: </label>
        <input
          className="title-input-text"
          name="title"
          value={form.title}
          onChange={handleChange}
          autoFocus
        />
      </div>

      <div className="title-container">
        <label className="title-label">Video File: </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={uploading}
            className="title-input-text"
          />
          {uploading && <span style={{ color: "orange" }}>Đang upload...</span>}
          {form.videoUrl && (
            <div style={{ fontSize: "0.85rem", color: "green" }}>
              Video hiện tại: {form.videoUrl}
            </div>
          )}
        </div>
      </div>

      <div className="title-container">
        <label className="title-label">Thời lượng (giây): </label>
        <input
          className="title-input-number"
          name="durationSeconds"
          type="number"
          value={form.durationSeconds}
          onChange={handleChange}
        />
      </div>
      <div className="description-container">
        <label className="description-label">Mô tả:</label>
        <textarea
          className="description-textarea"
          name="description"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <button className="button" onClick={handleSave} disabled={uploading}>
        {uploading ? "Đang xử lý..." : "Lưu"}
      </button>
      <button className="button" onClick={() => setEditing(false)}>
        Hủy
      </button>
    </div>
  );
}
