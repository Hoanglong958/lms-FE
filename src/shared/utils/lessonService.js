import api from "@services/api";

export const lessonService = {
  // Lấy chi tiết bài học
  // GET /api/v1/lessons/{id}
  getLesson(id) {
    return api.get(`/api/v1/lessons/${id}`);
  },

  // Cập nhật bài học
  // PUT /api/v1/lessons/{id}
  updateLesson(id, data) {
    return api.put(`/api/v1/lessons/${id}`, data);
  },

  // Xóa bài học
  // DELETE /api/v1/lessons/{id}
  deleteLesson(id) {
    return api.delete(`/api/v1/lessons/${id}`);
  },

  // Tạo bài học mới
  // POST /api/v1/lessons
  addLesson(data) {
    return api.post(`/api/v1/lessons`, data);
  },

  // Lấy danh sách bài học theo session
  // GET /api/v1/lessons/session/{sessionId}
  getLessonsBySession(sessionId) {
    return api.get(`/api/v1/lessons/session/${sessionId}`);
  },
};
