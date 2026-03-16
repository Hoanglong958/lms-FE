import React from 'react';
import { NotificationProvider } from '../contexts/NotificationContext';
import ToastNotification from '../components/ToastNotification/ToastNotification';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';

export const NotificationWrapper = ({ children }) => {
    return (
        <NotificationProvider>
            {children}
            <ToastNotification />
            <ConfirmDialog />
        </NotificationProvider>
    );
};

export { useNotification } from '../contexts/NotificationContext';
export { default as ToastNotification } from '../components/ToastNotification/ToastNotification';
export { default as ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
