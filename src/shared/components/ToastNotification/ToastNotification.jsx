import React, { useState, useCallback } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './ToastNotification.css';

// Duration (ms) must match toastExit animation in CSS
const EXIT_DURATION = 350;

const ToastNotification = () => {
    const { notifications, removeNotification } = useNotification();
    // Track which IDs are currently playing the exit animation
    const [exitingIds, setExitingIds] = useState(new Set());

    const handleRemove = useCallback((id) => {
        // Already exiting – ignore extra clicks
        if (exitingIds.has(id)) return;

        // 1. Add exit class (triggers CSS animation)
        setExitingIds((prev) => new Set(prev).add(id));

        // 2. After animation completes, actually remove from context
        setTimeout(() => {
            removeNotification(id);
            setExitingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }, EXIT_DURATION);
    }, [exitingIds, removeNotification]);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
            case 'error':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
            case 'warning':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
        }
    };

    return (
        <div className="toast-container">
            {notifications.map((notification) => {
                const isExiting = exitingIds.has(notification.id);
                return (
                    <div
                        key={notification.id}
                        className={`toast-item toast-${notification.type}${isExiting ? ' toast-exit' : ''}`}
                        style={{ '--toast-duration': `${(notification.duration ?? 4000)}ms` }}
                        onClick={() => handleRemove(notification.id)}
                    >
                        <div className="toast-icon">
                            {getIcon(notification.type)}
                        </div>
                        <div className="toast-content">
                            {notification.title && (
                                <div className="toast-title">{notification.title}</div>
                            )}
                            <div className="toast-message">{notification.message}</div>
                        </div>
                        <button
                            className="toast-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(notification.id);
                            }}
                            aria-label="Đóng thông báo"
                        >
                            ×
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default ToastNotification;