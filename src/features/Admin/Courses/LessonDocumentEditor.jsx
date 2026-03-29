import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";
import { uploadService } from "@utils/uploadService";
import VideoProgress from "@components/VideoPlayer/VideoProgress";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./styles/LessonDocumentEditor.css";
import { SERVER_URL } from "@config";

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
    pdfUrl: "",
    sortOrder: 0,
  });

  useEffect(() => {
    if (!document) return;
    setForm({
      title: document.title || "",
      content: document.content || "",
      imageUrl: document.imageUrl || "",
      videoUrl: document.videoUrl || "",
      pdfUrl: document.pdfUrl || "",
      sortOrder: document.sortOrder || 0,
    });
    setEditing(false);
  }, [document]);

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

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      const url = res.data.url || res.data;
      setForm((prev) => ({ ...prev, imageUrl: url }));
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

  const handleSave = async () => {
    if (!form.title) {
      showNotification("Lỗi", "Tiêu đề không được để trống", "error");
      return;
    }

    const payload = {
      title: form.title.trim(),
      content: normalizeOptionalValue(form.content),
      imageUrl: normalizeOptionalValue(form.imageUrl),
      videoUrl: normalizeOptionalValue(form.videoUrl),
      pdfUrl: normalizeOptionalValue(form.pdfUrl),
      sortOrder: Number(form.sortOrder),
    };
    try {
      const res = await lessonDocumentService.updateDocument(
        document.documentId,
        payload
      );
      onUpdated(res.data);
      setEditing(false);
    } catch (err) {
      showNotification("Lỗi", getErrorMessage(err, "Lưu tài liệu thất bại."), "error");
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
            src={
              document.imageUrl.startsWith("/")
                ? `${SERVER_URL}${document.imageUrl}`
                : document.imageUrl
            }
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
            {/* Prepend server URL if relative */}
            {(() => {
              const fullVideoUrl = document.videoUrl.startsWith("/")
                ? `${SERVER_URL}${document.videoUrl}`
                : document.videoUrl;

              if (/youtube\.com|youtu\.be/.test(fullVideoUrl)) {
                return (
                  <a href={fullVideoUrl} className="lde-link" target="_blank" rel="noreferrer">
                    Link Video (YouTube)
                  </a>
                );
              }
              return <VideoProgress src={fullVideoUrl} />;
            })()}
          </div>
        )}
        <p>
        </p>
      </div>
    );
  }

  // Display Logic (Editing active)
  if (editing) {
    return (
      <div className="admin-form-container">
        <h3 className="admin-form-title">✏️ Chỉnh sửa tài liệu</h3>

        <div className="admin-form-group">
          <label className="admin-form-label">Tiêu đề</label>
          <input
            className="admin-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
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
          <button className="admin-btn admin-btn-secondary" onClick={() => setEditing(false)} disabled={uploading}>
            Hủy bỏ
          </button>
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={uploading}>
            {uploading ? "Đang tải lên..." : "Lưu thay đổi"}
          </button>
        </div>

        <NotificationModal
          isOpen={notification.isOpen}
          onClose={closeNotification}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      </div>
    );
  }

  // View Mode
  return (
    <div className="lde-wrapper">
      <div className="lde-header">
        <h3 className="lde-title">{document.title}</h3>
        <button className="lde-btn-edit" onClick={() => setEditing(true)}>
          ✏️ Sửa tài liệu
        </button>
      </div>

      <div
        className="lde-content html-content"
        dangerouslySetInnerHTML={{ __html: document.content }}
      />

      {document.imageUrl && (
        <div style={{ marginTop: "16px" }}>
          <img
            src={
              document.imageUrl.startsWith("/")
                ? `${SERVER_URL}${document.imageUrl}`
                : document.imageUrl
            }
            alt={document.title}
            className="lde-image"
            style={{ maxWidth: "100%", borderRadius: "8px" }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {document.videoUrl && (
        <div style={{ marginTop: "16px", marginBottom: "12px" }}>
          {(() => {
            const fullVideoUrl = document.videoUrl.startsWith("/")
              ? `${SERVER_URL}${document.videoUrl}`
              : document.videoUrl;

            if (/youtube\.com|youtu\.be/.test(fullVideoUrl)) {
              return (
                <a href={fullVideoUrl} className="lde-link" target="_blank" rel="noreferrer">
                  Link Video (YouTube)
                </a>
              );
            }
            return <VideoProgress src={fullVideoUrl} />;
          })()}
        </div>
      )}

      {document.pdfUrl && (
        <div className="lde-pdf-container">
          <div className="lde-pdf-icon">📄</div>
          <div className="lde-pdf-info">
            <div className="lde-pdf-title">Tài liệu đính kèm PDF</div>
            <a
              href={document.pdfUrl.startsWith("/") ? `${SERVER_URL}${document.pdfUrl}` : document.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="lde-pdf-link"
            >
              📥 Tải xuống / Xem tài liệu
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

