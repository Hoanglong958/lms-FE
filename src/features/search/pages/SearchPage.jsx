import React, { useState } from "react";
import "./SearchPage.css";
import CourseCard from "@components/CourseCard";

const sampleCourses = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: i < 9 ? "N1 Chill Class" : "Authentication & Authorization trong ReactJS",
  image: "/students.jpg",
  level: i < 9 ? "Beginner" : "Front-End",
  type: i < 9 ? "Khóa học" : "Bài viết",
  lessons: i < 9 ? 30 : 12,
  students: i < 9 ? 520 : 95,
  price: i < 9 ? "349.000đ" : "Miễn phí",
}));

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const results = sampleCourses.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="sp-page">

      {/* ==== HERO BANNER ==== */}
      <section className="sp-hero">
        <div className="sp-container">
          <h1 className="sp-title">Tìm kiếm</h1>
          <p className="sp-sub">Tìm khóa học, bài viết...</p>

          <div className="sp-search-card">
            <input
              className="sp-input"
              placeholder="Tìm khóa học, bài viết..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="sp-btn">Tìm</button>
          </div>
        </div>
      </section>

      {/* ==== RESULT SECTION ==== */}
      <section className="sp-results">
        <div className="sp-container sp-panel">

          <div className="sp-results-head">
            <span> Có <b>{results.length}</b> kết quả cho từ khóa <b>"{query || "Web"}"</b> </span>
            <span className="sp-sort">Sắp xếp: Mới nhất ▾</span>
          </div>

          <div className="sp-grid">
            {results.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* ==== FOOTER ==== */}
      <footer className="sp-footer">
        <div className="sp-container">
          <div className="sp-footer-box">
            <img src="/icon-mail.svg" alt="icon" />
            <p>MINORI ACADEMY - HỌC TẬP ỨNG DỤNG THỰC TẾ</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
