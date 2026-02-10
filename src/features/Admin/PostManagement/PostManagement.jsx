import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, Clock, TrendingUp, CheckCircle2, Edit, Trash2, ChevronDown } from "lucide-react";
import { postService } from "@utils/postService";
import dayjs from "dayjs";

export default function PostManagement() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const navigate = useNavigate();

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await postService.getPosts({ page: 0, size: 100, status: "ALL" });
            const raw = response?.data;
            let data = [];
            if (Array.isArray(raw)) data = raw;
            else if (Array.isArray(raw?.content)) data = raw.content;
            else if (Array.isArray(raw?.data)) data = raw.data;
            else if (Array.isArray(raw?.data?.content)) data = raw.data.content;
            else if (Array.isArray(response?.data?.data)) data = response.data.data;
            else if (Array.isArray(response?.data?.data?.content)) data = response.data.data.content;
            setPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            alert("Không thể tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
        (async () => {
            try {
                await postService.deletePost(id);
                alert("Xóa bài viết thành công");
                fetchPosts();
            } catch {
                alert("Xóa bài viết thất bại");
            }
        })();
    };

    // Filter posts based on search and status
    const q = searchText.trim().toLowerCase();
    const filtered = posts.filter(post => {
        const matchText = q ? post.title.toLowerCase().includes(q) : true;
        const matchStatus = statusFilter === "ALL" ? true : post.status === statusFilter;
        return matchText && matchStatus;
    });

    // Calculate stats
    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'PUBLISHED').length,
        draft: posts.filter(p => p.status === 'DRAFT').length,
        archived: posts.filter(p => p.status === 'ARCHIVED').length,
        recent: posts.filter(p => {
            const created = dayjs(p.createdAt);
            return created.isAfter(dayjs().subtract(7, 'day'));
        }).length
    };

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const curPage = Math.min(page, totalPages);
    const start = (curPage - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    return (
        <div style={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            background: "#f5f5f5",
            minHeight: "100vh",
            padding: "28px 24px"
        }}>
            {/* Breadcrumbs */}
            <div style={{
                fontSize: 13,
                marginBottom: 16,
                fontWeight: 500
            }}>
                <span style={{ color: '#f97316', fontWeight: 600 }}>Quản lý bài viết</span>
                <span style={{ color: '#d1d5db', margin: '0 4px' }}> / </span>
                <span style={{ color: '#9ca3af' }}>Dashboard</span>
                <span style={{ color: '#d1d5db', margin: '0 4px' }}> / </span>
                <span style={{ color: '#374151', fontWeight: 600 }}>Tất cả bài viết</span>
            </div>

            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 32
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                        flexShrink: 0
                    }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#111827',
                            margin: '0 0 4px 0',
                            lineHeight: 1.2
                        }}>Quản lý bài viết</h1>
                        <p style={{
                            fontSize: 14,
                            color: '#6b7280',
                            margin: 0,
                            fontWeight: 500
                        }}>
                            Quản lý và theo dõi tất cả bài viết trên hệ thống
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => navigate("create")}
                    style={{
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
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ea580c';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f97316';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.2)';
                    }}
                >
                    + Tạo bài viết mới
                </button>
            </header>

            {/* Stats Grid */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 20,
                marginBottom: 32
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>Tổng bài viết</h3>
                        <p style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1
                        }}>{stats.total}</p>
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#fff7ed',
                        color: '#f97316'
                    }}>
                        <FileText size={20} />
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>Đã xuất bản</h3>
                        <p style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1
                        }}>{stats.published}</p>
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f0fdf4',
                        color: '#16a34a'
                    }}>
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>Bản nháp</h3>
                        <p style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1
                        }}>{stats.draft}</p>
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#eff6ff',
                        color: '#2563eb'
                    }}>
                        <Clock size={20} />
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>Mới 7 ngày</h3>
                        <p style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1
                        }}>{stats.recent}</p>
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#faf5ff',
                        color: '#9333ea'
                    }}>
                        <TrendingUp size={20} />
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <section style={{
                background: 'white',
                borderRadius: 12,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: 24,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        pointerEvents: 'none'
                    }} size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết theo tiêu đề..."
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPage(1);
                        }}
                        style={{
                            width: '100%',
                            padding: '10px 16px 10px 42px',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            fontSize: 14,
                            color: '#374151',
                            background: '#fafafa',
                            transition: 'all 0.2s',
                            outline: 'none'
                        }}
                        onFocus={(e) => {
                            e.target.style.background = 'white';
                            e.target.style.borderColor = '#f97316';
                            e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.background = '#fafafa';
                            e.target.style.borderColor = '#e5e7eb';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        style={{
                            padding: '10px 40px 10px 16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            background: '#fafafa',
                            color: '#374151',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                            appearance: 'none',
                            minWidth: 180,
                            outline: 'none'
                        }}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PUBLISHED">Đã xuất bản</option>
                        <option value="DRAFT">Bản nháp</option>
                        <option value="ARCHIVED">Lưu trữ</option>
                    </select>
                    <ChevronDown style={{
                        position: 'absolute',
                        right: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        pointerEvents: 'none'
                    }} size={16} />
                </div>

                <span style={{
                    fontSize: 14,
                    color: '#6b7280',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                    padding: '0 8px'
                }}>
                    {filtered.length} kết quả
                </span>
            </section>

            {/* Table */}
            <section style={{
                background: 'white',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#fafafa' }}>
                            <th style={{
                                padding: '14px 24px',
                                textAlign: 'left',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 60
                            }}>ID</th>
                            <th style={{
                                padding: '14px 24px',
                                textAlign: 'left',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb'
                            }}>Thông tin bài viết</th>
                            <th style={{
                                padding: '14px 24px',
                                textAlign: 'left',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 150
                            }}>Tác giả</th>
                            <th style={{
                                padding: '14px 24px',
                                textAlign: 'left',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 200
                            }}>Tags</th>
                            <th style={{
                                padding: '14px 24px',
                                textAlign: 'left',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 120
                            }}>Trạng thái</th>
                            <th style={{
                                padding: '14px 24px',
                                textAlign: 'left',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 120
                            }}>Ngày tạo</th>
                            <th style={{
                                padding: '14px 24px',
                                textAlign: 'right',
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 100
                            }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: '#6b7280' }}>Đang tải dữ liệu...</td>
                            </tr>
                        ) : pageItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: '#6b7280' }}>Không có bài viết nào</td>
                            </tr>
                        ) : (
                            pageItems.map((post) => (
                                <tr key={post.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', color: '#9ca3af', fontSize: 14 }}>#{post.id}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div>
                                            <span
                                                onClick={() => navigate(`${post.id}/edit`)}
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: 15,
                                                    color: '#374151',
                                                    cursor: 'pointer',
                                                    transition: 'color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.color = '#f97316'}
                                                onMouseLeave={(e) => e.target.style.color = '#374151'}
                                            >
                                                {post.title}
                                            </span>
                                            <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginTop: 2 }}>
                                                Slug: {post.slug}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: '#fff7ed',
                                                color: '#f97316',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 12,
                                                fontWeight: 700
                                            }}>
                                                {(post.author?.fullName || "A").charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: 14, color: '#374151' }}>{post.author?.fullName || "Admin"}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {Array.isArray(post.tags) && post.tags.map((tag) => (
                                                <span key={tag} style={{
                                                    padding: '2px 8px',
                                                    borderRadius: 4,
                                                    background: '#e0f2fe',
                                                    color: '#0284c7',
                                                    fontSize: 12,
                                                    fontWeight: 500
                                                }}>{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: 20,
                                            background: post.status === "PUBLISHED" ? '#dcfce7' : post.status === "DRAFT" ? '#fef3c7' : '#f1f5f9',
                                            color: post.status === "PUBLISHED" ? '#16a34a' : post.status === "DRAFT" ? '#d97706' : '#64748b',
                                            fontSize: 12,
                                            fontWeight: 600
                                        }}>
                                            {post.status === "PUBLISHED" ? "Xuất bản" : post.status === "DRAFT" ? "Nháp" : "Lưu trữ"}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: 14 }}>
                                        {dayjs(post.createdAt).format("DD/MM/YYYY")}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => navigate(`${post.id}/edit`)}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 6,
                                                background: '#f1f5f9',
                                                border: 'none',
                                                cursor: 'pointer',
                                                marginRight: 6,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#3b82f6'
                                            }}
                                            title="Sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 6,
                                                background: '#fee2e2',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#ef4444'
                                            }}
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderTop: '1px solid #f1f5f9'
                }}>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>
                        Tổng {filtered.length} bài viết
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={curPage <= 1}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                color: curPage <= 1 ? '#9ca3af' : '#374151',
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: curPage <= 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            ‹ Trước
                        </button>
                        <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
                            Trang {curPage}/{totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={curPage >= totalPages}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                color: curPage >= totalPages ? '#9ca3af' : '#374151',
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: curPage >= totalPages ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Sau ›
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
