import React, { useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";

export default function LessonVideoEditor({ video, onUpdated }) {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    title: video.title,
    videoUrl: video.videoUrl,
    durationSeconds: video.durationSeconds,
    description: video.description,
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
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

  if (!editing) {
    return (
      <div>
        <p>
          <b>Tiêu đề:</b> {video.title}
        </p>
        <p>
          <b>URL:</b> {video.videoUrl}
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
