import { useState, useEffect } from "react";
import { Card, Pagination, Dropdown, Spin, message } from "antd";
import { DownOutlined, ClockCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { postService } from "@utils/postService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const BASE = (import.meta.env.BASE_URL || "/");

export default function BlogList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortKey, setSortKey] = useState("newest");

    const pageSize = 1000; // DEBUG: Show all posts to find missing one

    const fetchPosts = async () => {
        setLoading(true);
        try {
            // API works now!
            const params = {
                page: current - 1,
                size: pageSize,
                // Sort by ID usually guarantees newest created items come first, even if seed dates are weird
                sort: sortKey === "newest" ? "id,desc" : "id,asc"
            };
            const response = await postService.getPosts(params);
            console.log("🔥 USER_BLOG_LIST API RESPONSE:", response); // DEBUG

            // Adjust based on your API response wrapper
            // e.g., if it's Spring Page: { content: [], totalElements: 100, ... }
            // or { data: [], total: 100 }
            const data = response.data;
            console.log("🔥 USER_BLOG_LIST DATA:", data); // DEBUG

            if (data.content) {
                setPosts(data.content);
                setTotal(data.totalElements);
            } else if (Array.isArray(data)) {
                // If API returns just an array (no pagination metadata), handle gracefully
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

    const handleChange = (page) => setCurrent(page);

    const sortItems = [
        { key: "newest", label: "Mới nhất", onClick: () => setSortKey("newest") },
        { key: "oldest", label: "Cũ nhất", onClick: () => setSortKey("oldest") },
    ];

    return (
        <div className="font-sans bg-[#F9FAFB] min-h-screen">
            {/* ==== Banner ==== */}
            <div className="relative bg-gradient-to-r from-[#ff8a00] to-[#ff6200] text-white text-center py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <p className="text-sm mb-2 opacity-90">Trang chủ / Bài viết</p>
                    <h2 className="text-3xl font-bold">Bài viết</h2>
                </div>
            </div>

            {/* ==== Content ==== */}
            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* Bộ lọc */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Tất cả bài viết{" "}
                        <span className="text-sm text-gray-500 ml-1">({total})</span>
                    </h3>
                    <Dropdown menu={{ items: sortItems }} trigger={["click"]}>
                        <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition">
                            Sắp xếp: <span className="font-medium">{sortKey === "newest" ? "Mới nhất" : "Cũ nhất"}</span>
                            <DownOutlined className="text-xs" />
                        </button>
                    </Dropdown>
                </div>

                {/* Grid bài viết */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <Card
                                key={post.id}
                                hoverable
                                cover={
                                    <img
                                        alt={post.title}
                                        src={post.image || `${BASE}blog-sample.png`}
                                        onError={(e) => { e.currentTarget.src = `${BASE}blog-sample.png`; }}
                                        className="h-48 w-full object-cover rounded-t-xl"
                                    />
                                }
                                className="rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all bg-white"
                                bodyStyle={{ padding: "16px" }}
                            >
                                <div className="text-xs text-orange-500 font-semibold mb-2 uppercase">
                                    {(post.tags && post.tags.length > 0) ? post.tags[0] : (post.tagNames && post.tagNames.length > 0) ? post.tagNames[0] : "General"}
                                </div>
                                <Link to={`/bai-viet/${post.id}`}>
                                    <h4 className="text-[15px] font-semibold text-gray-800 leading-snug hover:text-orange-500 transition line-clamp-2 min-h-[40px]">
                                        <span className="text-gray-400 font-normal mr-1">#{post.id}</span>
                                        {post.title}
                                    </h4>
                                </Link>
                                <div className="flex items-center text-gray-500 text-xs mt-3 gap-3">
                                    <ClockCircleOutlined className="text-orange-500" />
                                    <span>{dayjs(post.createdAt).fromNow()}</span>
                                    {/* <EyeOutlined className="ml-3 text-orange-500" />
                                    <span>{post.viewCount || 0} lượt xem</span> */}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Phân trang */}
                {total > 0 && (
                    <div className="flex justify-center mt-12">
                        <Pagination
                            current={current}
                            total={total}
                            pageSize={pageSize}
                            onChange={handleChange}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </div>

            {/* ==== Footer ==== */}
            <footer className="bg-gradient-to-r from-[#ff8a00] to-[#ff6200] text-white py-12 mt-10">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                    {/* Thông tin */}
                    <div>
                        <h4 className="font-bold mb-3 text-lg">THÔNG TIN LIÊN HỆ</h4>
                        <p className="mb-1">📍 Địa chỉ: Tầng 10, tòa D, Quận Nam Từ Liêm, Hà Nội</p>
                        <p className="mb-1">🌐 Website: mankaiacademy.vn</p>
                        <p className="mb-1">📞 Hotline: 0326 225 532</p>
                    </div>

                    {/* Liên kết mạng xã hội */}
                    <div>
                        <h4 className="font-bold mb-3 text-lg">THEO DÕI CHÚNG TÔI</h4>
                        <div className="flex gap-3 mt-2">
                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                🌐
                            </span>
                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                📘
                            </span>
                            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                ▶️
                            </span>
                        </div>
                    </div>

                    {/* Giới thiệu */}
                    <div>
                        <h4 className="font-bold mb-3 text-lg">GIỚI THIỆU</h4>
                        <p className="leading-relaxed opacity-90">
                            MANKAI ACADEMY - Học viện đào tạo phát triển công nghệ thực chiến,
                            giúp học viên làm chủ kỹ năng lập trình và tư duy nghề nghiệp.
                        </p>
                    </div>
                </div>

                <div className="border-t border-white/20 mt-10 pt-4 text-center text-xs opacity-80">
                    © 2024 Mankai Academy - All Rights Reserved
                </div>
            </footer>
        </div>
    );
}
