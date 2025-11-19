import api from "@services/api";

export const lessonQuizService = {
  // Lấy chi tiết quiz
  getQuiz(id) {
    return api.get(`/api/v1/lesson-quizzes/${id}`);
  },

  // Cập nhật quiz
  updateQuiz(id, data) {
    return api.put(`/api/v1/lesson-quizzes/${id}`, data);
  },

  // Xóa quiz
  deleteQuiz(id) {
    return api.delete(`/api/v1/lesson-quizzes/${id}`);
  },

  // Tạo quiz mới
  addQuiz(data) {
    return api.post(`/api/v1/lesson-quizzes`, data);
  },

  // Lấy danh sách quiz theo bài học
  getQuizzesByLesson(lessonId) {
    return api.get(`/api/v1/lesson-quizzes/lesson/${lessonId}`);
  },
};
