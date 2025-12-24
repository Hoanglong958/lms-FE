import api from "@services/api";

export const quizAttemptService = {
    /**
     * GET /api/v1/quiz-attempts/{attemptId}
     * Chi tiết lượt làm
     */
    getAttemptById(attemptId) {
        return api.get(`/api/v1/quiz-attempts/${attemptId}`);
    },

    /**
     * GET /api/v1/quiz-attempts/by-quiz/{quizId}
     * Danh sách lượt làm của quiz
     */
    getAttemptsByQuiz(quizId) {
        return api.get(`/api/v1/quiz-attempts/by-quiz/${quizId}`);
    },

    /**
     * GET /api/v1/quiz-attempts/by-user/{userId}
     * Danh sách lượt làm của user
     */
    getAttemptsByUser(userId) {
        return api.get(`/api/v1/quiz-attempts/by-user/${userId}`);
    },

    /**
     * Helper: Get All Attempts if available (Optional/Guess)
     * Using /api/v1/quiz-attempts without params might return all
     */
    getAllAttempts(params) {
        return api.get(`/api/v1/quiz-attempts`, { params });
    }
};
