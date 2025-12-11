import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";
import { uploadService } from "@utils/uploadService";
import VideoProgress from "@components/VideoPlayer/VideoProgress";
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

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      const url = res.data.url || res.data;
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      alert("Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadVideo(file);
      const url = res.data.url || res.data;
      setForm((prev) => ({ ...prev, videoUrl: url }));
    } catch (err) {
      alert("Upload video thất bại");
    } finally {
      setUploading(false);
    }
  };

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
        <div className="lde-header">
          <h3 className="lde-title">{document.title}</h3>
          <button className="lde-btn-edit" onClick={() => setEditing(true)}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Sửa tài liệu
          </button>
        </div>
        <div
          className="lde-content html-content"
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
        {document.imageUrl && (
          <img
            src={document.imageUrl}
            alt={document.title}
            className="lde-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=Image+Not+Found";
            }}
          />
        )}
        {document.videoUrl && (
          <div style={{ marginTop: "12px", marginBottom: "12px" }}>
            {/* Simple check: if youtube, show link (or iframe if we wanted), else VideoProgress */}
            {/youtube\.com|youtu\.be/.test(document.videoUrl) ? (
              <a href={document.videoUrl} className="lde-link" target="_blank">
                Link Video (YouTube)
              </a>
            ) : (
              <VideoProgress src={document.videoUrl} />
            )}
          </div>
        )}
        <p>
        </p>
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
        <label className="lde-label">Image File:</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="lde-input"
          />
          {form.imageUrl && (
            <div style={{ fontSize: "0.85rem", color: "green" }}>
              Hiện tại: {form.imageUrl}
            </div>
          )}
        </div>
      </div>

      <div className="lde-form-row">
        <label className="lde-label">Video File:</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={uploading}
            className="lde-input"
          />
          {form.videoUrl && (
            <div style={{ fontSize: "0.85rem", color: "green" }}>
              Hiện tại: {form.videoUrl}
            </div>
          )}
        </div>
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

      <button className="lde-btn" onClick={handleSave} disabled={uploading}>
        {uploading ? "Đang xử lý..." : "Lưu"}
      </button>
      <button className="lde-btn-secondary" onClick={() => setEditing(false)}>
        Hủy
      </button>
    </div>
  );
}
