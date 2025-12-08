import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./baiviet.css";

const Posts = () => {
  const BASE = import.meta.env.BASE_URL || "/";
  const fallbackImage = `${BASE}blog-sample.png`;

  const basePosts = Array(9).fill({
    title: "Authentication & Authorization trong ReactJS",
    category: "Frontend",
    time: "15 phút đọc",
    views: "1.5k lượt xem",
    image: fallbackImage,
  });

  const [sortKey, setSortKey] = useState("newest");
  const [openSort, setOpenSort] = useState(false);

  const posts = useMemo(() => {
    const withId = basePosts.map((p, idx) => ({ ...p, id: idx + 1 }));

    return sortKey === "newest"
      ? [...withId].sort((a, b) => b.id - a.id)
      : [...withId].sort((a, b) => a.id - b.id);
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
