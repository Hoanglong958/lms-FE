import api from "@services/api"; // dùng đúng style như lessonQuizService

export const periodService = {
  // GET /api/v1/periods – lấy danh sách ca học
  getAll() {
    return api.get("/api/v1/periods");
  },

  // POST /api/v1/periods – tạo mới
  create(data) {
    return api.post("/api/v1/periods", data);
  },

  // PUT /api/v1/periods/{id} – cập nhật
  update(id, data) {
    return api.put(`/api/v1/periods/${id}`, data);
  },

  // DELETE /api/v1/periods/{id}
  delete(id) {
    return api.delete(`/api/v1/periods/${id}`);
  },
};
