import api from "@services/api";

export const quizQuestionService = {
  // Lấy danh sách câu hỏi của quiz
  getByQuiz(quizId) {
    return api.get(`/api/v1/quiz-questions/by-quiz/${quizId}`).catch((err) => {
      console.error("GET QUIZ QUESTIONS ERROR:", err.response?.data || err);
      throw err;
    });
  },

  // Thêm 1 câu hỏi vào quiz
  add(question) {
    console.log("REQUEST ADD:", question);

    return api.post(`/api/v1/quiz-questions`, question).catch((err) => {
      console.error("ADD QUIZ QUESTION ERROR:", err.response?.data || err);
      throw err;
    });
  },

  // Xóa câu hỏi khỏi quiz
  delete(id) {
    return api.delete(`/api/v1/quiz-questions/${id}`).catch((err) => {
      console.error("DELETE QUIZ QUESTION ERROR:", err.response?.data || err);
      throw err;
    });
  },
};
