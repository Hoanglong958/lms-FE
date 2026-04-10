import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            type: 'info',
            duration: 3000,
            ...notification,
        };
        
        setNotifications((prev) => [...prev, newNotification]);

        // Auto remove after duration
        if (newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const success = useCallback((message, options = {}) => {
        return addNotification({
            type: 'success',
            message,
            ...options,
        });
    }, [addNotification]);

    const error = useCallback((message, options = {}) => {
        return addNotification({
            type: 'error',
            message,
            duration: 5000,
            ...options,
        });
    }, [addNotification]);

    const warning = useCallback((message, options = {}) => {
        return addNotification({
            type: 'warning',
            message,
            ...options,
        });
    }, [addNotification]);

    const info = useCallback((message, options = {}) => {
        return addNotification({
            type: 'info',
            message,
            ...options,
        });
    }, [addNotification]);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfirmDialog({
                ...options,
                onConfirm: () => {
                    resolve(true);
                    setConfirmDialog(null);
                },
                onCancel: () => {
                    resolve(false);
                    setConfirmDialog(null);
                },
            });
        });
    }, []);

    const value = {
        notifications,
        confirmDialog,
        success,
        error,
        warning,
        info,
        confirm,
        removeNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
