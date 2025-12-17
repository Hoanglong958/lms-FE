import api from "@services/api";

export const quizResultService = {
  // Lấy danh sách kết quả (Admin)
  getResults() {
    return api.get("/api/v1/quiz-results");
  },

  // Lấy chi tiết kết quả
  getResultDetail(id) {
    return api.get("/api/v1/quiz-results/detail", { params: { id } });
  },

  // Xóa kết quả (Admin)
  deleteResult(id) {
    return api.delete(`/api/v1/quiz-results/${id}`);
  },

  // Nộp bài quiz
  submitQuiz(data) {
    return api.post("/api/v1/quiz-results/submit", data);
  },
};
