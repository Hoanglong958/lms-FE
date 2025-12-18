import api from "@services/api";

export const sessionExerciseService = {
  // Lấy danh sách bài tập theo session
  getSessionExercises(sessionId) {
    return api.get(`/api/v1/session-exercises`, { params: { sessionId } });
  },

  // Tạo bài tập mới
  createSessionExercise(data) {
    return api.post(`/api/v1/session-exercises`, data);
  },

  // Cập nhật bài tập
  updateSessionExercise(id, data) {
    return api.put(`/api/v1/session-exercises/${id}`, data);
  },

  // Xóa bài tập
  deleteSessionExercise(id) {
    return api.delete(`/api/v1/session-exercises/${id}`);
  },

  // Lấy chi tiết bài tập theo ID
  getSessionExerciseDetail(id) {
    return api.get(`/api/v1/session-exercises/detail`, { params: { id } });
  },
};
