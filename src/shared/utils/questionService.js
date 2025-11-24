import api from "@services/api.js";

export const questionService = {
  getAll() {
    return api.get("/api/v1/questions");
  },
  getById(id) {
    return api.get(`/api/v1/questions/detail?id=${id}`);
  },
  create(data) {
    return api.post("/api/v1/questions", data);
  },
  update(id, data) {
    return api.put(`/api/v1/questions/${id}`, data);
  },
  delete(id) {
    return api.delete(`/api/v1/questions/${id}`);
  },
};
