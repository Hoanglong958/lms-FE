import api from "@services/api";

export const lessonDocumentService = {
  getDocumentsByLesson(lessonId) {
    return api.get("/api/v1/lesson-documents", { params: { lessonId } });
  },

  getDocument(id) {
    return api.get("/api/v1/lesson-documents/detail", { params: { id } });
  },

  addDocument(data) {
    return api.post("/api/v1/lesson-documents", data);
  },

  updateDocument(id, data) {
    return api.put(`/api/v1/lesson-documents/${id}`, data);
  },

  deleteDocument(id) {
    return api.delete(`/api/v1/lesson-documents/${id}`);
  },
};
