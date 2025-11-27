import React, { useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreate() {
    if (!isValidVideoUrl(form.videoUrl)) {
      alert(
        "Video URL không hợp lệ! Hãy nhập YouTube hoặc file MP4/WebM hợp lệ."
      );
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
        <label className="lvc-label">Video URL:</label>
        <input
          className="lvc-input"
          name="videoUrl"
          value={form.videoUrl}
          onChange={handleChange}
        />
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

      <button className="lvc-btn" onClick={handleCreate}>
        Tạo Video
      </button>
    </div>
  );
}
