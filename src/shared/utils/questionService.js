import api from "@services/api.js";

/**
 * Service quản lý câu hỏi (Question Bank)
 */
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

  /**
   * Helper: Lấy tất cả câu hỏi (thực chất là lấy trang đầu với kích thước lớn)
   */
  getAll() {
    return this.getPage({ page: 0, size: 1000, keyword: "", category: "" });
  },

  /**
   * GET /api/v1/questions/detail
   * Lấy chi tiết câu hỏi
   */
  getById(id) {
    return api.get("/api/v1/questions/detail", { params: { id } });
  },

  /**
   * POST /api/v1/questions
   * Tạo câu hỏi mới
   */
  create(data) {
    return api.post("/api/v1/questions", data);
  },

  /**
   * PUT /api/v1/questions/{id}
   * Cập nhật câu hỏi
   */
  update(id, data) {
    return api.put(`/api/v1/questions/${id}`, data);
  },

  /**
   * DELETE /api/v1/questions/{id}
   * Xóa câu hỏi
   */
  delete(id) {
    return api.delete(`/api/v1/questions/${id}`);
  },

  /**
   * POST /api/v1/questions/bulk
   * Tạo nhiều câu hỏi
   */
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
