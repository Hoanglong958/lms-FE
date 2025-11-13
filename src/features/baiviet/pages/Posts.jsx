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
  const posts = useMemo(() => {
    const withId = basePosts.map((p, idx) => ({ ...p, id: idx + 1 }));
    return sortKey === "newest"
      ? withId.sort((a, b) => b.id - a.id)
      : withId.sort((a, b) => a.id - b.id);
  }, [basePosts, sortKey]);

  return (
    <div className="baiviet-page">
      <div className="baiviet-banner">
        <div className="container">
          <p>Trang chủ / Bài viết</p>
          <h1>Bài viết</h1>
        </div>
      </div>

      <div className="baiviet-container container">
        <div className="baiviet-header">
          <h3>
            Tất cả bài viết <span>(128)</span>
          </h3>
          <div className="baiviet-sort">
            Sắp xếp:{" "}
            <button
              onClick={() => setSortKey("newest")}
              style={{ fontWeight: sortKey === "newest" ? 700 : 400 }}
            >
              Mới nhất
            </button>{" "}
            |{" "}
            <button
              onClick={() => setSortKey("oldest")}
              style={{ fontWeight: sortKey === "oldest" ? 700 : 400 }}
            >
              Cũ nhất
            </button>
          </div>
        </div>

        <div className="baiviet-list">
          {posts.map((post, index) => (
            <Link
              key={index}
              to={`/bai-viet/${post.id}`}
              className="baiviet-card"
              style={{ textDecoration: "none" }}
            >
              <img
                src={post.image}
                alt={post.title}
                onError={(e) => {
                  e.currentTarget.src = fallbackImage;
                }}
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

        <div className="baiviet-pagination">
          <button>← Previous</button>
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
