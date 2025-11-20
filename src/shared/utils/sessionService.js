import api from "@services/api";

export const sessionService = {
  // Lấy chi tiết session
  getSession(id) {
    return api.get(`/api/v1/sessions/detail`, { params: { id } });
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

  // Lấy danh sách session (có thể filter theo khóa học bằng query param)
  getSessionsByCourse(courseId) {
    return api.get(`/api/v1/sessions`, { params: { courseId } });
  },
};
