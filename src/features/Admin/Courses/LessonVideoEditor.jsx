import React, { useState, useEffect } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";
import { uploadService } from "@utils/uploadService";
import "../Courses/styles/LessonDocumentEditor.css";
import VideoProgress from "@components/VideoPlayer/VideoProgress";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { SERVER_URL } from "@config";

function isValidUrl(url) {
  if (!url) return false;
  if (url.startsWith("/")) return true; // Accept relative paths
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

  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

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
      showNotification("Lỗi", "Upload video thất bại!", "error");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.videoUrl) {
      showNotification("Lỗi", "Vui lòng upload video trước khi lưu!", "error");
      return;
    }

    try {
      const res = await lessonVideoService.updateVideo(video.videoId, {
        lessonId: video.lessonId,
        title: form.title,
        videoUrl: form.videoUrl,
        durationSeconds: Number(form.durationSeconds),
        description: form.description,
      });

      onUpdated(res.data);
      setEditing(false);
    } catch (err) {
      showNotification("Lỗi", "Lưu video thất bại", "error");
    }
  }

  // ============================
  //   HIỂN THỊ VIDEO (iframe)
  // ============================
  const renderVideo = () => {
    if (!video.videoUrl) return <p className="info-text">Chưa có video</p>;

    const url = video.videoUrl.startsWith("/")
      ? `${SERVER_URL}${video.videoUrl}`
      : video.videoUrl;

    // Nếu là YouTube thì convert sang embed link
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(youtubeRegex);

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
      <div className="lde-wrapper">
        <div className="lde-header">
          <h3 className="lde-title">{video.title}</h3>
          <button className="lde-btn-edit" onClick={() => setEditing(true)}>
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

        {/* Info */}
        <div style={{ marginBottom: "16px", color: "#64748b", fontSize: "14px", display: "flex", gap: "20px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            🕒 {video.durationSeconds} giây
          </span>
        </div>

        {/* Phần Video Player */}
        <div className="videoholderlesson">{renderVideo()}</div>

        <div style={{ marginTop: "16px" }}>
          <p style={{ color: "#334155", lineHeight: "1.6" }}>{video.description || "Chưa có mô tả"}</p>
        </div>

        <NotificationModal
          isOpen={notification.isOpen}
          onClose={closeNotification}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      </div>
    );
  }

  // ============================
  //   EDIT MODE
  // ============================
  return (
    <div className="admin-form-container">
      <h3 className="admin-form-title">✏️ Chỉnh sửa Video</h3>

      <div className="admin-form-group">
        <label className="admin-form-label">Tiêu đề</label>
        <input
          className="admin-input"
          name="title"
          value={form.title}
          onChange={handleChange}
          autoFocus
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Video File</label>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label className="admin-btn admin-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            🎥 Tải lên video mới
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploading}
              hidden
            />
          </label>
          {uploading && <span style={{ color: "orange", fontSize: "14px" }}>Đang upload...</span>}
          {form.videoUrl && <span style={{ fontSize: "13px", color: "#166534" }}>✅ Đã có video</span>}
        </div>
        {form.videoUrl && (
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>
            Video hiện tại: {form.videoUrl}
          </div>
        )}
      </div>



      <div className="admin-form-group">
        <label className="admin-form-label">Mô tả</label>
        <textarea
          className="admin-input"
          name="description"
          value={form.description}
          onChange={handleChange}
          style={{ minHeight: "80px", resize: "vertical" }}
        />
      </div>

      <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button className="admin-btn admin-btn-secondary" onClick={() => setEditing(false)} disabled={uploading}>
          Hủy bỏ
        </button>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={uploading}>
          {uploading ? "Đang xử lý..." : "Lưu thay đổi"}
        </button>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
