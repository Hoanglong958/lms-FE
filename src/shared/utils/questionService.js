import api from "@services/api.js";

export const questionService = {

  /**
   * GET /api/v1/questions/page
   * Lấy danh sách câu hỏi (phân trang + tìm kiếm)
   */
  getPage({ page = 0, size = 10, keyword, category }) {
    const params = { page, size };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    return api.get("/api/v1/questions/page", { params });
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
  

  /**
   * POST /api/v1/questions/upload
   * Upload câu hỏi từ file Excel
   * @param {File} file - File Excel chứa danh sách câu hỏi
   */
  uploadExcel(file) {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/v1/questions/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * POST /api/v1/questions/import-url
   * Nhập câu hỏi từ URL file Excel
   * @param {string} url - URL file Excel
   */
  importUrl(url) {
    return api.post("/api/v1/questions/import-url", null, {
      params: { url },
    });
  },

  /**
   * GET /api/v1/questions/categories
   * Lấy danh sách danh mục câu hỏi (có phân trang)
   */
  getCategories({ page = 0, size = 10 } = {}) {
    return api.get("/api/v1/questions/categories", { params: { page, size } });
  },
};

