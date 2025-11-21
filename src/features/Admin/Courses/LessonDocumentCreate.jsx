import React, { useState } from "react";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";
import "./CoursesCSS/LessonDocumentCreate.css";

export default function LessonDocumentCreate({ lesson, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    imageUrl: "",
    videoUrl: "",
    sortOrder: 0,
  });

  const handleCreate = async () => {
    if (!form.title) {
      alert("Tiêu đề không được để trống");
      return;
    }

    const payload = {
      lessonId: lesson.id,
      ...form,
      sortOrder: Number(form.sortOrder),
    };

    const res = await lessonDocumentService.addDocument(payload);
    onCreated(res.data);
  };

  return (
    <div className="ldc-wrapper">
      <h3 className="ldc-title">Thêm Tài liệu Mới</h3>

      <div className="ldc-form-row">
        <label className="ldc-label">Tiêu đề:</label>
        <input
          className="ldc-input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div className="ldc-form-row">
        <label className="ldc-label">Nội dung:</label>
        <textarea
          className="ldc-textarea"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </div>

      <div className="ldc-form-row">
        <label className="ldc-label">Image URL:</label>
        <input
          className="ldc-input"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
      </div>

      <div className="ldc-form-row">
        <label className="ldc-label">Video URL:</label>
        <input
          className="ldc-input"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
        />
      </div>

      <div className="ldc-form-row">
        <label className="ldc-label">Thứ tự:</label>
        <input
          className="ldc-input"
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
        />
      </div>

      <button className="ldc-btn" onClick={handleCreate}>
        Tạo Tài liệu
      </button>
    </div>
  );
}
