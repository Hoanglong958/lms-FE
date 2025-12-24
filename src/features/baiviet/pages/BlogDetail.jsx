import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { postService } from "@utils/postService";
import { Spin } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { SERVER_URL } from "@config";
import { ClockCircleOutlined, BookOutlined } from "@ant-design/icons";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const BASE = (import.meta.env.BASE_URL || "/");
const fallbackImage = `${BASE}blog-sample.png`;

export default function BlogDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState([]);

    const formatImageUrl = (url) => {
        if (!url) return fallbackImage;
        if (url.startsWith("http")) return url;
        return `${SERVER_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    };

    const calculateReadingTime = (content) => {
        const wordsPerMinute = 200;
        const text = content?.replace(/<[^>]*>/g, '') || "";
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes > 0 ? `${minutes}-${minutes + 2} phút đọc` : "2-3 phút đọc";
    };

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            setLoading(true);
            try {
                let response;
                if (!isNaN(id)) {
                    response = await postService.getPostById(id);
                    setPost(response.data);
                } else {
                    const allPosts = await postService.getPosts({ page: 0, size: 100 });
                    const list = allPosts.data?.content || allPosts.data || [];
                    const found = list.find(p => p.slug === id || String(p.id) === String(id));
                    if (found) setPost(found);
                }

                const relResponse = await postService.getPosts({ page: 0, size: 4 });
                const relData = relResponse.data?.content || relResponse.data || [];
                setRelated(relData.filter(p => String(p.id) !== String(id)));
            } catch (error) {
                console.error("Lỗi khi tải bài viết:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) return <div className="min-h-screen flex justify-center items-center"><Spin size="large" /></div>;
    if (!post) return <div className="min-h-screen flex justify-center items-center font-medium text-gray-400">Bài viết không tồn tại</div>;

    return (
        <div className="bg-white min-h-screen">
            {/* Standard Container - Matching Header (1440px max-width, 120px padding) */}
            <div className="max-w-[1440px] mx-auto px-[120px] py-10 font-sans">

                {/* Header Section: Aligned Left with Logo */}
                <header className="mb-0">
                    <nav className="flex items-center gap-2 text-[13px] text-gray-400 mb-5 font-normal">
                        <Link to="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
                        <span className="text-gray-300">/</span>
                        <Link to="/baiviet" className="hover:text-orange-500 transition-colors">Bài viết</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-900 font-medium">Chi tiết bài viết</span>
                    </nav>

                    <h1 className="text-[36px] leading-[1.1] font-extrabold text-[#111827] mb-6 uppercase tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-6 text-[13px] text-gray-500 mb-8">
                        <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 font-bold rounded text-[11px] uppercase border border-orange-100">
                            {post.tags && post.tags.length > 0 ? post.tags[0] : "General"}
                        </span>
                        <div className="flex items-center gap-2">
                            <ClockCircleOutlined className="text-gray-300" />
                            <span>{dayjs(post.createdAt).fromNow()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOutlined className="text-gray-300" />
                            <span>{calculateReadingTime(post.content)}</span>
                        </div>
                    </div>
                </header>

                {/* Clear Horizontal Divider */}
                <div className="w-full h-[1px] bg-gray-100 mb-10" />

                {/* Main Content Grid: Balanced 8/4 grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Article Body */}
                    <article className="lg:col-span-8">
                        {/* Featured Image: Large and centered above content */}
                        {(post.imageUrl || post.image) && (
                            <div className="mb-10 overflow-hidden rounded-[20px] border border-gray-50 shadow-sm">
                                <img
                                    src={formatImageUrl(post.imageUrl || post.image)}
                                    alt={post.title}
                                    className="w-full h-auto object-cover max-h-[550px]"
                                    onError={(e) => { e.currentTarget.src = fallbackImage; }}
                                />
                            </div>
                        )}

                        <div className="styled-content text-[17px] leading-[1.8] text-[#4B5563] font-normal">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>
                    </article>

                    {/* Sidebar: Aligned to the top of the content grid */}
                    <aside className="lg:col-span-4">
                        <div className="mb-10">
                            <h2 className="text-[20px] font-extrabold text-[#111827] mb-8 border-l-[5px] border-orange-500 pl-4 leading-none py-1">
                                Bài viết cùng chủ đề
                            </h2>

                            <div className="flex flex-col gap-10">
                                {related.map((r) => (
                                    <Link key={r.id} to={`/bai-viet/${r.id}`} className="block group">
                                        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-4 border border-gray-100 shadow-sm">
                                            <img
                                                src={formatImageUrl(r.imageUrl || r.image)}
                                                onError={(e) => { e.currentTarget.src = fallbackImage; }}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt={r.title}
                                            />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-2">
                                                {r.tags && r.tags.length > 0 ? r.tags[0] : "General"}
                                            </div>
                                            <h3 className="text-[18px] font-extrabold text-gray-900 leading-[1.3] mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                                                {r.title}
                                            </h3>
                                            <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed mb-4">
                                                Khám phá những nội dung thú vị và bổ ích trong bài viết "{r.title}" để cập nhật kiến thức mới nhất...
                                            </p>
                                            <div className="flex items-center gap-4 text-[11px] text-gray-400">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <ClockCircleOutlined />
                                                    <span>{dayjs(r.createdAt).fromNow()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <BookOutlined />
                                                    <span>10-15 phút đọc</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .styled-content p { margin-bottom: 1.75rem; color: #4B5563; }
                .styled-content h2 { font-size: 24px; font-weight: 800; margin-top: 3rem; margin-bottom: 1.5rem; color: #111827; }
                .styled-content img { border-radius: 20px; width: 100%; height: auto; margin: 2.5rem 0; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.1); }
                .styled-content ul { padding-left: 1.5rem; list-style-type: disc; margin-bottom: 2rem; color: #4B5563; }
                .styled-content li { margin-bottom: 0.75rem; }
            `}} />
        </div>
    );
}
