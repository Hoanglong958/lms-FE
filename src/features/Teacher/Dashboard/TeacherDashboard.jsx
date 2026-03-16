import React, { useState, useEffect } from "react";
import { BookOpen, Users, ClipboardCheck, Newspaper, GraduationCap } from "lucide-react";
import { classService } from "@utils/classService";
import { notificationService } from "@utils/notificationService";
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { SERVER_URL } from "@config";
import "./TeacherDashboard.css";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState([
        {
            title: "Lớp học đang dạy",
            count: 0,
            icon: <GraduationCap size={24} />,
            color: "#f97316",
            bg: "#fff7ed"
        },
        {
            title: "Tổng số học viên",
            count: 0,
            icon: <Users size={24} />,
            color: "#3b82f6",
            bg: "#eff6ff"
        },
        {
            title: "Bài kiểm tra",
            count: 0, // TODO: Fetch exam count
            icon: <ClipboardCheck size={24} />,
            color: "#10b981",
            bg: "#ecfdf5"
        },
        {
            title: "Bài viết của tôi",
            count: 0, // TODO: Fetch post count
            icon: <Newspaper size={24} />,
            color: "#8b5cf6",
            bg: "#f5f3ff"
        }
    ]);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Vừa xong";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

        return date.toLocaleDateString('vi-VN');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Teacher's Classes
                const res = await classService.getMyClasses();
                const classList = res.data || [];
                setClasses(classList);

                // 2. Calculate Total Students
                const totalStudents = classList.reduce((sum, cls) => sum + (cls.totalStudents || 0), 0);

                // 3. Update Stats
                setStats(prev => [
                    { ...prev[0], count: classList.length },
                    { ...prev[1], count: totalStudents },
                    prev[2], // Keep Exams placeholder for now
                    prev[3]  // Keep Posts placeholder for now
                ]);

                // 4. Fetch Notifications
                try {
                    const notiRes = await notificationService.getUserNotifications(0, 5);
                    setNotifications(notiRes.content || []);
                } catch (notiError) {
                    console.error("Failed to fetch notifications:", notiError);
                }

            } catch (error) {
                console.error("Failed to fetch teacher dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 5. Setup WebSocket for real-time notifications
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
        if (!user.id) return;

        let stompClient = null;
        try {
            const socket = new SockJS(`${SERVER_URL}/ws`);
            stompClient = Stomp.over(socket);
            stompClient.debug = () => { };

            stompClient.connect({}, () => {
                stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
                    const newNotification = JSON.parse(message.body);
                    
                    setNotifications(prev => {
                        // Avoid duplicates
                        if (prev.some(n => n.id === newNotification.id)) return prev;
                        return [newNotification, ...prev.slice(0, 4)];
                    });
                });
            });
        } catch (error) {
            console.error("Teacher WebSocket setup failed:", error);
        }

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, []);

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await notificationService.markAsRead(notif.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error("Failed to mark notification as read:", error);
            }
        }
        if (notif.referenceUrl) {
            navigate(notif.referenceUrl);
        }
    };

    const handleViewAllClasses = () => {
        navigate("/teacher/classes");
    };

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
                        <button className="view-all" onClick={handleViewAllClasses}>Xem tất cả</button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <p>Đang tải dữ liệu...</p>
                        ) : classes.length > 0 ? (
                            <ul className="class-list-preview">
                                {classes.slice(0, 5).map(cls => (
                                    <li key={cls.id} className="class-item-preview">
                                        <div className="class-info">
                                            <h4>{cls.className}</h4>
                                            <span className={`status-badge ${cls.status?.toLowerCase()}`}>{cls.status}</span>
                                        </div>
                                        <div className="class-meta">
                                            <span>{cls.totalStudents} học viên</span>
                                            <span>•</span>
                                            <span>{cls.startDate || 'N/A'}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="empty-state">
                                <BookOpen size={48} color="#d1d5db" />
                                <p>Bạn chưa được phân công lớp học nào.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="teacher-side-card">
                    <div className="card-header">
                        <h2>Thông báo mới</h2>
                    </div>
                    <div className="card-body">
                        <ul className="notification-list">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <li
                                        key={notif.id}
                                        className={!notif.isRead ? 'unread' : ''}
                                        style={{ cursor: notif.referenceUrl ? 'pointer' : 'default' }}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <span className="dot" style={{ backgroundColor: notif.isRead ? '#d1d5db' : '#3b82f6' }}></span>
                                        <p><strong>{notif.title || 'Hệ thống'}</strong>: {notif.message}</p>
                                        <span className="time">{formatTime(notif.createdAt)}</span>
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <span className="dot" style={{ visibility: 'hidden' }}></span>
                                    <p style={{ color: '#6b7280' }}>Không có thông báo mới.</p>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
