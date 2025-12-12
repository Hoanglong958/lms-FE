import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";
import { uploadService } from "@utils/uploadService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
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

  const handleCreate = async () => {
    if (!form.title) {
      showNotification("Thiếu thông tin", "Tiêu đề không được để trống", "warning");
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
      showNotification("Lỗi", "Tạo tài liệu thất bại.", "error");
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
          required
          autoFocus
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
        <label className="ldc-label">Image File:</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="ldc-input"
          />
          {form.imageUrl && (
            <div style={{ fontSize: "0.85rem", color: "green" }}>
              Đã upload: {form.imageUrl}
            </div>
          )}
        </div>
      </div>

      <div className="ldc-form-row">
        <label className="ldc-label">Video File:</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={uploading}
            className="ldc-input"
          />
          {form.videoUrl && (
            <div style={{ fontSize: "0.85rem", color: "green" }}>
              Đã upload: {form.videoUrl}
            </div>
          )}
        </div>
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

      <button className="ldc-btn" onClick={handleCreate} disabled={uploading}>
        {uploading ? "Đang xử lý..." : "Tạo Tài liệu"}
      </button>

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
