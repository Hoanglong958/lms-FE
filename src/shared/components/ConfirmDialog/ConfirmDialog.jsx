import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './ConfirmDialog.css';

const ConfirmDialog = () => {
    const { confirmDialog } = useNotification();

    if (!confirmDialog) return null;

    const {
        title = 'Xác nhận',
        message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
        confirmText = 'Đồng ý',
        cancelText = 'Hủy',
        type = 'warning',
        onConfirm,
        onCancel,
    } = confirmDialog;

    const getIcon = () => {
        switch (type) {
            case 'danger':
            case 'error':
                return (
                    <div className="confirm-icon confirm-icon-error">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="confirm-icon confirm-icon-warning">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                );
            case 'info':
            default:
                return (
                    <div className="confirm-icon confirm-icon-info">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                {getIcon()}
                <h3 className="confirm-title">{title}</h3>
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <button className="confirm-btn confirm-btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button 
                        className={`confirm-btn confirm-btn-confirm confirm-btn-${type}`} 
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
