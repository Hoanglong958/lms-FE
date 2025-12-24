import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postService } from "@utils/postService";

export default function PostCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        tagNames: [],
        status: "PUBLISHED"
    });
    const [tagInput, setTagInput] = useState("");

    // Auto-generate slug from title
    const generateSlug = (str) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = generateSlug(title);
        setFormData({ ...formData, title, slug });
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tagNames.includes(tagInput.trim())) {
                setFormData({
                    ...formData,
                    tagNames: [...formData.tagNames, tagInput.trim()]
                });
            }
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tagNames: formData.tagNames.filter(tag => tag !== tagToRemove)
        });
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
                authorId: user.id || 1,
                tagNames: formData.tagNames,
                status: formData.status,
            };

            await postService.createPost(payload);
            alert("✅ Tạo bài viết thành công!");
            navigate("/admin/posts");
        } catch (error) {
            console.error(error);
            alert("❌ Tạo bài viết thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const suggestedTags = ['Java', 'Spring Boot', 'ReactJS', 'Frontend', 'Backend', 'Tutorial', 'Tips'];

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button
                    onClick={() => navigate("/admin/posts")}
                    style={styles.backButton}
                    onMouseOver={e => e.currentTarget.style.background = styles.backButtonHover.background}
                    onMouseOut={e => e.currentTarget.style.background = styles.backButton.background}
                >
                    ← Quay lại
                </button>
                <div>
                    <div style={styles.breadcrumb}>
                        Admin / Bài viết / Tạo mới
                    </div>
                    <h1 style={styles.pageTitle}>✍️ Viết bài mới</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={styles.layout}>
                    {/* Main Content */}
                    <div style={styles.mainContent}>
                        <div style={styles.card}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Tiêu đề bài viết <span style={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="Nhập tiêu đề hấp dẫn..."
                                    style={styles.inputTitle}
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Đường dẫn (Slug) <span style={styles.required}>*</span>
                                </label>
                                <div style={styles.slugWrapper}>
                                    <span style={styles.slugPrefix}>/bai-viet/</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="url-bai-viet"
                                        style={styles.slugInput}
                                        required
                                    />
                                </div>
                                <div style={styles.helpText}>
                                    Đường dẫn URL thân thiện với SEO, tự động tạo từ tiêu đề
                                </div>
                            </div>

                            <div style={styles.divider} />

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Nội dung bài viết <span style={styles.required}>*</span>
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Viết nội dung của bạn ở đây... (Hỗ trợ HTML/Markdown)"
                                    style={styles.textarea}
                                    rows={20}
                                    required
                                />
                                <div style={styles.charCount}>
                                    {formData.content.length} ký tự
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={styles.sidebar}>
                        {/* Publish Card */}
                        <div style={styles.sidebarCard}>
                            <h3 style={styles.sidebarTitle}>📝 Đăng bài</h3>

                            <div style={styles.formGroup}>
                                <label style={styles.sidebarLabel}>Trạng thái:</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    style={styles.select}
                                >
                                    <option value="PUBLISHED">🟢 Xuất bản ngay</option>
                                    <option value="DRAFT">🟡 Lưu nháp</option>
                                    <option value="ARCHIVED">🔴 Lưu trữ</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={styles.publishButton}
                            >
                                {loading ? "⏳ Đang xuất bản..." : (
                                    <>💾 {formData.status === 'PUBLISHED' ? 'Xuất bản bài viết' : 'Lưu bài viết'}</>
                                )}
                            </button>
                        </div>

                        {/* Tags Card */}
                        <div style={{ ...styles.sidebarCard, marginTop: '16px' }}>
                            <h3 style={styles.sidebarTitle}>🏷️ Thẻ (Tags)</h3>

                            <div style={styles.formGroup}>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Nhập tag và Enter..."
                                    style={styles.tagInput}
                                />
                                <div style={styles.helpText}>
                                    Giúp bài viết dễ tìm kiếm hơn
                                </div>
                            </div>

                            {/* Current Tags */}
                            {formData.tagNames.length > 0 && (
                                <div style={styles.tagsContainer}>
                                    {formData.tagNames.map((tag, index) => (
                                        <span key={index} style={styles.tag}>
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                style={styles.tagRemove}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Suggested Tags */}
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                                    Gợi ý:
                                </div>
                                <div style={styles.tagsContainer}>
                                    {suggestedTags.filter(t => !formData.tagNames.includes(t)).map((tag, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                tagNames: [...formData.tagNames, tag]
                                            })}
                                            style={styles.suggestedTag}
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tips Card */}
                        <div style={{ ...styles.sidebarCard, marginTop: '16px', background: '#fef3c7', border: '1px solid #fbbf24' }}>
                            <h3 style={{ ...styles.sidebarTitle, color: '#92400e' }}>💡 Mẹo viết bài</h3>
                            <ul style={styles.tipsList}>
                                <li>Tiêu đề ngắn gọn, súc tích</li>
                                <li>Sử dụng markdown cho format</li>
                                <li>Thêm tags phù hợp</li>
                                <li>Kiểm tra chính tả trước khi đăng</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        background: '#f9fafb',
        minHeight: '100vh',
        fontFamily: '"Inter", -apple-system, sans-serif',
    },
    header: {
        marginBottom: '32px',
    },
    backButton: {
        background: 'white',
        border: '1px solid #e5e7eb',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '16px',
        transition: 'all 0.2s',
    },
    backButtonHover: {
        background: '#f3f4f6'
    },
    breadcrumb: {
        fontSize: '13px',
        color: '#9ca3af',
        marginBottom: '8px',
    },
    pageTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#111827',
        margin: 0,
    },
    layout: {
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '24px',
    },
    mainContent: {
        flex: 1,
    },
    sidebar: {
        position: 'sticky',
        top: '24px',
        height: 'fit-content',
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
    },
    sidebarCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
    },
    sidebarTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#111827',
        marginTop: 0,
        marginBottom: '16px',
    },
    sidebarLabel: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#6b7280',
        display: 'block',
        marginBottom: '8px',
    },
    formGroup: {
        marginBottom: '24px',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
    },
    required: {
        color: '#ef4444',
    },
    inputTitle: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '18px',
        fontWeight: '500',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        outline: 'none',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
    },
    slugWrapper: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        background: '#f9fafb',
        overflow: 'hidden',
    },
    slugPrefix: {
        padding: '10px 12px',
        color: '#9ca3af',
        fontSize: '14px',
        background: '#f3f4f6',
        borderRight: '1px solid #e5e7eb',
    },
    slugInput: {
        flex: 1,
        padding: '10px 12px',
        border: 'none',
        background: '#f9fafb',
        outline: 'none',
        fontSize: '14px',
        fontFamily: 'monospace',
    },
    helpText: {
        fontSize: '12px',
        color: '#9ca3af',
        marginTop: '6px',
    },
    divider: {
        height: '1px',
        background: '#e5e7eb',
        margin: '24px 0',
    },
    textarea: {
        width: '100%',
        padding: '16px',
        fontSize: '15px',
        lineHeight: '1.8',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        outline: 'none',
        resize: 'vertical',
        fontFamily: '"Inter", sans-serif',
        transition: 'all 0.2s',
    },
    charCount: {
        fontSize: '12px',
        color: '#9ca3af',
        textAlign: 'right',
        marginTop: '6px',
    },
    select: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        cursor: 'pointer',
        background: 'white',
    },
    publishButton: {
        width: '100%',
        padding: '14px 20px',
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s',
        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
        marginTop: '8px',
    },
    tagInput: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
    },
    tagsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    tag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
    },
    tagRemove: {
        background: 'rgba(255,255,255,0.3)',
        border: 'none',
        color: 'white',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '16px',
        lineHeight: '1',
        padding: 0,
    },
    suggestedTag: {
        padding: '6px 12px',
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#4b5563',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    tipsList: {
        fontSize: '13px',
        color: '#78350f',
        margin: 0,
        paddingLeft: '20px',
        lineHeight: '1.8',
    },
};
