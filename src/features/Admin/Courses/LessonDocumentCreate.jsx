import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";
import { uploadService } from "@utils/uploadService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./styles/LessonDocumentEditor.css";
import { SERVER_URL } from "@config";

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
    pdfUrl: "",
    sortOrder: 0,
  });

  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  const normalizeOptionalValue = (value) => {
    if (typeof value !== "string") return value ?? null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };

  const getErrorMessage = (err, fallback) => {
    const payload = err?.response?.data;
    return (
      payload?.data ||
      payload?.message ||
      (typeof payload === "string" ? payload : null) ||
      err?.message ||
      fallback
    );
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      const url = res.data.url || res.data;
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      showNotification("Lỗi", "Upload ảnh thất bại", "error");
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
      showNotification("Lỗi", "Upload video thất bại", "error");
    } finally {
      setUploading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadPdf(file);
      const url = res.data.url || res.data;
      setForm((prev) => ({ ...prev, pdfUrl: url }));
    } catch (err) {
      showNotification("Lỗi", "Upload PDF thất bại", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title) {
      showNotification("Thiếu thông tin", "Tiêu đề không được để trống", "warning");
      return;
    }

    const payload = {
      lessonId: lesson.id,
      title: form.title.trim(),
      content: normalizeOptionalValue(form.content),
      imageUrl: normalizeOptionalValue(form.imageUrl),
      videoUrl: normalizeOptionalValue(form.videoUrl),
      pdfUrl: normalizeOptionalValue(form.pdfUrl),
      sortOrder: Number(form.sortOrder),
    };

    try {
      const res = await lessonDocumentService.addDocument(payload);
      onCreated(res.data);
    } catch (err) {
      showNotification("Lỗi", getErrorMessage(err, "Tạo tài liệu thất bại."), "error");
    }
  };

  return (
    <div className="admin-form-container">
      <h3 className="admin-form-title">
        <span style={{ fontSize: "24px" }}>📄</span> Thêm Tài liệu Mới
      </h3>

      <div className="admin-form-group">
        <label className="admin-form-label">Tiêu đề</label>
        <input
          className="admin-input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          autoFocus
          placeholder="Nhập tiêu đề tài liệu"
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Nội dung</label>
        <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
          <CKEditor
            editor={ClassicEditor}
            data={form.content}
            config={{ toolbar: CKEDITOR_TOOLBAR }}
            onChange={(event, editor) =>
              setForm((prev) => ({ ...prev, content: editor.getData() }))
            }
          />
        </div>
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Ảnh Thumbnail (Tùy chọn)</label>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label className="admin-btn admin-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            📷 Chọn ảnh
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              hidden
            />
          </label>
          {form.imageUrl && <span style={{ fontSize: "13px", color: "#166534" }}>✅ Đã có ảnh</span>}
        </div>
        {form.imageUrl && (
          <div style={{ marginTop: "8px" }}>
            <img src={form.imageUrl.startsWith("/") ? `${SERVER_URL}${form.imageUrl}` : form.imageUrl} alt="preview" style={{ height: "60px", borderRadius: "6px" }} onError={(e) => e.target.style.display = 'none'} />
          </div>
        )}
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Video bài học (Tùy chọn)</label>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label className="admin-btn admin-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            🎥 Chọn video
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploading}
              hidden
            />
          </label>
          {form.videoUrl && <span style={{ fontSize: "13px", color: "#166534" }}>✅ Đã có video</span>}
        </div>
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">File PDF (Tùy chọn)</label>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label className="admin-btn admin-btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            📄 Chọn PDF
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              disabled={uploading}
              hidden
            />
          </label>
          {form.pdfUrl && <span style={{ fontSize: "13px", color: "#166534" }}>✅ Đã có PDF</span>}
        </div>
      </div>



      <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button className="admin-btn admin-btn-primary" onClick={handleCreate} disabled={uploading} style={{ width: "100%", justifyContent: "center" }}>
          {uploading ? "Đang xử lý..." : "Tạo Tài liệu"}
        </button>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
