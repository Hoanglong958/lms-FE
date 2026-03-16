import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import NotificationDropdown from "@components/Notification/NotificationDropdown";
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
    const [unreadChatCount, setUnreadChatCount] = useState(0);

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

    useEffect(() => {
        if (!user.id) return;

        const fetchUnread = async () => {
            try {
                const { chatService } = await import("@utils/chatService");
                const res = await chatService.getTotalUnreadCount(user.id);
                setUnreadChatCount(res.data);
            } catch (err) {
                console.error("Failed to fetch unread chat count", err);
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 60000);
        
        window.addEventListener('chat-read', fetchUnread);
        window.addEventListener('chat-unread-updated', fetchUnread);

        return () => {
            clearInterval(interval);
            window.removeEventListener('chat-read', fetchUnread);
            window.removeEventListener('chat-unread-updated', fetchUnread);
        };
    }, [user.id]);

    return (
        <div className={`teacher-sidebar ${isOpen ? "open" : ""}`}>
            <div>
                {/* Header */}
                <div className="teacher-sidebar-header">
                    <img src="/logo.png" alt="Logo" className="teacher-sidebar-logo" />
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
                        <i className="fa-solid fa-house-laptop"></i>
                        Trung tâm Quản lý
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
                            isActive ? "teacher-sidebar-item active chat-item" : "teacher-sidebar-item chat-item"
                        }
                    >
                        <i className="fa-solid fa-comments"></i>
                        <span>Trò chuyện</span>
                        {unreadChatCount > 0 && (
                            <span className="sidebar-chat-badge">
                                {unreadChatCount > 99 ? '99+' : unreadChatCount}
                            </span>
                        )}
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
