import api from "@services/api";

const API_URL = "/api/v1/registrations";

export const registrationService = {
    register: async (courseId, note = "") => {
        return await api.post(API_URL, { courseId, note });
    },

    getMyRegistrations: async () => {
        return await api.get(`${API_URL}/my`);
    },

    getAllRegistrations: async () => {
        return await api.get(`${API_URL}/all`);
    },

    confirmPayment: async (registrationId) => {
        return await api.patch(`${API_URL}/${registrationId}/confirm-payment`);
    },

    getBankInfo: async () => {
        return await api.get(`${API_URL}/bank-info`);
    },

    exportExcel: async () => {
        return await api.get(`${API_URL}/export/excel`, { responseType: 'blob' });
    },

    exportPdf: async (registrationId) => {
        return await api.get(`${API_URL}/${registrationId}/export/pdf`, { responseType: 'blob' });
    },
    
    cancelRegistration: async (registrationId) => {
        return await api.patch(`${API_URL}/${registrationId}/cancel`);
    },

    markPaymentSubmitted: async (registrationId) => {
        return await api.patch(`${API_URL}/${registrationId}/payment-submitted`);
    },

    confirmBulkPayment: async (registrationIds) => {
        return await api.patch(`${API_URL}/bulk-confirm`, registrationIds);
    }
};
