import React, { useState } from "react";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";

export default function LessonDocumentCreate({ lesson, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    fileUrl: "", // hoặc file upload tuỳ backend
  });

  const handleCreate = async () => {
    if (!form.title) {
      alert("Tiêu đề không được để trống");
      return;
    }

    const payload = {
      lessonId: lesson.id,
      title: form.title,
      description: form.description,
      fileUrl: form.fileUrl,
    };

    const res = await lessonDocumentService.addDocument(payload);
    onCreated(res.data);
  };

  return (
    <div>
      <h3>Thêm Tài liệu Mới</h3>

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

      <button onClick={handleCreate}>Tạo tài liệu</button>
    </div>
  );
}
