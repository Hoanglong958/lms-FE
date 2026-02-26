import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { SERVER_URL } from '@config';
import { notificationService } from '@utils/notificationService';
import notiIcon from '@assets/icons/noti-icon.svg';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Get current user info safely
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem("loggedInUser") || "{}");
        } catch {
            return {};
        }
    })();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initial load: Fetch unread count and set up WebSocket
    useEffect(() => {
        if (!user.id) return;

        const fetchInitialCount = async () => {
            try {
                const data = await notificationService.getUnreadCount();
                setUnreadCount(data.unreadCount || 0);
            } catch (error) {
                console.error("Failed to fetch unread count", error);
            }
        };

        fetchInitialCount();

        // Setup WebSocket for real-time notifications
        let stompClient = null;
        try {
            const socket = new SockJS(`${SERVER_URL}/ws`);
            stompClient = Stomp.over(socket);
            stompClient.debug = () => { }; // Disable debug logs to keep console clean

            stompClient.connect({}, () => {
                // Subscribe to user-specific notification topic
                stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
                    const newNotification = JSON.parse(message.body);

                    // Increment unread count
                    setUnreadCount(prev => prev + 1);

                    // Add new notification to top of list if dropdown is open or we have loaded data
                    setNotifications(prev => {
                        // Prevent duplicates just in case
                        if (prev.some(n => n.id === newNotification.id)) return prev;
                        return [newNotification, ...prev];
                    });
                });
            });
        } catch (error) {
            console.error("WebSocket setup failed:", error);
        }

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, [user.id]);

    // Fetch notifications when opening dropdown
    useEffect(() => {
        if (isOpen && notifications.length === 0) {
            loadNotifications(0);
        }
    }, [isOpen]);

    const loadNotifications = async (pageNumber) => {
        if (!user.id) return;
        setLoading(true);
        try {
            const data = await notificationService.getUserNotifications(pageNumber, 10);

            if (pageNumber === 0) {
                setNotifications(data.content);
            } else {
                setNotifications(prev => [...prev, ...data.content]);
            }

            setHasMore(!data.last);
            setPage(pageNumber);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = (e) => {
        e.stopPropagation();
        if (!loading && hasMore) {
            loadNotifications(page + 1);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read if it's unread
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error("Failed to mark as read", error);
            }
        }

        // Navigate if there's a reference URL
        if (notification.referenceUrl) {
            setIsOpen(false);
            navigate(notification.referenceUrl);
        }
    };

    const handleMarkAllAsRead = async (e) => {
        e.stopPropagation();
        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

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

    const getIconForType = (type) => {
        switch (type) {
            case 'ACADEMIC': return <i className="fa-solid fa-graduation-cap"></i>;
            case 'PAYMENT': return <i className="fa-solid fa-credit-card"></i>;
            case 'ATTENDANCE': return <i className="fa-solid fa-clipboard-user"></i>;
            case 'SCHEDULE': return <i className="fa-regular fa-calendar-check"></i>;
            case 'CHAT': return <i className="fa-regular fa-comments"></i>;
            case 'COURSE_REGISTRATION': return <i className="fa-solid fa-book-open"></i>;
            case 'SYSTEM':
            default: return <i className="fa-solid fa-bell"></i>;
        }
    };

    return (
        <div className="notification-dropdown-container" ref={dropdownRef}>
            <button
                className="notification-bell-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <img src={notiIcon} alt="Notification" />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown-menu">
                    <div className="notification-dropdown-header">
                        <h3>Thông báo</h3>
                        {unreadCount > 0 && (
                            <button className="notification-mark-all" onClick={handleMarkAllAsRead}>
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    <ul className="notification-list">
                        {notifications.length === 0 && !loading ? (
                            <div className="notification-empty">
                                <i className="fa-regular fa-bell-slash"></i>
                                <span>Bạn chưa có thông báo nào</span>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <li
                                    key={notification.id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className={`notification-icon-wrapper notif-type-${notification.type}`}>
                                        {getIconForType(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <h4 className="notification-title">{notification.title}</h4>
                                        <p className="notification-message">{notification.message}</p>
                                        <div className="notification-meta">
                                            <span className="notification-time">{formatTime(notification.createdAt)}</span>
                                        </div>
                                    </div>
                                    {!notification.isRead && <div className="notification-unread-dot"></div>}
                                </li>
                            ))
                        )}

                        {loading && (
                            <div className="notification-loading">
                                <i className="fa-solid fa-spinner fa-spin"></i> Đang tải...
                            </div>
                        )}
                    </ul>

                    {hasMore && notifications.length > 0 && !loading && (
                        <div className="notification-dropdown-footer">
                            <button className="notification-view-more" onClick={handleLoadMore}>
                                Xem thêm
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
