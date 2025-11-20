import React, { useState } from "react";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";

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
    <div>
      <h3>Thêm Tài liệu</h3>
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
      <button onClick={handleCreate}>Tạo tài liệu</button>
    </div>
  );
}
