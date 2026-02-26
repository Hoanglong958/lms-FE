import axios from 'axios';
import { SERVER_URL } from '@config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const notificationService = {
    /**
     * Lấy danh sách thông báo phân trang
     * @param {number} page 
     * @param {number} limit 
     */
    getUserNotifications: async (page = 0, limit = 10) => {
        try {
            const response = await axios.get(
                `${SERVER_URL}/api/v1/notifications?page=${page}&limit=${limit}`,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thông báo:", error);
            throw error;
        }
    },

    /**
     * Lấy số lượng thông báo chưa đọc
     */
    getUnreadCount: async () => {
        try {
            const response = await axios.get(
                `${SERVER_URL}/api/v1/notifications/unread-count`,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error("Lỗi khi lấy số lượng thông báo chưa đọc:", error);
            throw error;
        }
    },

    /**
     * Đánh dấu 1 thông báo là đã đọc
     * @param {number} notificationId 
     */
    markAsRead: async (notificationId) => {
        try {
            const response = await axios.put(
                `${SERVER_URL}/api/v1/notifications/${notificationId}/read`,
                {},
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error(`Lỗi khi đánh dấu đã đọc thông báo ${notificationId}:`, error);
            throw error;
        }
    },

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    markAllAsRead: async () => {
        try {
            const response = await axios.put(
                `${SERVER_URL}/api/v1/notifications/read-all`,
                {},
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
            throw error;
        }
    }
};
