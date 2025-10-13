// src/components/CourseCard.jsx
import React from "react";
import "./CourseCard.css";

export default function CourseCard({ course }) {
    return (
        <div className="card-course">
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
                    <span>{course.lessons} bài học</span>
                    <span> • </span>
                    <span>{course.students} học viên</span>
                </div>
                <div className="card-bottom">
                    <button className="btn-secondary">Học ngay</button>
                    <div className="card-price">{course.price}</div>
                </div>
            </div>
        </div>
    );
}
