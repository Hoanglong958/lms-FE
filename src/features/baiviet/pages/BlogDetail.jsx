import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { postService } from "@utils/postService";
import { commentService } from "@utils/commentService";
import { Spin, message } from "antd";
import dayjs from "dayjs";
import "./baiviet.css";

const BASE = (import.meta.env.BASE_URL || "/");
const fallbackImage = `${BASE}blog-sample.png`;

export default function BlogDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentError, setCommentError] = useState("");
    const loggedInUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("loggedInUser") || "null");
        } catch {
            return null;
        }
    }, []);
    const canComment = loggedInUser?.role === "ROLE_USER";

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const response = await postService.getPostById(id);
                setPost(response.data);

                const relResponse = await postService.getRelatedPosts(id, 4);
                const relData = Array.isArray(relResponse.data) ? relResponse.data : [];
                setRelated(relData.filter((p) => p.id !== Number(id)).slice(0, 4));
            } catch (error) {
                console.error(error);
                message.error("Không thể tải chi tiết bài viết");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
            window.scrollTo(0, 0);
        }
    }, [id]);

    const loadComments = useCallback(async () => {
        if (!id) return;
        setCommentsLoading(true);
        try {
            const response = await commentService.getComments(id);
            const data = Array.isArray(response.data) ? response.data : [];
            setComments(data);
        } catch (error) {
            console.error("Fetch comments error:", error);
            message.error("Không thể tải bình luận");
        } finally {
            setCommentsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            loadComments();
        }
    }, [id, loadComments]);

    const handleSubmitComment = async (event) => {
        event.preventDefault();
        if (!commentText.trim()) {
            setCommentError("Nội dung bình luận không được để trống");
            return;
        }

        setCommentSubmitting(true);
        setCommentError("");

        try {
            await commentService.addComment(id, { content: commentText.trim() });
            setCommentText("");
            message.success("Bình luận của bạn đã được gửi");
            await loadComments();
        } catch (error) {
            console.error("Submit comment error:", error);
            const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
            const fallback = "Không thể gửi bình luận vào lúc này";
            const errorMessage = backendMessage || fallback;
            setCommentError(errorMessage);
            message.error(errorMessage);
        } finally {
            setCommentSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center"><Spin size="large" /></div>;
    }

    if (!post) {
        return <div className="min-h-screen flex justify-center items-center">Bài viết không tồn tại</div>;
    }

    return (
        <div className="baiviet-wrapper" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
            {/* BANNER (Optional, or just a simpler header) */}
            <div className="baiviet-banner" style={{ padding: "40px 0" }}>
                <div className="baiviet-banner-content">
                    <p className="breadcrumb">
                        <Link to="/" className="crumb">Trang chủ</Link>
                        <span className="separator"> / </span>
                        <Link to="/bai-viet" className="crumb">Bài viết</Link>
                        <span className="separator"> / </span>
                        <span className="crumb active">Chi tiết</span>
                    </p>
                    <h1 style={{ fontSize: "28px" }}>Chi tiết bài viết</h1>
                </div>
            </div>

            <div className="baiviet-container" style={{ marginTop: "30px", maxWidth: "1100px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "30px" }} className="blog-detail-grid">
                    <article style={{ background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                        <div className="post-meta" style={{ marginBottom: "20px" }}>
                            <span style={{
                                color: "#ff6a00",
                                fontWeight: "600",
                                fontSize: "14px",
                                textTransform: "uppercase",
                                display: "block",
                                marginBottom: "8px"
                            }}>
                                {post.tags && post.tags.length > 0 ? post.tags[0] : "Lập trình"}
                            </span>
                            <h2 style={{ fontSize: "26px", fontWeight: "700", lineHeight: "1.3", marginBottom: "12px" }}>{post.title}</h2>
                            <div style={{ fontSize: "13px", color: "#888" }}>
                                📅 Đăng ngày: {dayjs(post.createdAt).format("DD/MM/YYYY")}
                            </div>
                        </div>

                        {post.image && (
                            <img
                                src={post.image}
                                alt={post.title}
                                style={{ width: "100%", borderRadius: "8px", marginBottom: "25px", objectFit: "cover", maxHeight: "400px" }}
                            />
                        )}

                        <div
                            className="blog-content"
                            style={{
                                fontSize: "16px",
                                lineHeight: "1.8",
                                color: "#333"
                            }}
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        <section className="comment-section">
                            <div className="comment-header">
                                <h3>Bình luận</h3>
                                <span className="comment-count">
                                    {comments.length} phản hồi
                                </span>
                            </div>
                            <div className="comment-list">
                                {commentsLoading ? (
                                    <div className="comment-loader">
                                        <Spin size="small" />
                                        <span>Đang tải bình luận...</span>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="comment-empty">
                                        Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ!
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div className="comment-card" key={comment.id}>
                                            <strong>{comment.author?.fullName || "Học viên"}</strong>
                                            <p>{comment.content}</p>
                                            <div className="comment-meta">
                                                <span>{dayjs(comment.createdAt).format("DD/MM/YYYY HH:mm")}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="comment-form-wrapper">
                                {canComment ? (
                                    <form className="comment-form" onSubmit={handleSubmitComment}>
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => {
                                                setCommentText(e.target.value);
                                                if (commentError) setCommentError("");
                                            }}
                                            placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                                            maxLength={1000}
                                        />
                                        {commentError && <span className="comment-error">{commentError}</span>}
                                        <button type="submit" disabled={commentSubmitting}>
                                            {commentSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="comment-locked">
                                        {loggedInUser ? (
                                            <p>Chỉ tài khoản sinh viên được phép bình luận. Vui lòng chuyển sang tài khoản học viên.</p>
                                        ) : (
                                            <p>
                                                Vui lòng <Link to="/login">đăng nhập</Link> để tham gia bình luận.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>
                    </article>

                    <aside>
                        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", borderBottom: "2px solid #ff6a00", paddingBottom: "10px" }}>
                                Bài viết mới nhất
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                {related.map((r) => (
                                    <Link key={r.id} to={`/bai-viet/${r.id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", gap: "10px" }}>
                                        <img
                                            src={r.image || fallbackImage}
                                            alt={r.title}
                                            style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
                                            onError={(e) => (e.currentTarget.src = fallbackImage)}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 4px 0", lineHeight: "1.4", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                                {r.title}
                                            </h4>
                                            <span style={{ fontSize: "11px", color: "#999" }}>{dayjs(r.createdAt).format("DD/MM/YYYY")}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
