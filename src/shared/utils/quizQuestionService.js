import api from "@services/api";

export const quizQuestionService = {
  // Lấy danh sách câu hỏi của quiz
  getByQuiz(quizId) {
    return api.get(`/api/v1/quiz-questions/by-quiz/${quizId}`);
  },

  // Thêm 1 câu hỏi vào quiz
  add(question) {
    // question = { quizId, questionId, orderIndex }
    return api.post(`/api/v1/quiz-questions`, question);
  },

  // Thêm nhiều câu hỏi cùng lúc
  addBatch(questions) {
    // questions = [{ quizId, questionId, orderIndex }, ...]
    return api.post(`/api/v1/quiz-questions/batch`, questions);
  },

  // Xóa câu hỏi khỏi quiz
  delete(id) {
    return api.delete(`/api/v1/quiz-questions/${id}`);
  },
};
