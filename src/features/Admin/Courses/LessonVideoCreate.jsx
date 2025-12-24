import React, { useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";
import { uploadService } from "@utils/uploadService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./CoursesCSS/LessonDocumentEditor.css";

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

export default function LessonVideoCreate({ lesson, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    videoUrl: "",
    durationSeconds: "",
    description: "",
  });

  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreate() {
    if (!form.videoUrl) {
      showNotification("Thiếu thông tin", "Vui lòng upload video trước khi tạo!", "warning");
      return;
    }

    const res = await lessonVideoService.addVideo({
      lessonId: lesson.id,
      ...form,
      durationSeconds: Number(form.durationSeconds),
    });

    onCreated(res.data);
  }

  return (
    <div className="admin-form-container">
      <h3 className="admin-form-title">
        <span style={{ fontSize: "24px" }}>🎥</span> Thêm Video Mới
      </h3>

      <div className="admin-form-group">
        <label className="admin-form-label">Tiêu đề</label>
        <input
          className="admin-input"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          autoFocus
          placeholder="Nhập tiêu đề video"
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Video File</label>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label className="admin-btn admin-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            🎥 Chọn video
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploading}
              hidden
            />
          </label>
          {uploading && <span style={{ color: "orange", fontSize: "14px" }}>Đang upload...</span>}
          {form.videoUrl && <span style={{ fontSize: "13px", color: "#166534" }}>✅ Đã upload</span>}
        </div>
        {form.videoUrl && (
          <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>
            {form.videoUrl}
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
          placeholder="Nhập mô tả video..."
        />
      </div>

      <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button className="admin-btn admin-btn-primary" onClick={handleCreate} disabled={uploading} style={{ width: "100%", justifyContent: "center" }}>
          {uploading ? "Đang xử lý..." : "Tạo Video"}
        </button>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
