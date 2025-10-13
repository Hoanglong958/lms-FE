import React, { useState } from "react";
import "../../../styles/index.css";
import "./SearchPage.css";
import CourseCard from "../../../components/CourseCard";

const sampleCourses = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title:
        i < 9
            ? "N1 Chill Class"
            : "Authentication & Authorization trong ReactJS",
    image:
        i < 9
            ? "/students.jpg"
            : "/students.jpg",
    level: i < 9 ? "Beginner" : "Front-End",
    type: i < 9 ? "Khóa học" : "Bài viết",
    lessons: i < 9 ? 30 : 10,
    students: i < 9 ? 520 : 98,
    price: i < 9 ? "349.000đ" : "Miễn phí",
}));

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const results = sampleCourses.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="search-page">
            <div className="search-hero">
                <div className="container">
                    <div className="crumbs">Trang chủ / Tìm kiếm</div>
                    <h1>Tìm kiếm</h1>
                    <p className="subtitle">Tìm khóa học, bài viết...</p>
                    <div className="search-bar">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm kiếm khóa học, bài viết..."
                        />
                        <button>Tìm</button>
                    </div>
                </div>
            </div>

            <div className="container results-section">
                <div className="results-header">
                    <div>
                        Có {results.length} kết quả cho từ khóa{" "}
                        <strong>"{query || "Web"}"</strong>
                    </div>
                    <div className="sort">Sắp xếp: Mới nhất ▾</div>
                </div>

                <div className="grid-courses">
                    {results.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            </div>

            <footer className="search-footer">
                <div className="container">
                    <div className="footer-card">
                        <p>Mankai Academy — Học viện đào tạo phát triển năng lực thực chiến</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
