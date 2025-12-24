import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { postService } from "@utils/postService";
import "./baiviet.css";

const Posts = () => {
  const BASE = import.meta.env.BASE_URL || "/";
  const fallbackImage = `${BASE}blog-sample.png`;

  // Dữ liệu mẫu dự phòng
  const dummyPosts = Array(6).fill({}).map((_, idx) => ({
    id: idx + 1,
    title: "Authentication & Authorization trong ReactJS",
    category: "Frontend",
    time: "15 phút đọc",
    views: "1.5k lượt xem",
    image: fallbackImage,
  }));

  const [posts, setPosts] = useState(dummyPosts);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState("newest");
  const [openSort, setOpenSort] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postService.getPosts({
          page: 0,
          size: 100,
          sort: sortKey === "newest" ? "createdAt,desc" : "createdAt,asc"
        });

        const data = response.data?.content || response.data || [];

        if (Array.isArray(data) && data.length > 0) {
          const mappedPosts = data.map(p => ({
            id: p.id,
            title: p.title,
            category: (p.tags && p.tags.length > 0) ? p.tags[0] : "Frontend",
            time: "15 phút đọc",
            views: "1.5k lượt xem",
            image: p.imageUrl || fallbackImage,
          }));
          setPosts(mappedPosts);
        } else {
          setPosts(dummyPosts); // Dùng dummy nếu server trống
        }
      } catch (error) {
        console.error("Failed to fetch posts, using dummy data:", error);
        setPosts(dummyPosts); // Dùng dummy nếu API lỗi (400, 500...)
      }
    };

    fetchPosts();
  }, [sortKey]);

  return (
    <div className="baiviet-wrapper">

      {/* BANNER */}
      <div className="baiviet-banner">
        <div className="baiviet-banner-content">

          {/* CHỈ SỬA PHẦN NÀY */}
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
            Tất cả bài viết <span>(128)</span>
          </h3>

          {/* Dropdown Sort giữ nguyên */}
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

        {/* GRID giữ nguyên */}
        <div className="baiviet-list">
          {posts.map((post, index) => (
            <Link
              key={index}
              to={`/bai-viet/${post.id}`}
              className="baiviet-card"
            >
              <img
                src={post.image}
                alt={post.title}
                onError={(e) => (e.currentTarget.src = fallbackImage)}
              />

              <div className="baiviet-info">
                <p className="category">{post.category}</p>
                <h4>{post.title}</h4>

                <div className="meta">
                  <span>🕒 {post.time}</span>
                  <span>👁️ {post.views}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* PAGINATION giữ nguyên */}
        <div className="baiviet-pagination">
          <button className="disabled">← Previous</button>

          <div className="pages">
            <span className="active">1</span>
            <span>2</span>
            <span>3</span>
          </div>

          <button>Next →</button>
        </div>
      </div>
    </div>
  );
};

export default Posts;
