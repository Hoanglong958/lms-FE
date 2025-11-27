import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";
import "./CoursesCSS/LessonDocumentEditor.css";

// Toolbar dùng chung
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
    try {
      const res = await lessonDocumentService.updateDocument(
        document.documentId,
        payload
      );
      onUpdated(res.data);
      setEditing(false);
    } catch (err) {
      alert("Lưu tài liệu thất bại.");
    }
  };

  if (!document) return <p>Đang tải tài liệu...</p>;

  if (!editing) {
    return (
      <div className="lde-wrapper">
        <h3 className="lde-title">{document.title}</h3>
        <div
          className="lde-content html-content"
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
        {document.imageUrl && (
          <img
            src={document.imageUrl}
            alt={document.title}
            className="lde-image"
          />
        )}
        {document.videoUrl && (
          <a href={document.videoUrl} className="lde-link" target="_blank">
            Video Link
          </a>
        )}
        <p>
          <b>Thứ tự:</b> {document.sortOrder}
        </p>
        <button className="lde-btn" onClick={() => setEditing(true)}>
          Sửa
        </button>
      </div>
    );
  }

  return (
    <div className="lde-wrapper">
      <h3 className="lde-title">Sửa Tài liệu</h3>

      <div className="lde-form-row">
        <label className="lde-label">Tiêu đề:</label>
        <input
          className="lde-input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
        />
      </div>

      <div className="lde-form-row">
        <label className="lde-label">Nội dung:</label>
        <CKEditor
          editor={ClassicEditor}
          data={form.content}
          config={{ toolbar: CKEDITOR_TOOLBAR }}
          onChange={(event, editor) =>
            setForm((prev) => ({ ...prev, content: editor.getData() }))
          }
        />
      </div>

      <div className="lde-form-row">
        <label className="lde-label">Image URL:</label>
        <input
          className="lde-input"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
      </div>

      <div className="lde-form-row">
        <label className="lde-label">Video URL:</label>
        <input
          className="lde-input"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
        />
      </div>

      <div className="lde-form-row">
        <label className="lde-label">Thứ tự:</label>
        <input
          type="number"
          className="lde-input"
          value={form.sortOrder}
          onChange={(e) =>
            setForm({ ...form, sortOrder: Number(e.target.value) })
          }
        />
      </div>

      <button className="lde-btn" onClick={handleSave}>
        Lưu
      </button>
      <button className="lde-btn-secondary" onClick={() => setEditing(false)}>
        Hủy
      </button>
    </div>
  );
}
