import { useState } from "react";
import { Card, Pagination, Dropdown } from "antd";
import { DownOutlined, ClockCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

// Images served from public/; compose with BASE_URL safely (string concat)
const BASE = (import.meta.env.BASE_URL || "/");
const blogImages = [
    `${BASE}blog-sample.png`,
    `${BASE}students.jpg`,
];  

const mockPosts = Array.from({ length: 9 }).map((_, i) => ({
    id: i + 1,
    title: "Authentication & Authorization trong ReactJS",
    category: "FrontEnd",
    author: "Nguyễn Văn A",
    time: "15 phút đọc",
    views: "1.5k lượt xem",
    image: blogImages[i % blogImages.length],
}));

export default function BlogList() {
    const [current, setCurrent] = useState(1);
    const [sortKey, setSortKey] = useState("newest");

    const handleChange = (page) => setCurrent(page);

    const sortItems = [
        { key: "newest", label: "Mới nhất" },
        { key: "oldest", label: "Cũ nhất" },
    ];

    const sortedPosts = [...mockPosts].sort((a, b) =>
        sortKey === "newest" ? b.id - a.id : a.id - b.id
    );

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
                        <span className="text-sm text-gray-500 ml-1">(128)</span>
                    </h3>
                    <Dropdown menu={{ items: sortItems }} trigger={["click"]}>
                        <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition">
                            Sắp xếp: <span className="font-medium">Mới nhất</span>
                            <DownOutlined className="text-xs" />
                        </button>
                    </Dropdown>
                </div>

                {/* Grid bài viết */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockPosts.map((post) => (
                        <Card
                            key={post.id}
                            hoverable
                            cover={
                                <img
                                    alt={post.title}
                                    src={post.image}
                                    onError={(e) => { e.currentTarget.src = `${BASE}blog-sample.png`; }}
                                    className="h-48 w-full object-cover rounded-t-xl"
                                />
                            }
                            className="rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all bg-white"
                            bodyStyle={{ padding: "16px" }}
                        >
                            <div className="text-xs text-orange-500 font-semibold mb-2 uppercase">
                                {post.category}
                            </div>
                            <Link to={`/bai-viet/${post.id}`}>
                                <h4 className="text-[15px] font-semibold text-gray-800 leading-snug hover:text-orange-500 transition">
                                    {post.title}
                                </h4>
                            </Link>
                            <div className="flex items-center text-gray-500 text-xs mt-3 gap-3">
                                <ClockCircleOutlined className="text-orange-500" />
                                <span>{post.time}</span>
                                <EyeOutlined className="ml-3 text-orange-500" />
                                <span>{post.views}</span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Phân trang */}
                <div className="flex justify-center mt-12">
                    <Pagination
                        current={current}
                        total={45}
                        pageSize={9}
                        onChange={handleChange}
                        showSizeChanger={false}
                    />
                </div>
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
