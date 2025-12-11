import React, { useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";
import { uploadService } from "@utils/uploadService";
import "./CoursesCSS/LessonVideoCreate.css";

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

  async function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadService.uploadVideo(file);
      // Giả sử API trả về { url: "..." } hoặc res.data là string url tuỳ swagger
      // Swagger: { "url": "string" } => res.data.url
      const url = res.data.url || res.data;
      setForm((prev) => ({ ...prev, videoUrl: url }));
    } catch (err) {
      alert("Upload video thất bại!");
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
      alert("Vui lòng upload video trước khi tạo!");
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
    <div className="lvc-wrapper">
      <h3 className="lvc-title">Thêm Video Mới</h3>

      <div className="lvc-form-row">
        <label className="lvc-label">Tiêu đề:</label>
        <input
          className="lvc-input"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          autoFocus
        />
      </div>

      <div className="lvc-form-row">
        <label className="lvc-label">Video File:</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={uploading}
            className="lvc-input"
          />
          {uploading && <span style={{ color: "orange" }}>Đang upload...</span>}
          {form.videoUrl && (
            <div style={{ fontSize: "0.85rem", color: "green" }}>
              Đã upload: {form.videoUrl}
            </div>
          )}
        </div>
      </div>

      <div className="lvc-form-row">
        <label className="lvc-label">Thời lượng (giây):</label>
        <input
          className="lvc-input"
          type="number"
          name="durationSeconds"
          value={form.durationSeconds}
          onChange={handleChange}
        />
      </div>

      <div className="lvc-form-row">
        <label className="lvc-label">Mô tả:</label>
        <textarea
          className="lvc-textarea"
          name="description"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <button className="lvc-btn" onClick={handleCreate} disabled={uploading}>
        {uploading ? "Đang xử lý..." : "Tạo Video"}
      </button>
    </div>
  );
}
