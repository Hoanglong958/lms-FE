import api from "@services/api";

export const sessionService = {
  // Lấy chi tiết session
  getSession(id) {
    return api.get(`/api/v1/sessions/${id}`);
  },

  // Cập nhật session
  updateSession(id, data) {
    return api.put(`/api/v1/sessions/${id}`, data);
  },

  // Xóa session
  deleteSession(id) {
    return api.delete(`/api/v1/sessions/${id}`);
  },

  // Tạo session mới
  addSession(data) {
    return api.post(`/api/v1/sessions`, data);
  },

  // Lấy danh sách session theo khóa học
  getSessionsByCourse(courseId) {
    return api.get(`/api/v1/sessions/course/${courseId}`);
  },
};
