import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { postService } from "@utils/postService";
import { Spin, message } from "antd";
import dayjs from "dayjs";
// import ReactMarkdown from "react-markdown"; // If content is markdown
// If content is HTML, we use dangerouslySetInnerHTML

const BASE = (import.meta.env.BASE_URL || "/");
const fallbackImage = `${BASE}blog-sample.png`;

export default function BlogDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            setLoading(true);
            try {
                let response;
                // Chỉ gọi API nếu id là số để tránh lỗi 400
                if (!isNaN(id)) {
                    response = await postService.getPostById(id);
                    setPost(response.data);
                } else {
                    // Nếu id là slug, tìm kiếm trong danh sách bài viết
                    const allPosts = await postService.getPosts({ page: 0, size: 100 });
                    const list = allPosts.data?.content || allPosts.data || [];
                    const found = list.find(p => p.slug === id || String(p.id) === String(id));
                    if (found) setPost(found);
                }

                // Lấy bài viết liên quan
                const relResponse = await postService.getPosts({ page: 0, size: 4 });
                const relData = relResponse.data?.content || relResponse.data || [];
                setRelated(relData.filter(p => String(p.id) !== String(id)).slice(0, 3));
            } catch (error) {
                console.error("Lỗi khi tải bài viết:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center"><Spin size="large" /></div>;
    }

    if (!post) {
        return <div className="min-h-screen flex justify-center items-center">Bài viết không tồn tại</div>;
    }

    return (
        <div className="min-h-screen" style={{ background: "#FFFFFF", opacity: 1 }}>
            <div className="pb-6 bd-container" style={{ width: "100%", maxWidth: 1440, minHeight: "100vh", margin: "0 auto", background: "#FFFFFF", paddingTop: 26 }}>
                <div
                    className="pb-8 border-b border-gray-200 mb-8 bd-header"
                    style={{ maxWidth: 789, margin: "0 auto", padding: "0 20px" }}
                >
                    <div className="mb-3" style={{ fontSize: 12, color: "#6B7280" }}>
                        <Link to="/" style={{ color: "#6B7280" }}>Trang chủ</Link>
                        <span style={{ margin: "0 6px" }}>/</span>
                        <Link to="/bai-viet" style={{ color: "#6B7280" }}>Bài viết</Link>
                        <span style={{ margin: "0 6px" }}>/</span>
                        <span style={{ color: "#111827" }}>Chi tiết bài viết</span>
                    </div>
                    <h1 className="text-[28px] leading-8 font-bold text-gray-900 mb-4">{post.title}</h1>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">
                            {post.tags && post.tags.length > 0 ? post.tags[0] : "General"}
                        </span>
                        <span>📅 {dayjs(post.createdAt).format("DD/MM/YYYY")}</span>
                        {/* <span>⏱️ {post.time}</span> */}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bd-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
                    <article className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 bd-article">
                        {/* Render content safely */}
                        <div className="text-gray-700 space-y-4 blog-content" style={{ fontSize: 14, lineHeight: "28px" }}>
                            {/* Assuming content is HTML from an editor */}
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>
                    </article>

                    <aside className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold mb-4">Bài viết khác</h3>
                        <div className="space-y-4">
                            {related.map((r) => (
                                <Link key={r.id} to={`/bai-viet/${r.id}`} className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:shadow transition">
                                    <img
                                        src={r.image || fallbackImage}
                                        onError={(e) => { e.currentTarget.src = fallbackImage; }}
                                        alt={r.title}
                                        className="w-28 h-20 object-cover rounded-md"
                                    />
                                    <div className="min-w-0">
                                        <div className="text-[11px] text-orange-600 mb-1">
                                            {r.tags && r.tags.length > 0 ? r.tags[0] : "General"}
                                        </div>
                                        <div className="text-[14px] font-semibold text-gray-800 leading-snug line-clamp-2">{r.title}</div>
                                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2">
                                            <span>📅 {dayjs(r.createdAt).format("DD/MM/YYYY")}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}