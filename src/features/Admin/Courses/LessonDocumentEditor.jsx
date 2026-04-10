import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { lessonDocumentService } from "@utils/lessonDocumentService.js";
import { uploadService } from "@utils/uploadService";
import VideoProgress from "@components/VideoPlayer/VideoProgress";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./styles/LessonDocumentEditor.css";
import { SERVER_URL } from "@config";

/* Modular CKEditor Imports */
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold, Italic, Underline, Strikethrough, Code } from '@ckeditor/ckeditor5-basic-styles';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize } from '@ckeditor/ckeditor5-image';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { Base64UploadAdapter } from '@ckeditor/ckeditor5-upload';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { FontSize, FontFamily, FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

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

  const [uploading, setUploading] = useState(false);

  const editorConfiguration = {
    licenseKey: 'GPL',
    plugins: [
        Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, Code,
        Link, List, Table, TableToolbar, 
        Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize,
        Base64UploadAdapter, Alignment, 
        FontSize, FontFamily, FontColor, FontBackgroundColor,
        Highlight, CodeBlock, SourceEditing, BlockQuote, MediaEmbed, 
        Indent, Autoformat, GeneralHtmlSupport
    ],
    toolbar: [
        'heading', '|', 
        'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
        'bold', 'italic', 'underline', 'strikethrough', 'code', 'link', '|',
        'alignment', 'bulletedList', 'numberedList', 'outdent', 'indent', '|',
        'imageUpload', 'blockQuote', 'insertTable', 'mediaEmbed', 'codeBlock', 'sourceEditing', '|',
        'undo', 'redo'
    ],
    heading: {
        options: [
            { model: 'paragraph', title: 'Thẻ (P)', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Tiêu đề 1 (H1)', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Tiêu đề 2 (H2)', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Tiêu đề 3 (H3)', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Tiêu đề 4 (H4)', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Tiêu đề 5 (H5)', class: 'ck-heading_heading5' }
        ]
    },
    fontSize: {
        options: [ 10, 12, 14, 'default', 18, 20, 24, 28, 32 ]
    },
    htmlSupport: {
        allow: [
            {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true
            }
        ]
    },
    image: {
        toolbar: ['imageTextAlternative', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageResize', '|', 'toggleImageCaption'],
        resizeUnit: '%'
    },
    table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
    language: 'vi',
    placeholder: 'Chỉnh sửa nội dung tài liệu...',
  };

  if (!document) return <p>Đang tải tài liệu...</p>;

  if (!editing) {
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
      </div>
    );
  }

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
            config={editorConfiguration}
            data={form.content}
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
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
