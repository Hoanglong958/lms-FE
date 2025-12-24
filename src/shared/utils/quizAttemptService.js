import api from "@services/api";

export const quizAttemptService = {
    /**
     * GET /api/v1/quiz-attempts
     * Lấy danh sách tất cả lượt làm quiz
     * @param {Object} params - Optional query parameters (page, size, sort, etc.)
     */
    getAllAttempts(params = {}) {
        return api.get("/api/v1/quiz-attempts", { params });
    },

    /**
     * GET /api/v1/quiz-attempts/paging
     * Lấy danh sách tất cả lượt làm quiz (có phân trang)
     * @param {Object} params - Pagination parameters: { page, size, sort }
     */
    getPagingAttempts(params = { page: 0, size: 10, sort: "startTime,desc" }) {
        return api.get("/api/v1/quiz-attempts/paging", { params });
    },

    /**
     * GET /api/v1/quiz-attempts/{attemptId}
     * Lấy chi tiết một lượt làm quiz
     * @param {number} attemptId - ID của attempt
     */
    getAttemptDetail(attemptId) {
        return api.get(`/api/v1/quiz-attempts/${attemptId}`);
    },

    /**
     * GET /api/v1/quiz-attempts/by-quiz/{quizId}
     * Lấy danh sách lượt làm của một quiz cụ thể
     * @param {number} quizId - ID của quiz
     */
    getAttemptsByQuiz(quizId) {
        return api.get(`/api/v1/quiz-attempts/by-quiz/${quizId}`);
    },

    /**
     * GET /api/v1/quiz-attempts/by-user/{userId}
     * Lấy danh sách lượt làm của một user
     * @param {number} userId - ID của user
     */
    getAttemptsByUser(userId) {
        return api.get(`/api/v1/quiz-attempts/by-user/${userId}`);
    },

    /**
     * GET /api/v1/quiz-attempts/by-user/{userId}/quiz/{quizId}
     * Lấy danh sách lượt làm của user trong một quiz cụ thể
     * @param {number} userId - ID của user
     * @param {number} quizId - ID của quiz
     */
    getAttemptsByUserAndQuiz(userId, quizId) {
        return api.get(`/api/v1/quiz-attempts/by-user/${userId}/quiz/${quizId}`);
    },

    /**
     * POST /api/v1/quiz-attempts/start
     * Bắt đầu một lượt làm quiz mới
     * @param {Object} payload - { quizId, userId }
     */
    startAttempt(payload) {
        return api.post("/api/v1/quiz-attempts/start", payload);
    },

    /**
     * POST /api/v1/quiz-attempts/{attemptId}/submit
     * Nộp bài làm quiz
     * @param {number} attemptId - ID của attempt
     * @param {Object} payload - Answers data
     */
    submitAttempt(attemptId, payload) {
        return api.post(`/api/v1/quiz-attempts/${attemptId}/submit`, payload);
    },

    /**
     * POST /api/v1/quiz-attempts/{attemptId}/attachments
     * Upload file đính kèm cho attempt
     * @param {number} attemptId - ID của attempt
     * @param {File} file - File to upload
     */
    uploadAttachment(attemptId, file) {
        const formData = new FormData();
        formData.append("file", file);
        return api.post(
            `/api/v1/quiz-attempts/${attemptId}/attachments`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    },
};

