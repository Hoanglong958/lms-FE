import api from "@services/api";

export const quizAttemptService = {
    // POST /api/v1/quiz-attempts/start
    // payload: { quizId, userId }
    startAttempt(payload) {
        return api.post("/api/v1/quiz-attempts/start", payload);
    },

    // POST /api/v1/quiz-attempts/{attemptId}/submit
    submitAttempt(attemptId, payload) {
        return api.post(`/api/v1/quiz-attempts/${attemptId}/submit`, payload);
    },

    // GET /api/v1/quiz-attempts/{attemptId}
    getAttemptDetail(attemptId) {
        return api.get(`/api/v1/quiz-attempts/${attemptId}`);
    },

    // POST /api/v1/quiz-attempts/{attemptId}/attachments
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

    // GET /api/v1/quiz-attempts/by-quiz/{quizId}
    getAttemptsByQuiz(quizId) {
        return api.get(`/api/v1/quiz-attempts/by-quiz/${quizId}`);
    },

    // GET /api/v1/quiz-attempts/by-user/{userId}
    getAttemptsByUser(userId) {
        return api.get(`/api/v1/quiz-attempts/by-user/${userId}`);
    },
};
