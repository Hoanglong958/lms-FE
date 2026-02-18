import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./TeacherSidebar.css";

export default function TeacherSidebar({ isOpen, onClose }) {
    // Safe user parsing
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem("loggedInUser") || "{}");
        } catch {
            return {};
        }
    })();

    const displayName = user.fullName || user.username || "Teacher";
    const displayEmail = user.gmail || user.email || "teacher@lms.com";
    const displayAvatar = (user.fullName || user.username || "T").charAt(0).toUpperCase();

    // Đóng sidebar khi click vào link trên mobile
    useEffect(() => {
        if (isOpen && window.innerWidth <= 640) {
            const handleLinkClick = () => {
                if (onClose) onClose();
            };

            const links = document.querySelectorAll(
                ".teacher-sidebar-item, .teacher-sidebar-subitem"
            );
            links.forEach((link) => {
                link.addEventListener("click", handleLinkClick);
            });

            return () => {
                links.forEach((link) => {
                    link.removeEventListener("click", handleLinkClick);
                });
            };
        }
    }, [isOpen, onClose]);

    return (
        <div className={`teacher-sidebar ${isOpen ? "open" : ""}`}>
            <div>
                {/* Header */}
                <div className="teacher-sidebar-header">
                    <img src="/logo.png" alt="Logo" className="teacher-sidebar-logo" />
                    <h2 className="teacher-sidebar-title">Teacher Portal</h2>
                </div>

                {/* Menu */}
                <nav className="teacher-sidebar-menu">
                    <NavLink
                        to="/teacher/dashboard"
                        className={({ isActive }) =>
                            isActive ? "teacher-sidebar-item active" : "teacher-sidebar-item"
                        }
                    >
                        <i className="fa-solid fa-chart-line"></i>
                        Dashboard
                    </NavLink>

                    {/* Quản lý lớp học */}
                    <NavLink
                        to="/teacher/classes"
                        className={({ isActive }) =>
                            isActive ? "teacher-sidebar-item active" : "teacher-sidebar-item"
                        }
                    >
                        <i className="fa-solid fa-chalkboard-user"></i>
                        Lớp học của tôi
                    </NavLink>

                    {/* Quản lý khóa học */}
                    <NavLink
                        to="/teacher/courses"
                        className={({ isActive }) =>
                            isActive ? "teacher-sidebar-item active" : "teacher-sidebar-item"
                        }
                    >
                        <i className="fa-solid fa-book"></i>
                        Khóa học & Bài giảng
                    </NavLink>

                    {/* Bài kiểm tra */}
                    <NavLink
                        to="/teacher/exam"
                        className={({ isActive }) =>
                            isActive ? "teacher-sidebar-item active" : "teacher-sidebar-item"
                        }
                    >
                        <i className="fa-solid fa-clipboard-check"></i>
                        Bài kiểm tra
                    </NavLink>

                    <NavLink
                        to="/teacher/question-bank"
                        className={({ isActive }) =>
                            isActive ? "teacher-sidebar-item active" : "teacher-sidebar-item"
                        }
                    >
                        <i className="fa-solid fa-database"></i>
                        Ngân hàng câu hỏi
                    </NavLink>

                    <NavLink
                        to="/teacher/posts"
                        className={({ isActive }) =>
                            isActive ? "teacher-sidebar-item active" : "teacher-sidebar-item"
                        }
                    >
                        <i className="fa-solid fa-newspaper"></i>
                        Bài viết & Blog
                    </NavLink>

                    <NavLink
                        to="/teacher/chat"
                        className={({ isActive }) =>
                            isActive ? "teacher-sidebar-item active" : "teacher-sidebar-item"
                        }
                    >
                        <i className="fa-solid fa-comments"></i>
                        Trò chuyện
                    </NavLink>
                </nav>
            </div>

            {/* Footer */}
            <div className="teacher-sidebar-footer">
                <div className="teacher-footer-user">
                    <div className="teacher-user-avatar">{displayAvatar}</div>
                    <div className="teacher-user-info">
                        <p className="teacher-user-name">{displayName}</p>
                        <p className="teacher-user-email">{displayEmail}</p>
                    </div>
                </div>
            </div>
            <div className="teacher-sidebar-logout">
                <button
                    type="button"
                    className="teacher-sidebar-item logout-btn"
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/login";
                    }}
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}
