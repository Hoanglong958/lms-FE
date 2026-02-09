import React, { useMemo } from "react";
import { BookOpen, Users, ClipboardCheck, Newspaper, GraduationCap } from "lucide-react";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {
    // Demo data - in real app, fetch from API
    const stats = useMemo(() => [
        {
            title: "Lớp học đang dạy",
            count: 4,
            icon: <GraduationCap size={24} />,
            color: "#f97316",
            bg: "#fff7ed"
        },
        {
            title: "Tổng số học viên",
            count: 128,
            icon: <Users size={24} />,
            color: "#3b82f6",
            bg: "#eff6ff"
        },
        {
            title: "Bài kiểm tra",
            count: 12,
            icon: <ClipboardCheck size={24} />,
            color: "#10b981",
            bg: "#ecfdf5"
        },
        {
            title: "Bài viết của tôi",
            count: 8,
            icon: <Newspaper size={24} />,
            color: "#8b5cf6",
            bg: "#f5f3ff"
        }
    ], []);

    return (
        <div className="teacher-dashboard">
            <div className="teacher-dashboard-header">
                <h1 className="teacher-dashboard-title">Chào mừng trở lại, Giảng viên!</h1>
                <p className="teacher-dashboard-subtitle">Dưới đây là tóm tắt hoạt động giảng dạy của bạn hôm nay.</p>
            </div>

            <div className="teacher-stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="teacher-stat-card">
                        <div className="stat-icon" style={{ color: stat.color, backgroundColor: stat.bg }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <h3 className="stat-label">{stat.title}</h3>
                            <p className="stat-value">{stat.count}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="teacher-content-grid">
                <div className="teacher-main-card">
                    <div className="card-header">
                        <h2>Lớp học gần đây</h2>
                        <button className="view-all">Xem tất cả</button>
                    </div>
                    <div className="card-body">
                        <div className="empty-state">
                            <BookOpen size={48} color="#d1d5db" />
                            <p>Chưa có lớp học nào bắt đầu trong hôm nay.</p>
                        </div>
                    </div>
                </div>

                <div className="teacher-side-card">
                    <div className="card-header">
                        <h2>Thông báo mới</h2>
                    </div>
                    <div className="card-body">
                        <ul className="notification-list">
                            <li>
                                <span className="dot"></span>
                                <p><strong>Lớp Java01</strong> vừa có 5 bài tập mới được nộp.</p>
                                <span className="time">2 giờ trước</span>
                            </li>
                            <li>
                                <span className="dot"></span>
                                <p>Yêu cầu phê duyệt bài viết "Lộ trình học React".</p>
                                <span className="time">5 giờ trước</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
