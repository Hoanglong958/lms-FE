import React, { useState, useEffect } from "react";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";

export default function LessonDocumentEditor({ document, onUpdated }) {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
  });

  useEffect(() => {
    if (!document) return;
    setForm({
      title: document.title || "",
      description: document.description || "",
      fileUrl: document.fileUrl || "",
    });
    setEditing(false);
  }, [document]);

  const handleSave = async () => {
    if (!form.title) {
      alert("Tiêu đề không được để trống");
      return;
    }

    const payload = {
      lessonId: document.lessonId,
      title: form.title,
      description: form.description,
      fileUrl: form.fileUrl,
    };

    const res = await lessonDocumentService.updateDocument(
      document.id,
      payload
    );
    onUpdated(res.data);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div>
        <h3>{document.title}</h3>
        <p>{document.description || "—"}</p>
        <p>
          <b>File:</b> {document.fileUrl || "—"}
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
        <label>Mô tả:</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div>
        <label>File URL:</label>
        <input
          value={form.fileUrl}
          onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
        />
      </div>

      <button onClick={handleSave}>Lưu</button>
      <button onClick={() => setEditing(false)}>Hủy</button>
    </div>
  );
}
