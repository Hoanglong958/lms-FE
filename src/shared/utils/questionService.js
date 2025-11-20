import api from "@services/api";

export const questionService = {
  // Danh sách câu hỏi
  getQuestions() {
    return api.get(`/api/v1/questions`);
  },

  // Chi tiết câu hỏi
  getQuestion(id) {
    return api.get(`/api/v1/questions/detail`, { params: { id } });
  },

  // Tạo mới câu hỏi
  addQuestion(data) {
    return api.post(`/api/v1/questions`, data);
  },

  // Cập nhật câu hỏi
  updateQuestion(id, data) {
    return api.put(`/api/v1/questions/${id}`, data);
  },

  // Xóa câu hỏi
  deleteQuestion(id) {
    return api.delete(`/api/v1/questions/${id}`);
  },
};
