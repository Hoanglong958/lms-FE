import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Spin, message, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { postService } from "@utils/postService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import "./baiviet.css";

const { Option } = Select;

dayjs.extend(relativeTime);
dayjs.locale("vi");

const BASE = (import.meta.env.BASE_URL || "/");

export default function BlogList() {
    const [posts, setPosts] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortKey, setSortKey] = useState("newest");
    const [openSort, setOpenSort] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedTag, setSelectedTag] = useState("Tất cả");

    const pageSize = 9;

    const fetchTags = async () => {
        try {
            const res = await postService.getTags();
            if (res.data) setTags(res.data);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
    };

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: current - 1,
                size: pageSize,
                sort: sortKey === "newest" ? "createdAt,desc" : "createdAt,asc",
                q: searchText.trim() || undefined,
                tag: selectedTag === "Tất cả" ? undefined : selectedTag
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
    }, [current, sortKey, searchText, selectedTag]);

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handlePageChange = (page) => {
        setCurrent(page);
        window.scrollTo(0, 0);
    };

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
        setCurrent(1);
    };

    const handleTagChange = (value) => {
        setSelectedTag(value);
        setCurrent(1);
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="baiviet-wrapper">
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
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    marginBottom: '30px',
                    padding: '20px',
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    alignItems: 'center'
                }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <Input
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Tìm kiếm bài viết..."
                            value={searchText}
                            onChange={handleSearchChange}
                            size="large"
                            allowClear
                        />
                    </div>
                    <div style={{ minWidth: '150px' }}>
                        <Select
                            value={selectedTag}
                            onChange={handleTagChange}
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Chọn danh mục"
                        >
                            <Option value="Tất cả">Tất cả danh mục</Option>
                            {tags.map(tag => (
                                <Option key={tag} value={tag}>{tag}</Option>
                            ))}
                        </Select>
                    </div>
                    <div className="sort-dropdown-wrapper" style={{ marginLeft: 'auto' }}>
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

                <div className="baiviet-header">
                    <h3>
                        Kết quả tìm kiếm <span>({total})</span>
                    </h3>
                </div>

                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        {posts.length > 0 ? (
                            <div className="baiviet-list">
                                {posts.map((post) => (
                                    <Link
                                        key={post.id}
                                        to={`/bai-viet/${post.id}`}
                                        className="baiviet-card"
                                    >
                                        <img
                                            src={post.imageUrl || `${BASE}blog-sample.png`}
                                            alt={post.title}
                                            onError={(e) => (e.currentTarget.src = `${BASE}blog-sample.png`)}
                                        />

                                        <div className="baiviet-info">
                                            <p className="category">
                                                {(post.tags && post.tags.length > 0) ? post.tags[0] : "General"}
                                            </p>
                                            <h4>{post.title}</h4>

                                            <div className="meta">
                                                <span>🕒 {dayjs(post.createdAt).fromNow()}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
                                <h3>Không tìm thấy bài viết nào</h3>
                                <p>Thử tìm kiếm với từ khóa hoặc danh mục khác</p>
                            </div>
                        )}

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
