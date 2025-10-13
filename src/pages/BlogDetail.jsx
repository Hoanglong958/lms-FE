import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";

const BASE = (import.meta.env.BASE_URL || "/");
const fallbackImage = `${BASE}blog-sample.png`;
const contentImages = [
    // Place your images in public/ with these filenames
    `${BASE}anh1.png`,
    `${BASE}anh2.png`,
    `${BASE}anh3.png`,
];

export default function BlogDetail() {
    const { id } = useParams();

    const post = useMemo(() => ({
        id,
        title: "Authentication & Authorization trong ReactJS",
        category: "Front-End",
        author: "Nguyễn Văn A",
        date: "8 tháng trước",
        time: "10-15 phút đọc",
        views: "1.5k lượt xem",
        image: fallbackImage,
        paragraphs: [
            "Ornare eu elementum felis porttitor nunc. Ornare neque accumsan metus nullus ultrices maecenas rhoncus ultrices cras. Vestibulum varius adipiscing ipsum pharetra. Semper ullamcorper malesuada ut auctor scelerisque.Sit morbi pellentesque adipiscing pellentesque habitant ullamcorper est. In dolor sit platea faucibus ut dignissim pulvinar.",
            "Semper lacinia non lectus mauris sed eget scelerisque facilisis donec. Tellus molestie leo gravida feugiat. Ipsum est lacus lobortis accumsan eget.",
            "Sit parturient viverra ut cursus. Vestibulum non et ullamcorper fermentum fringilla est.",
            "A nullam diam rhoncus pellentesque eleifend risus ut libero. Eget gravida fermentum nisi dignissim senectus pellentesque egestas.",
        ],
    }), [id]);

    const related = Array.from({ length: 3 }).map((_, i) => ({
        id: Number(id || 1) + i + 1,
        title: "Authentication & Authorization trong ReactJS",
        category: "Front-End",
        excerpt: "Chào bạn! Nếu bạn đã là học viên khoá Pro…",
        image: fallbackImage,
        time: "10-15 phút đọc",
        views: "1.5k lượt xem",
    }));

    return (
        <div className="min-h-screen" style={{ background: "#FFFFFF", opacity: 1 }}>
            <div className="pb-6 bd-container" style={{ width: 1440, minHeight: 3648, margin: "0 auto", background: "#FFFFFF", paddingTop: 26 }}>
                <div
                    className="pb-8 border-b border-gray-200 mb-8 bd-header"
                    style={{ width: 789, minHeight: 156, marginTop: 0, marginLeft: 120, marginRight: 120 }}
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
                        <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">{post.category}</span>
                        <span>📅 {post.date}</span>
                        <span>⏱️ {post.time}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bd-grid" style={{ marginLeft: 120, marginRight: 120 }}>
                    <article className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 bd-article" style={{ width: 789, minHeight: 1600 }}>
                        <h3 className="text-[14px] font-semibold text-gray-900 mb-3">Ornare eu elementum felis porttitor nunc</h3>
                        <div className="text-gray-700 space-y-4" style={{ fontSize: 14, lineHeight: "28px" }}>
                            {/* Đoạn mở đầu ngay dưới tiêu đề h3 */}
                            <p className="mt-0">{post.paragraphs[0]}</p>

                            {/* Ảnh 1 ngay sau đoạn mở đầu */}
                            <img
                                src={contentImages[0]}
                                onError={(e) => { e.currentTarget.src = fallbackImage; }}
                                alt="anh1"
                                className="w-full object-cover rounded-lg bd-image-1"
                                style={{ height: 420 }}
                            />

                            {/* Heading 1 + đoạn văn sau ảnh 1 */}
                            <h4 className="text-[15px] font-semibold text-gray-900 mt-2">Lorem ipsum dolor sit amet consectetur:</h4>
                            <p>{post.paragraphs[0]}</p>

                            {/* Heading 2 + bullet */}
                            <h4 className="text-[15px] font-semibold text-gray-900 mt-4">Semper lacinia non lectus mauris sed eget scelerisque facilisis donec:</h4>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Tellus molestie leo gravida feugiat. Ipsum est lacus lobortis accumsan eget.</li>
                                <li>Sit parturient viverra ut cursus. Vestibulum non et ullamcorper fermentum fringilla est.</li>
                                <li>
                                    A nullam diam rhoncus pellentesque eleifend risus ut libero. Eget gravida fermentum nisi dignissim
                                    senectus pellentesque egestas. Pellentesque scelerisque arcu congue lorem. In quis sagittis netus lacinia
                                    ut vitae. Vitae quam nunc quis libero in. Viverra purus elementum risus feugiat in est. Ut sit a erat ante
                                    aliquam. Nec viverra nibh orci erat feugiat viverra viverra sit faucibus
                                </li>
                            </ul>

                            {/* Đoạn văn dài trước ảnh 2 (giống ảnh mẫu) */}
                            <p>
                                Adipiscing eu nunc integer mi montes cras magna. Vitae posuere quis sed quam vivamus urna lorem
                                dolor. Odio potenti non purus platea ultricies id egestas. Mattis arcu felis sed commodo. Magna enim
                                vel consequat leo eleifend entiam. Tincidunt ut morbi volutpat et etiam morbi sagittis. Uma elit pretium
                                fermentum cras cursus nam odio libero.Scelerisque augue in vel cursus. Varius amet tristique risus velit
                                in libero id tincidunt nunc. Elit proin dictumst purus cras. Diam vitae congue est iaculis lacinia lectus 
                                senectus ut egestas. At ultrices ultricies cras ut vehicula. Nisl viverra imperdiet pharetra purus tortor 
                                viverra aenean accumsan. Sed quis viverra cras tortor lacus. Morbi eget in porta lectus risus eget mauris 
                                
                            </p>

                            {/* Ảnh 2 lớn */}
                            <img src={contentImages[1]} onError={(e) => { e.currentTarget.src = fallbackImage; }} alt="blog image 2" className="w-full h-96 object-cover rounded-lg" />

                            {/* Phần sau ảnh 2 giống ảnh: heading Lorem + 1 đoạn văn */}
                            <h4 className="text-[15px] font-semibold text-gray-900 mt-2">Lorem ipsum dolor sit amet consectetur:</h4>
                            <p>{post.paragraphs[0]}</p>

                            {/* Ảnh 3 */}
                            <img src={contentImages[2]} onError={(e) => { e.currentTarget.src = fallbackImage; }} alt="blog image 3" className="w-full h-80 object-cover rounded-lg" />

                            {/* Phần sau ảnh 3: heading + đoạn văn */}
                            <h4 className="text-[15px] font-semibold text-gray-900 mt-2">Lorem ipsum dolor sit amet consectetur:</h4>
                            <p>{post.paragraphs[0]}</p>

                            {/* Kết đoạn như ảnh */}
                            <p>
                                Diam vitae congue est iaculis facilisis luctus senectus et egestas. At ultricies ultricies cras ut
                                vehicula. Nisl viverra imperdiet pharetra purus tortor viverra aenean accumsan. Sed quis viverra cras
                                tortor lacus. Morbi eget in porta lectus risus eget mauris luctus ac.
                            </p>
                        </div>
                    </article>

                    <aside className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold mb-4">Bài viết cùng chủ đề</h3>
                        <div className="space-y-4">
                            {related.map((r) => (
                                <Link key={r.id} to={`/bai-viet/${r.id}`} className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:shadow transition">
                                    <img src={r.image} onError={(e) => { e.currentTarget.src = fallbackImage; }} alt={r.title} className="w-28 h-20 object-cover rounded-md" />
                                    <div className="min-w-0">
                                        <div className="text-[11px] text-orange-600 mb-1">{r.category}</div>
                                        <div className="text-[14px] font-semibold text-gray-800 leading-snug line-clamp-2">{r.title}</div>
                                        <div className="text-[11px] text-gray-500 mt-1 truncate">{r.excerpt}</div>
                                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2">
                                            <span>⏱️ {r.time}</span>
                                            <span>👁️ {r.views}</span>
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