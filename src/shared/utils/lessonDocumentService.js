import api from "@services/api";

export const lessonDocumentService = {
  // Lấy chi tiết tài liệu
  getDocument(id) {
    return api.get(`/api/v1/lesson-documents/detail`, { params: { id } });
  },

  // Cập nhật tài liệu
  updateDocument(id, data) {
    return api.put(`/api/v1/lesson-documents/${id}`, data);
  },

  // Xóa tài liệu
  deleteDocument(id) {
    return api.delete(`/api/v1/lesson-documents/${id}`);
  },

  // Tạo tài liệu mới
  addDocument(data) {
    return api.post(`/api/v1/lesson-documents`, data);
  },

  // Lấy danh sách tài liệu theo bài học
  getDocumentsByLesson(lessonId) {
    return api.get(`/api/v1/lesson-documents`, { params: { lessonId } });
  },
};
