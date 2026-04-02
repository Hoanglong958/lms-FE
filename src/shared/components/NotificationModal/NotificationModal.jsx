import React from 'react';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    return (
        <div className="notif-modal-overlay" onClick={onClose}>
            <div className={`notif-modal-content notif-${type}`} onClick={(e) => e.stopPropagation()}>
                <div className="notif-header">
                    <h3 className="notif-title">{title}</h3>
                    <button className="notif-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="notif-body">
                    <p>{message}</p>
                </div>
                <div className="notif-footer">
                    <button className="notif-btn" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
