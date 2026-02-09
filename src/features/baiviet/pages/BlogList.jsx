import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Spin, message } from "antd";
import { postService } from "@utils/postService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import "./baiviet.css";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const BASE = (import.meta.env.BASE_URL || "/");

export default function BlogList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortKey, setSortKey] = useState("newest");
    const [openSort, setOpenSort] = useState(false);

    const pageSize = 9; // Match the grid size (3x3)

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = {
                page: current - 1,
                size: pageSize,
                sort: sortKey === "newest" ? "id,desc" : "id,asc"
            };
            const response = await postService.getPosts(params);
            const data = response.data;

            if (data.content) {
                setPosts(data.content);
                setTotal(data.totalElements);
            } else if (Array.isArray(data)) {
                setPosts(data);
                setTotal(data.length);
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error(error);
            message.error("Không thể tải bài viết");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [current, sortKey]);

    const handlePageChange = (page) => {
        setCurrent(page);
        window.scrollTo(0, 0);
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="baiviet-wrapper">
            {/* BANNER */}
            <div className="baiviet-banner">
                <div className="baiviet-banner-content">
                    <p className="breadcrumb">
                        <Link to="/" className="crumb">Trang chủ</Link>
                        <span className="separator"> / </span>
                        <span className="crumb active">Bài viết</span>
                    </p>
                    <h1>Bài viết</h1>
                </div>
            </div>

            <div className="baiviet-container">
                <div className="baiviet-header">
                    <h3>
                        Tất cả bài viết <span>({total})</span>
                    </h3>

                    <div className="sort-dropdown-wrapper">
                        <div
                            className="sort-selected"
                            onClick={() => setOpenSort(!openSort)}
                        >
                            {sortKey === "newest" ? "Mới nhất" : "Cũ nhất"} ▼
                        </div>

                        {openSort && (
                            <div className="sort-menu">
                                <span
                                    className={sortKey === "newest" ? "active" : ""}
                                    onClick={() => {
                                        setSortKey("newest");
                                        setOpenSort(false);
                                    }}
                                >
                                    Mới nhất
                                </span>
                                <span
                                    className={sortKey === "oldest" ? "active" : ""}
                                    onClick={() => {
                                        setSortKey("oldest");
                                        setOpenSort(false);
                                    }}
                                >
                                    Cũ nhất
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        <div className="baiviet-list">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/bai-viet/${post.id}`}
                                    className="baiviet-card"
                                >
                                    <img
                                        src={post.image || `${BASE}blog-sample.png`}
                                        alt={post.title}
                                        onError={(e) => (e.currentTarget.src = `${BASE}blog-sample.png`)}
                                    />

                                    <div className="baiviet-info">
                                        <p className="category">
                                            {(post.tags && post.tags.length > 0) ? post.tags[0] : (post.tagNames && post.tagNames.length > 0) ? post.tagNames[0] : "General"}
                                        </p>
                                        <h4>{post.title}</h4>

                                        <div className="meta">
                                            <span>🕒 {dayjs(post.createdAt).fromNow()}</span>
                                            {/* <span>👁️ {post.viewCount || 0} lượt xem</span> */}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="baiviet-pagination">
                                <button
                                    className={current === 1 ? "disable" : ""}
                                    onClick={() => current > 1 && handlePageChange(current - 1)}
                                    disabled={current === 1}
                                >
                                    ← Trước
                                </button>

                                <div className="pages">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <span
                                            key={i + 1}
                                            className={current === i + 1 ? "active" : ""}
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    className={current === totalPages ? "disable" : ""}
                                    onClick={() => current < totalPages && handlePageChange(current + 1)}
                                    disabled={current === totalPages}
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
