// src/components/CourseCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./CourseCard.css";

export default function CourseCard({ course }) {
    const CardContent = (
        <>
            <div className="card-thumb">
                <img src={course.image} alt={course.title} />
            </div>
            <div className="card-body">
                <div className="card-tags">
                    <span className="tag-level">{course.level}</span>
                    <span className="tag-type">{course.type}</span>
                </div>
                <h3 className="card-title">{course.title}</h3>
                <div className="card-meta">
                    {course.type === "Khóa học" ? (
                        <span>{course.lessons} bài học</span>
                    ) : (
                        <span>Kiến thức hữu ích</span>
                    )}
                    <span> • </span>
                    <span>{course.students || 0} học viên</span>
                </div>
                <div className="card-bottom" style={{ marginTop: 'auto' }}>
                    <span className="btn-secondary" style={{ textAlign: 'center', flex: 1 }}>
                        {course.type === "Khóa học" ? "Học ngay" : "Đọc bài"}
                    </span>
                    <div className="card-price" style={{ whiteSpace: 'nowrap' }}>{course.price}</div>
                </div>
            </div>
        </>
    );

    if (course.url) {
        return (
            <Link to={course.url} className="card-course" style={{ textDecoration: 'none', color: 'inherit' }}>
                {CardContent}
            </Link>
        );
    }

    return (
        <div className="card-course">
            {CardContent}
        </div>
    );
}
