import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { postService } from "@utils/postService";
import { uploadService } from "@utils/uploadService";
import { SERVER_URL } from "@config";

const CKEDITOR_TOOLBAR = [
    "heading", "|", "bold", "italic", "underline", "|", "bulletedList", "numberedList", "blockQuote", "|", "undo", "redo",
];

export default function PostCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        imageUrl: "",
        tagNames: [],
        status: "PUBLISHED"
    });
    const [tagInput, setTagInput] = useState("");

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await uploadService.uploadImage(file);
            const url = res.data.url || res.data;
            setFormData(prev => ({ ...prev, imageUrl: url }));
        } catch (err) {
            alert("Upload ảnh thất bại");
        } finally {
            setUploading(false);
        }
    };

    const generateSlug = (str) => {
        return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/([^0-9a-z-\s])/g, "").replace(/(\s+)/g, "-").replace(/^-+|-+$/g, "");
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = generateSlug(title);
        setFormData({ ...formData, title, slug });
    };

    const handleAddTag = (e) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tagNames.includes(tagInput.trim())) {
                setFormData({ ...formData, tagNames: [...formData.tagNames, tagInput.trim()] });
            }
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({ ...formData, tagNames: formData.tagNames.filter(tag => tag !== tagToRemove) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        setLoading(true);
        try {
            const userStr = localStorage.getItem("loggedInUser");
            const user = userStr ? JSON.parse(userStr) : {};
            const payload = {
                title: formData.title,
                slug: formData.slug,
                content: formData.content,
                imageUrl: formData.imageUrl,
                authorId: user.id || 1,
                tagNames: formData.tagNames,
                status: formData.status,
            };
            await postService.createPost(payload);
            alert("✅ Tạo bài viết thành công!");
            navigate("/admin/posts");
        } catch (error) {
            alert("❌ Tạo bài viết thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate("/admin/posts")} style={styles.backButton}>← Quay lại</button>
                <div>
                    <div style={styles.breadcrumb}>Admin / Bài viết / Tạo mới</div>
                    <h1 style={styles.pageTitle}>✍️ Viết bài mới</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={styles.layout}>
                    <div style={styles.mainContent}>
                        <div style={styles.card}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tiêu đề bài viết <span style={styles.required}>*</span></label>
                                <input type="text" value={formData.title} onChange={handleTitleChange} placeholder="Nhập tiêu đề hấp dẫn..." style={styles.inputTitle} required />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Đường dẫn (Slug) <span style={styles.required}>*</span></label>
                                <div style={styles.slugWrapper}>
                                    <span style={styles.slugPrefix}>/bai-viet/</span>
                                    <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="url-bai-viet" style={styles.slugInput} required />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Hình ảnh đại diện bài viết</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                                    <label style={styles.uploadBtn}>
                                        📷 {uploading ? "Đang tải..." : "Chọn ảnh từ máy tính"}
                                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} hidden />
                                    </label>

                                    {formData.imageUrl && (
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <img
                                                src={formData.imageUrl.startsWith("http") ? formData.imageUrl : `${SERVER_URL}${formData.imageUrl.startsWith("/") ? "" : "/"}${formData.imageUrl}`}
                                                alt="Preview"
                                                style={{ height: '50px', width: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                            />
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, imageUrl: "" }))} style={styles.removeSmallBtn}>×</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={styles.divider} />

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nội dung bài viết <span style={styles.required}>*</span></label>
                                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={formData.content}
                                        config={{ toolbar: CKEDITOR_TOOLBAR, placeholder: "Viết nội dung..." }}
                                        onChange={(event, editor) => setFormData(p => ({ ...p, content: editor.getData() }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.sidebar}>
                        <div style={styles.sidebarCard}>
                            <h3 style={styles.sidebarTitle}>📝 Đăng bài</h3>
                            <div style={styles.formGroup}>
                                <label style={styles.sidebarLabel}>Trạng thái:</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={styles.select}>
                                    <option value="PUBLISHED">🟢 Xuất bản ngay</option>
                                    <option value="DRAFT">🟡 Lưu nháp</option>
                                    <option value="ARCHIVED">🔴 Lưu trữ</option>
                                </select>
                            </div>
                            <button type="submit" disabled={loading || uploading} style={styles.publishButton}>{loading ? "⏳ Đang xuất bản..." : "💾 Lưu bài viết"}</button>
                        </div>

                        <div style={{ ...styles.sidebarCard, marginTop: '16px' }}>
                            <h3 style={styles.sidebarTitle}>🏷️ Thẻ (Tags)</h3>
                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Nhập tag và Enter..." style={styles.tagInput} />
                            <div style={styles.tagsContainer}>
                                {formData.tagNames.map((tag, index) => (
                                    <span key={index} style={styles.tag}>{tag}<button type="button" onClick={() => handleRemoveTag(tag)} style={styles.tagRemove}>×</button></span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

const styles = {
    container: { padding: '24px', maxWidth: '1400px', margin: '0 auto', background: '#f9fafb', minHeight: '100vh', fontFamily: '"Inter", sans-serif' },
    header: { marginBottom: '32px' },
    backButton: { background: 'white', border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' },
    breadcrumb: { fontSize: '13px', color: '#9ca3af', marginBottom: '8px' },
    pageTitle: { fontSize: '32px', fontWeight: '700', color: '#111827', margin: 0 },
    layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' },
    mainContent: { flex: 1 },
    sidebar: { position: 'sticky', top: '24px', height: 'fit-content' },
    card: { background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
    sidebarCard: { background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' },
    sidebarTitle: { fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' },
    sidebarLabel: { fontSize: '13px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '8px' },
    formGroup: { marginBottom: '24px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
    required: { color: '#ef4444' },
    inputTitle: { width: '100%', padding: '12px 16px', fontSize: '18px', border: '2px solid #e5e7eb', borderRadius: '10px', outline: 'none' },
    slugWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', overflow: 'hidden' },
    slugPrefix: { padding: '10px 12px', color: '#9ca3af', fontSize: '14px', background: '#f3f4f6', borderRight: '1px solid #e5e7eb' },
    slugInput: { flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '14px' },
    divider: { height: '1px', background: '#e5e7eb', margin: '24px 0' },
    select: { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' },
    publishButton: { width: '100%', padding: '14px 20px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
    tagInput: { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '12px' },
    tagsContainer: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    tag: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#3b82f6', color: 'white', borderRadius: '6px', fontSize: '13px' },
    tagRemove: { background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' },
    uploadBtn: { background: '#f8fafc', border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#374151' },
    removeSmallBtn: { position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }
};
