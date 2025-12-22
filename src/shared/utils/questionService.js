import api from "@services/api.js";

export const questionService = {
  // getAll() method removed as it does not exist in API

  getPage(params) {
    return api.get("/api/v1/questions/page", {
      params,
    });
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
  bulkCreate(questions) {
    return api.post("/api/v1/questions/bulk", questions);
  },
};
