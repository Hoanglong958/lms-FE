import api from "@services/api.js";

/**
 * Service quản lý câu hỏi (Question Bank)
 */
export const questionService = {

  /**
   * GET /api/v1/questions/page
   * Lấy danh sách câu hỏi (phân trang + tìm kiếm)
   */
  getPage({ page = 0, size = 10, keyword = "", category = "" }) {
    return api.get("/api/v1/questions/page", {
      params,
    });
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
};

