import React, { useState, useRef } from "react";
import { Form, Input, Button, Select, message, Card, Row, Col, Typography, Breadcrumb, Divider, Tooltip, Badge } from "antd";
import { ArrowLeftOutlined, SaveOutlined, EyeOutlined, FullscreenOutlined, FileTextOutlined, TagOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { postService } from "@utils/postService";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Bold, Italic, Underline, Strikethrough, Code } from '@ckeditor/ckeditor5-basic-styles';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize } from '@ckeditor/ckeditor5-image';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { FontSize, FontFamily, FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Base64UploadAdapter } from '@ckeditor/ckeditor5-upload';

const { Title, Text } = Typography;

const ContentStats = ({ wordCount, charCount }) => (
  <div className="stats-container">
    <div className="stat-item">
      <span className="stat-label">Số từ</span>
      <span className="stat-value">{wordCount}</span>
    </div>
    <div className="stat-divider" />
    <div className="stat-item">
      <span className="stat-label">Ký tự</span>
      <span className="stat-value">{charCount}</span>
    </div>
  </div>
);

export default function PostCreate() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);

  const isTeacher = location.pathname.startsWith("/teacher");
  const basePath = isTeacher ? "/teacher/posts" : "/admin/posts";

  const contentPlainText = (editorContent || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  const wordCount = contentPlainText ? contentPlainText.split(/\s+/).filter(Boolean).length : 0;

  const generateSlug = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/^-+|-+$/g, '');

  class Base64UploadAdapterImpl {
    constructor(loader) { this.loader = loader; }
    async upload() {
      const file = await this.loader.file;
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ default: reader.result });
        reader.onerror = (error) => reject(error);
        reader.onabort = () => reject();
        reader.readAsDataURL(file);
      });
    }
    abort() {}
  }

  function Base64UploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) =>
      new Base64UploadAdapterImpl(loader);
  }

  const handlePaste = (evt, editor) => {
    if (!editor || !editor.model) return;
    const items = evt.data.dataTransfer?.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Image = e.target.result;
          editor.model.change(writer => {
            const imageElement = writer.createElement('image', { src: base64Image });
            editor.model.insertContent(imageElement, editor.model.document.selection);
          });
        };
        reader.readAsDataURL(file);
        evt.stopPropagation();
        evt.preventDefault();
        break;
      }
    }
  };

  const editorConfiguration = {
    licenseKey: 'GPL',
    plugins: [
      Essentials, Paragraph, Heading, Bold, Italic, Underline, Strikethrough, Code,
      Link, List, BlockQuote,
      Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize,
      Table, TableToolbar,
      Alignment,
      FontSize, FontFamily, FontColor, FontBackgroundColor,
      Highlight, CodeBlock, SourceEditing, MediaEmbed,
      Indent, Autoformat,
      Base64UploadAdapter
    ],
    extraPlugins: [Base64UploadAdapterPlugin],
    toolbar: {
      items: [
        'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList',
        '|', 'outdent', 'indent', '|', 'imageUpload', 'blockQuote', 'insertTable',
        'mediaEmbed', 'undo', 'redo', '|', 'alignment', 'fontColor', 'fontSize',
        'highlight', 'codeBlock', '|', 'sourceEditing'
      ]
    },
    image: {
      toolbar: ['imageTextAlternative', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageResize', '|', 'toggleImageCaption'],
      styles: ['full', 'side', 'alignLeft', 'alignCenter', 'alignRight'],
      resizeOptions: [
        { name: 'imageResize:original', value: null, label: 'Original' },
        { name: 'imageResize:50', value: '50', label: '50%' },
        { name: 'imageResize:75', value: '75', label: '75%' }
      ],
      resizeUnit: '%'
    },
    table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
    language: 'vi',
    placeholder: 'Bắt đầu viết nội dung bài viết của bạn...',
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("loggedInUser");
      const user = userStr ? JSON.parse(userStr) : {};
      const payload = {
        title: values.title,
        slug: values.slug,
        content: values.content ?? editorContent,
        authorId: user.id || 1,
        tagNames: values.tagNames || [],
        status: values.status || "PUBLISHED",
      };
      await postService.createPost(payload);
      message.success("Tạo bài viết thành công!");
      navigate(basePath);
    } catch {
      message.error("Tạo bài viết thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`post-create-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div className="header-card">
          {/* Hàng trên: back + breadcrumb/title | stats */}
          <div className="header-top-row">
            {/* Trái: nút back + breadcrumb + title + subtitle */}
            <div className="header-left">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(basePath)}
                className="back-button"
              />
              <div className="header-title-block">
                <Breadcrumb
                  items={[
                    {
                      title: (
                        <span className="breadcrumb-link" onClick={() => navigate(basePath)}>
                          Bài viết
                        </span>
                      ),
                    },
                    { title: <span className="breadcrumb-current">Viết bài mới</span> },
                  ]}
                />
                <div className="title-row">
                  <Title level={2} className="page-title">
                    Viết bài mới
                  </Title>
                  <Badge status="processing" text="Bản nháp mới" className="header-badge" />
                </div>
                <Text className="page-subtitle">Tạo nội dung chất lượng và tối ưu SEO</Text>
              </div>
            </div>

            {/* Phải: stats */}
            <div className="header-right">
              <ContentStats wordCount={wordCount} charCount={contentPlainText.length} />
            </div>
          </div>
        </div>

        {/* Accent bar dưới header */}
        <div className="header-accent" />
      </div>

      {/* ===== FORM ===== */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="post-form"
        initialValues={{ status: "PUBLISHED" }}
      >
        <Row gutter={24}>
          {/* Cột trái: editor */}
          <Col xs={24} lg={17}>
            <Card className="editor-card" bordered={false}>
              <Form.Item
                label={
                  <span className="form-label">
                    <FileTextOutlined className="mr-2" />
                    Tiêu đề
                  </span>
                }
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input
                  size="large"
                  placeholder="Nhập tiêu đề hấp dẫn..."
                  onChange={(e) => {
                    const slug = generateSlug(e.target.value);
                    form.setFieldsValue({ slug });
                  }}
                  className="title-input"
                />
              </Form.Item>

              <Form.Item
                label={<span className="form-label">Đường dẫn (Slug)</span>}
                name="slug"
                rules={[{ required: true, message: "Vui lòng nhập slug" }]}
                help={
                  <span className="slug-help">
                    URL thân thiện với SEO:{" "}
                    <strong>/bai-viet/{form.getFieldValue("slug") || "..."}</strong>
                  </span>
                }
              >
                <Input
                  addonBefore={<span className="slug-addon">/bai-viet/</span>}
                  placeholder="url-bai-viet"
                  className="slug-input"
                />
              </Form.Item>

              <Divider className="editor-divider" />

              <Form.Item name="content" initialValue="" rules={[{ required: true, message: "Vui lòng nhập nội dung" }]} hidden>
                <Input type="hidden" />
              </Form.Item>

              <Form.Item
                label={<span className="form-label">Nội dung</span>}
                required
                className="editor-form-item"
              >
                <div className={`ckeditor-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
                  <div className="editor-toolbar-actions">
                    <Tooltip title="Xem trước (sắp có)">
                      <Button type="text" icon={<EyeOutlined />} disabled />
                    </Tooltip>
                    <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
                      <Button
                        type="text"
                        icon={<FullscreenOutlined />}
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      />
                    </Tooltip>
                  </div>
                  <CKEditor
                    editor={ClassicEditor}
                    config={editorConfiguration}
                    data={editorContent}
                    onReady={(editor) => {
                      editorRef.current = editor;
                      editor.editing.view.document.on('paste', (evt) => handlePaste(evt, editor));
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorContent(data);
                      form.setFieldValue("content", data);
                      form.validateFields(['content']).catch(() => {});
                    }}
                  />
                </div>
              </Form.Item>
            </Card>
          </Col>

          {/* Cột phải: sidebar */}
          <Col xs={24} lg={7}>
            <div className="sidebar-sticky">
              {/* Card đăng bài */}
              <Card className="publish-card" bordered={false}>
                <div className="card-header">
                  <Title level={5}>Đăng bài</Title>
                </div>
                <Form.Item
                  name="status"
                  label={<span className="form-label">Trạng thái</span>}
                  className="status-select"
                >
                  <Select size="large">
                    <Select.Option value="PUBLISHED">
                      <Badge status="success" /> Xuất bản ngay
                    </Select.Option>
                    <Select.Option value="DRAFT">
                      <Badge status="warning" /> Lưu nháp
                    </Select.Option>
                    <Select.Option value="ARCHIVED">
                      <Badge status="default" /> Lưu trữ
                    </Select.Option>
                  </Select>
                </Form.Item>

                <div className="stats-box">
                  <ContentStats wordCount={wordCount} charCount={contentPlainText.length} />
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  block
                  size="large"
                  className="submit-button"
                >
                  Xuất bản bài viết
                </Button>
              </Card>

              {/* Card phân loại */}
              <Card className="taxonomy-card" bordered={false}>
                <div className="card-header">
                  <Title level={5}>
                    <TagOutlined className="mr-2" />
                    Phân loại
                  </Title>
                </div>
                <Form.Item
                  name="tagNames"
                  label={<span className="form-label">Thẻ (Tags)</span>}
                  tooltip="Thêm thẻ để người đọc dễ tìm kiếm"
                >
                  <Select
                    mode="tags"
                    placeholder="Nhập tags..."
                    tokenSeparators={[',']}
                    className="tags-select"
                    options={[
                      { value: 'Java', label: 'Java' },
                      { value: 'Spring Boot', label: 'Spring Boot' },
                      { value: 'ReactJS', label: 'ReactJS' },
                      { value: 'Frontend', label: 'Frontend' },
                      { value: 'Backend', label: 'Backend' },
                    ]}
                  />
                </Form.Item>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>

      <style jsx>{`
        /* =========================================
           CONTAINER
        ========================================= */
        .post-create-container {
          min-height: 100vh;
          padding: 24px;
          background: linear-gradient(145deg, #f8fafc 0%, #edf2f7 100%);
          transition: all 0.3s ease;
        }

        .fullscreen-mode {
          padding: 0;
          background: white;
        }

        /* =========================================
           HEADER
        ========================================= */
        .page-header {
          margin-bottom: 32px;
          position: relative;
        }

        /* Card trắng bọc toàn bộ header */
        .header-card {
          padding: 24px 28px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.8);
        }

        /* Hàng chính: left (back + title) và right (stats) tách 2 bên */
        .header-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        /* Bên trái: back button + title block xếp ngang */
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }

        /* Block chứa breadcrumb + title + subtitle */
        .header-title-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        /* Title và badge trên cùng 1 hàng */
        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Bên phải: stats tách hoàn toàn */
        .header-right {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        /* Accent bar */
        .header-accent {
          position: absolute;
          bottom: -8px;
          left: 24px;
          right: 24px;
          height: 4px;
          background: linear-gradient(135deg, #ff8a00 0%, #e52e71 100%);
          border-radius: 4px;
          opacity: 0.7;
        }

        /* Back button */
        .back-button {
          font-size: 20px;
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
          color: #475569;
          flex-shrink: 0;
        }

        .back-button:hover {
          background: #ff8a00;
          color: white;
          transform: translateX(-2px);
          border-color: #ff8a00;
        }

        /* Breadcrumb */
        .breadcrumb-link {
          cursor: pointer;
          color: #64748b;
          transition: color 0.2s;
        }

        .breadcrumb-link:hover {
          color: #e52e71;
        }

        .breadcrumb-current {
          color: #1e293b;
          font-weight: 500;
        }

        /* Page title */
        .page-title {
          margin: 0 !important;
          font-weight: 700 !important;
          font-size: 26px !important;
          color: #1e293b !important;
          line-height: 1.2 !important;
        }

        /* Badge cạnh title */
        .header-badge :global(.ant-badge-status-text) {
          color: #64748b;
          font-size: 13px;
          font-weight: 400;
        }

        /* Subtitle */
        .page-subtitle {
          color: #64748b;
          font-size: 13px;
          display: block;
          margin-top: 2px;
        }

        /* =========================================
           STATS COMPONENT
        ========================================= */
        .stats-container {
          display: flex;
          align-items: center;
          background: white;
          padding: 12px 20px;
          border-radius: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 16px;
        }

        .stat-label {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, transparent, #e2e8f0, transparent);
        }

        /* =========================================
           FORM & EDITOR
        ========================================= */
        .post-form {
          max-width: 1600px;
          margin: 0 auto;
        }

        .editor-card {
          border-radius: 24px;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(4px);
        }

        .editor-card :global(.ant-card-body) {
          padding: 28px;
        }

        .form-label {
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          font-size: 15px;
        }

        .title-input {
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 12px 18px;
          font-size: 18px;
          font-weight: 500;
        }

        .title-input:focus,
        .title-input:global(.ant-input-focused) {
          border-color: #ff8a00;
          box-shadow: 0 0 0 3px rgba(255, 138, 0, 0.1);
        }

        .slug-input {
          border-radius: 16px;
        }

        .slug-addon {
          font-weight: 500;
          color: #475569;
        }

        .slug-help {
          font-size: 12px;
          color: #64748b;
        }

        .slug-help strong {
          color: #ff8a00;
          font-weight: 600;
        }

        .editor-divider {
          margin: 28px 0;
          border-color: #e2e8f0;
        }

        .ckeditor-wrapper {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
          background: white;
        }

        .ckeditor-wrapper:focus-within {
          border-color: #ff8a00;
          box-shadow: 0 0 0 3px rgba(255, 138, 0, 0.1);
        }

        .editor-toolbar-actions {
          position: absolute;
          top: 12px;
          right: 16px;
          z-index: 10;
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(4px);
          padding: 4px;
          border-radius: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .editor-toolbar-actions :global(.ant-btn) {
          color: #64748b;
        }

        .editor-toolbar-actions :global(.ant-btn:hover) {
          color: #ff8a00;
          background: rgba(255, 138, 0, 0.1);
        }

        .fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: white;
          padding: 20px;
          border-radius: 0;
        }

        /* =========================================
           SIDEBAR
        ========================================= */
        .sidebar-sticky {
          position: sticky;
          top: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .publish-card,
        .taxonomy-card {
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
        }

        .publish-card :global(.ant-card-body),
        .taxonomy-card :global(.ant-card-body) {
          padding: 24px;
        }

        .card-header {
          margin-bottom: 20px;
        }

        .card-header h5 {
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .status-select :global(.ant-select-selector) {
          border-radius: 16px !important;
          padding: 8px 12px !important;
          height: auto !important;
        }

        .stats-box {
          margin: 24px 0;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 20px;
          padding: 20px;
          border: 1px solid #e2e8f0;
        }

        .submit-button {
  border-radius: 16px !important;
  height: 52px !important;
  font-weight: 700 !important;
  font-size: 16px !important;
  background: linear-gradient(135deg, #ff8a00 0%, #e52e71 100%) !important;
  background-size: 200% 200% !important;
  background-position: 0% 50% !important;
  border: none !important;
  transition: background-position 0.4s ease, box-shadow 0.3s ease, transform 0.3s ease !important;
  box-shadow: 0 4px 12px rgba(255, 138, 0, 0.3) !important;
  animation: gradientShift 4s ease infinite !important;
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Override tất cả các state của Ant Design */
.submit-button:hover,
.submit-button:focus,
.submit-button:active,
.submit-button.ant-btn-primary:hover,
.submit-button.ant-btn-primary:focus,
.submit-button.ant-btn-primary:active {
  background: linear-gradient(135deg, #e52e71 0%, #6f00ff 100%) !important;
  background-size: 200% 200% !important;
  animation: gradientShiftHover 1.5s ease infinite !important;
  transform: translateY(-2px) scale(1.02) !important;
  box-shadow: 0 8px 20px rgba(229, 46, 113, 0.45) !important;
  border: none !important;
  color: white !important;
}

@keyframes gradientShiftHover {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.submit-button:active,
.submit-button.ant-btn-primary:active {
  transform: translateY(0px) scale(0.98) !important;
  box-shadow: 0 3px 8px rgba(229, 46, 113, 0.3) !important;
  transition: all 0.1s ease !important;
}

/* Đảm bảo text luôn trắng */
.submit-button,
.submit-button span {
  color: white !important;
}

/* Disable animation khi loading */
.submit-button.ant-btn-loading {
  animation: none !important;
  background: linear-gradient(135deg, #ff8a00 0%, #e52e71 100%) !important;
}

        .tags-select :global(.ant-select-selector) {
          border-radius: 16px !important;
          padding: 8px 12px !important;
        }

        /* =========================================
           CKEDITOR OVERRIDES
        ========================================= */
        :global(.ck.ck-editor__editable_inline) {
          min-height: 400px;
          max-height: 600px;
          padding: 20px 24px !important;
        }

        :global(.ck.ck-editor) {
          width: 100%;
        }

        :global(.ck.ck-toolbar) {
          border-radius: 20px 20px 0 0 !important;
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background: #fafbfc !important;
          padding: 8px 12px !important;
        }

        :global(.ck.ck-editor__main > .ck-editor__editable) {
          border-radius: 0 0 20px 20px !important;
          border: none !important;
        }

        :global(.ck-content .image) {
          margin: 20px auto;
        }

        :global(.ck-content .image img) {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        /* =========================================
           RESPONSIVE
        ========================================= */
        @media (max-width: 1200px) {
          .header-card {
            padding: 20px;
          }
        }

        @media (max-width: 992px) {
          .header-top-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-right {
            margin-left: 60px;
          }

          .sidebar-sticky {
            position: static;
          }

          .editor-card :global(.ant-card-body) {
            padding: 20px;
          }
        }

        @media (max-width: 768px) {
          .post-create-container {
            padding: 16px;
          }

          .header-card {
            padding: 16px;
          }

          .header-left {
            gap: 12px;
          }

          .back-button {
            width: 40px;
            height: 40px;
            min-width: 40px;
          }

          .page-title {
            font-size: 20px !important;
          }

          .header-right {
            margin-left: 52px;
          }

          :global(.ck.ck-editor__editable_inline) {
            min-height: 300px;
            padding: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .post-create-container {
            padding: 12px;
          }

          .header-top-row {
            gap: 16px;
          }

          .header-right {
            margin-left: 0;
            width: 100%;
          }

          .stats-container {
            width: 100%;
            justify-content: center;
          }

          .page-title {
            font-size: 18px !important;
          }

          .page-subtitle {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
