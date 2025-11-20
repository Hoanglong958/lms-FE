import React, { useState, useEffect } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";

import "../Courses/CoursesCSS/LessonVideoEditor.css";

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

  async function handleSave() {
    if (!isValidVideoUrl(form.videoUrl)) {
      alert(
        "Video URL không hợp lệ! Hãy nhập YouTube hoặc file MP4/WebM hợp lệ."
      );
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
    const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : url;

    return (
<div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", marginBottom: "20px" }}>
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
      <div>
        {renderVideo()}
        <p><b>Thông tin chung</b></p>
        <p>
          <b className="title-label">Tiêu đề:</b> {video.title}
        </p>
        <p>
          <b className="title-label">Thời lượng:</b> {video.durationSeconds} giây
        </p>
        <p>
          <b className="title-label">Mô tả:</b> {video.description || "—"}
        </p>

        <button className="edit-button" onClick={() => setEditing(true)}>Sửa</button>
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
        <input className="title-input-text" name="title" value={form.title} onChange={handleChange} />
      </div>

      <div className="title-container">
        <label className="title-label">Video URL: </label>
        <input className="title-input-text" name="videoUrl" value={form.videoUrl} onChange={handleChange} />
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


      <button className="button" onClick={handleSave}>Lưu</button>
      <button className="button" onClick={() => setEditing(false)}>Hủy</button>
    </div>
  );
}
