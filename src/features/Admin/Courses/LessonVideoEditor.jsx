import React, { useState, useEffect } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";

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
    if (!video.videoUrl) return <p>Chưa có video</p>;

    const url = video.videoUrl;

    // Nếu là YouTube thì convert sang embed link
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(youtubeRegex);
    const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : url;

    return (
      <iframe
        width="640"
        height="360"
        src={embedUrl}
        frameBorder="0"
        allowFullScreen
        style={{ marginBottom: "20px" }}
      ></iframe>
    );
  };

  // ============================
  //   VIEW MODE
  // ============================
  if (!editing) {
    return (
      <div>
        {renderVideo()}

        <p>
          <b>Tiêu đề:</b> {video.title}
        </p>
        <p>
          <b>Thời lượng:</b> {video.durationSeconds} giây
        </p>
        <p>
          <b>Mô tả:</b> {video.description || "—"}
        </p>

        <button onClick={() => setEditing(true)}>Sửa</button>
      </div>
    );
  }

  // ============================
  //   EDIT MODE
  // ============================
  return (
    <div>
      <h3>Sửa Video</h3>

      <div>
        <label>Tiêu đề:</label>
        <input name="title" value={form.title} onChange={handleChange} />
      </div>

      <div>
        <label>Video URL:</label>
        <input name="videoUrl" value={form.videoUrl} onChange={handleChange} />
      </div>

      <div>
        <label>Thời lượng (giây):</label>
        <input
          name="durationSeconds"
          type="number"
          value={form.durationSeconds}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Mô tả:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <button onClick={handleSave}>Lưu</button>
      <button onClick={() => setEditing(false)}>Hủy</button>
    </div>
  );
}
