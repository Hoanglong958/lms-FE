import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";
import "./CoursesCSS/LessonDocumentCreate.css";

// Dùng cùng toolbar
const CKEDITOR_TOOLBAR = [
  "heading",
  "|",
  "bold",
  "italic",
  "underline",
  "|",
  "bulletedList",
  "numberedList",
  "blockQuote",
  "|",
  "undo",
  "redo",
];

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

    try {
      const res = await lessonDocumentService.addDocument(payload);
      onCreated(res.data);
    } catch (err) {
      console.error(err);
      alert("Tạo tài liệu thất bại.");
    }
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
        <CKEditor
          editor={ClassicEditor}
          data={form.content}
          config={{ toolbar: CKEDITOR_TOOLBAR }}
          onChange={(event, editor) =>
            setForm((prev) => ({ ...prev, content: editor.getData() }))
          }
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
          type="number"
          className="ldc-input"
          value={form.sortOrder}
          onChange={(e) =>
            setForm({ ...form, sortOrder: Number(e.target.value) })
          }
        />
      </div>

      <button className="ldc-btn" onClick={handleCreate}>
        Tạo Tài liệu
      </button>
    </div>
  );
}
