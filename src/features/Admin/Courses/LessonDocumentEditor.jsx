import React, { useState, useEffect } from "react";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";

export default function LessonDocumentEditor({ document, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    imageUrl: "",
    videoUrl: "",
    sortOrder: 0,
  });

  useEffect(() => {
    if (!document) return;
    setForm({
      title: document.title || "",
      content: document.content || "",
      imageUrl: document.imageUrl || "",
      videoUrl: document.videoUrl || "",
      sortOrder: document.sortOrder || 0,
    });
    setEditing(false);
  }, [document]);

  const handleSave = async () => {
    if (!form.title) {
      alert("Tiêu đề không được để trống");
      return;
    }

    const payload = { ...form, sortOrder: Number(form.sortOrder) };
    const res = await lessonDocumentService.updateDocument(
      document.documentId,
      payload
    );
    onUpdated(res.data);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div>
        <h3>{document.title}</h3>
        <p>{document.content}</p>
        {document.imageUrl && (
          <img
            src={document.imageUrl}
            alt={document.title}
            style={{ maxWidth: "200px" }}
          />
        )}
        {document.videoUrl && <a href={document.videoUrl}>Video Link</a>}
        <p>
          <b>Thứ tự:</b> {document.sortOrder}
        </p>
        <button onClick={() => setEditing(true)}>Sửa</button>
      </div>
    );
  }

  return (
    <div>
      <h3>Sửa Tài liệu</h3>
      <div>
        <label>Tiêu đề:</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <label>Nội dung:</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </div>
      <div>
        <label>Image URL:</label>
        <input
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
      </div>
      <div>
        <label>Video URL:</label>
        <input
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
        />
      </div>
      <div>
        <label>Thứ tự:</label>
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
        />
      </div>
      <button onClick={handleSave}>Lưu</button>
      <button onClick={() => setEditing(false)}>Hủy</button>
    </div>
  );
}
