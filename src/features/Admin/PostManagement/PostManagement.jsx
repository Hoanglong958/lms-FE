import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { postService } from "@utils/postService";
import dayjs from "dayjs";
import {
    FileText,
    Clock,
    CheckCircle2,
    Search,
    ChevronDown,
    Sparkles,
    FileEdit,
    Tag as TagIcon
} from "lucide-react";

export default function PostManagement() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal states
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await postService.getPosts({ page: 0, size: 1000 });
            const raw = response?.data;
            let data = [];
            if (Array.isArray(raw)) data = raw;
            else if (Array.isArray(raw?.content)) data = raw.content;
            else if (Array.isArray(raw?.data)) data = raw.data;
            else if (Array.isArray(raw?.data?.content)) data = raw.data.content;

            setPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleRequestDelete = (post) => {
        setConfirmDelete(post);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await postService.deletePost(confirmDelete.id);
            fetchPosts();
            setConfirmDelete(null);
        } catch (error) {
            console.error("Delete failed", error);
            alert("Xóa bài viết thất bại"); // Minimal fallback
        }
    };

    // Stats
    const stats = useMemo(() => {
        const total = posts.length;
        const published = posts.filter(p => p.status === 'PUBLISHED').length;
        const drafts = posts.filter(p => p.status === 'DRAFT').length;
        // Calculate recent (last 30 days)
        const recent = posts.filter(p => {
            if (!p.createdAt) return false;
            const d = new Date(p.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return d >= thirtyDaysAgo;
        }).length;

        return { total, published, drafts, recent };
    }, [posts]);

    // Filter
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchSearch = post.title.toLowerCase().includes(searchText.toLowerCase());
            const matchStatus = statusFilter === 'all'
                ? true
                : statusFilter === 'published'
                    ? post.status === 'PUBLISHED'
                    : post.status !== 'PUBLISHED';
            return matchSearch && matchStatus;
        });
    }, [posts, searchText, statusFilter]);

    return (
        <div style={styles.page}>
            {/* Breadcrumbs */}
            <div style={styles.breadcrumbs}>
                <span style={{ color: '#f97316', fontWeight: 600 }}>Quản lý bài viết</span>
                <span style={{ color: '#d1d5db', margin: '0 4px' }}> / </span>
                <span style={{ color: '#9ca3af' }}>Dashboard</span>
                <span style={{ color: '#d1d5db', margin: '0 4px' }}> / </span>
                <span style={{ color: '#374151', fontWeight: 600 }}>Tất cả bài viết</span>
            </div>

            {/* Header */}
            <header style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    <div style={styles.headerIcon}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 style={styles.title}>Danh sách bài viết</h1>
                        <p style={styles.subtitle}>
                            Quản lý và theo dõi tất cả bài viết trên hệ thống
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => navigate("create")}
                    style={styles.primaryButton}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ea580c';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f97316';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.2)';
                    }}
                >
                    {/* Reuse Plus Icon or keep explicit */}
                    <span style={{ fontSize: 18, marginRight: 4 }}>+</span> Tạo bài viết mới
                </button>
            </header>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 }}>
                {[
                    { label: "Tổng bài viết", value: stats.total, icon: <FileText size={24} />, color: "#f97316", bg: "#fff7ed" },
                    { label: "Đã xuất bản", value: stats.published, icon: <CheckCircle2 size={24} />, color: "#10b981", bg: "#ecfdf5" },
                    { label: "Bản nháp", value: stats.drafts, icon: <FileEdit size={24} />, color: "#3b82f6", bg: "#eff6ff" },
                    { label: "Mới (30 ngày)", value: stats.recent, icon: <Clock size={24} />, color: "#a855f7", bg: "#faf5ff" }
                ].map((stat, index) => (
                    <div key={index} style={{
                        borderRadius: 16,
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        minHeight: 140,
                        justifyContent: "space-between",
                        backgroundColor: stat.bg,
                        border: "none"
                    }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 16,
                            backgroundColor: stat.color,
                            color: "#fff"
                        }}>
                            {stat.icon}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: "1", marginBottom: 8 }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: 14, color: "#4b5563", fontWeight: 500 }}>
                                {stat.label}
                            </div>
                        </div>
                        <div style={{ position: "absolute", top: 24, right: 24 }}>
                            <Sparkles size={20} color={stat.color} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <section style={styles.toolbar}>
                <div style={{ display: "flex", gap: 12, flex: 1 }}>
                    <div style={styles.searchWrap}>
                        <Search style={styles.searchIcon} size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.filterWrap}>
                        <div style={styles.filterIcon}>
                            <TagIcon size={16} />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={styles.select}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="draft">Bản nháp</option>
                        </select>
                        <ChevronDown style={styles.selectChevron} size={16} />
                    </div>
                </div>

                <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                    Tìm thấy: <span style={{ color: "#f97316", fontWeight: 700, background: "#fff7ed", padding: "2px 8px", borderRadius: 6 }}>{filteredPosts.length}</span> bài viết
                </div>
            </section>

            {/* Table */}
            <div style={styles.card}>
                <div style={{ overflowX: "auto" }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>THÔNG TIN BÀI VIẾT</th>
                                <th style={styles.th}>TÁC GIẢ</th>
                                <th style={styles.th}>TAGS</th>
                                <th style={styles.th}>TRẠNG THÁI</th>
                                <th style={styles.th}>NGÀY TẠO</th>
                                <th style={{ ...styles.th, textAlign: 'right' }}>THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                                        Không tìm thấy bài viết nào
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr key={post.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 600, color: '#111827', marginBottom: 2 }}>{post.title}</div>
                                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{post.slug}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 24, height: 24, borderRadius: '50%', background: '#fff7ed', color: '#f97316',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700
                                                }}>
                                                    {(post.author?.fullName || "A").charAt(0).toUpperCase()}
                                                </div>
                                                <span>{post.author?.fullName || "Admin"}</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {Array.isArray(post.tags) && post.tags.map(t => (
                                                    <span key={t} style={{
                                                        fontSize: 11, padding: '2px 8px', borderRadius: 4,
                                                        background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb'
                                                    }}>
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <StatusBadge status={post.status} />
                                        </td>
                                        <td style={styles.td}>
                                            {post.createdAt ? dayjs(post.createdAt).format("DD/MM/YYYY") : "---"}
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>
                                            <div style={styles.actionWrap}>
                                                <button
                                                    onClick={() => navigate(`${post.id}/edit`)}
                                                    title="Chỉnh sửa"
                                                    style={{ ...styles.iconButton, color: '#3b82f6', marginRight: 8 }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleRequestDelete(post)}
                                                    title="Xóa"
                                                    style={{ ...styles.iconButton, color: '#ef4444' }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Modal */}
            {confirmDelete && (
                <ConfirmModal
                    title="Xóa bài viết"
                    message={`Bạn có chắc chắn muốn xóa bài viết "${confirmDelete.title}"?`}
                    onCancel={() => setConfirmDelete(null)}
                    onConfirm={handleConfirmDelete}
                    confirmLabel="Xóa"
                />
            )}
        </div>
    );
}

// Reusable Components matching user.jsx style

function StatusBadge({ status }) {
    const isPublished = status === 'PUBLISHED';
    const style = isPublished
        ? { background: "rgba(16,185,129,0.12)", color: "#047857" }
        : { background: "rgba(245, 158, 11, 0.12)", color: "#b45309" }; // Draft = warning color

    return (
        <span style={{
            display: "inline-flex", alignItems: "center", padding: "4px 10px",
            borderRadius: 999, fontSize: 12, fontWeight: 600, ...style
        }}>
            {isPublished ? "Xuất bản" : "Bản nháp"}
        </span>
    );
}

function ConfirmModal({ title, message, onCancel, onConfirm, confirmLabel = "Xóa", confirmStyle }) {
    return (
        <div style={modalStyles.backdrop} role="dialog" aria-modal="true">
            <div style={modalStyles.container}>
                <div style={modalStyles.header}>
                    <h3 style={modalStyles.title}>{title}</h3>
                </div>
                <div style={modalStyles.body}>
                    <div style={{ color: "#374151", fontSize: 14 }}>{message}</div>
                </div>
                <div style={modalStyles.footer}>
                    <button type="button" onClick={onCancel} style={{ ...modalStyles.ghostBtn, cursor: "pointer" }}>
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        style={{ ...(confirmStyle || { ...styles.primaryButton, background: "#b91c1c", boxShadow: "0 2px 8px rgba(220,38,38,0.25)" }), cursor: "pointer", zIndex: 60 }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Styles
const styles = {
    page: {
        padding: "28px 24px",
        background: "#f7f8fa",
        minHeight: "100vh",
        fontFamily: '"Inter", sans-serif'
    },
    breadcrumbs: {
        display: "flex",
        alignItems: "center",
        fontSize: 13,
        marginBottom: 12
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 6px -1px rgba(249, 115, 22, 0.2)"
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 4px 0',
        lineHeight: 1.2
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        margin: 0,
        fontWeight: 500
    },
    primaryButton: {
        background: '#f97316',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)',
        transition: 'all 0.2s'
    },
    toolbar: {
        background: 'white',
        borderRadius: 12,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    searchWrap: {
        display: "flex",
        alignItems: "center",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "0 12px",
        height: 44,
        flex: 1,
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    },
    searchIcon: {
        color: "#9ca3af",
        marginRight: 8
    },
    searchInput: {
        border: "none",
        outline: "none",
        flex: 1,
        height: 40,
        fontSize: 14,
        background: "transparent",
        color: "#111827"
    },
    filterWrap: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center"
    },
    filterIcon: {
        position: "absolute",
        left: 12,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#9ca3af",
        pointerEvents: "none",
        zIndex: 1,
        display: "flex"
    },
    select: {
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        height: 44,
        padding: "0 36px 0 40px",
        fontSize: 14,
        color: "#111827",
        cursor: "pointer",
        minWidth: 180
    },
    selectChevron: {
        position: "absolute",
        right: 12,
        pointerEvents: "none",
        color: "#6b7280"
    },
    card: {
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        border: "1px solid #e5e7eb"
    },
    table: {
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0
    },
    th: {
        textAlign: "left",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color: "#6b7280",
        fontWeight: 600,
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
        background: "#f9fafb"
    },
    tr: {
        borderBottom: "1px solid #f3f4f6"
    },
    td: {
        padding: "16px 24px",
        color: "#111827",
        fontSize: 14,
        verticalAlign: "middle",
        borderBottom: "1px solid #f3f4f6"
    },
    actionWrap: {
        position: "relative",
        display: "flex", // Keep actions inline
        justifyContent: "flex-end"
    },
    iconButton: {
        background: "transparent",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        cursor: "pointer",
        padding: 6,
        color: "#6b7280",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};

const modalStyles = {
    backdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(17,24,39,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16
    },
    container: {
        width: "100%",
        maxWidth: 520,
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        boxShadow: "0 24px 48px rgba(17,24,39,0.18)",
        overflow: "hidden"
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderBottom: "1px solid #f3f4f6"
    },
    title: {
        margin: 0,
        fontSize: 18,
        fontWeight: 700,
        color: "#111827"
    },
    body: {
        padding: 16,
        display: "grid",
        rowGap: 12
    },
    footer: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
        padding: 16,
        borderTop: "1px solid #f3f4f6"
    },
    ghostBtn: {
        background: "transparent",
        border: "1px solid #e5e7eb",
        color: "#111827",
        padding: "10px 16px",
        borderRadius: 10,
        fontWeight: 600,
        cursor: "pointer"
    }
};
