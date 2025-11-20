// c:\Users\Admin\Downloads\rkikkei\client-react\src\shared\utils\quizService.js
import api from "@services/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const quizService = {
  getQuiz(id) {
    return api.get(`/api/v1/lesson-quizzes/${id}`, { headers: getAuthHeaders() });
  },
  updateQuiz(id, data) {
    return api.put(`/api/v1/lesson-quizzes/${id}`, data, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
  },
  deleteQuiz(id) {
    return api.delete(`/api/v1/lesson-quizzes/${id}`, { headers: getAuthHeaders() });
  },
  addQuiz(data) {
    return api.post(`/api/v1/lesson-quizzes`, data, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
  },
  getQuizzesByLesson(lessonId) {
    return api.get(`/api/v1/lesson-quizzes/lesson/${lessonId}`, { headers: getAuthHeaders() });
  },
};