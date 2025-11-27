import api from "@services/api";

// =========================
// 📌 SERVICE QUẢN LÝ KỲ THI (EXAM)
// =========================
export const examService = {
  // GET /api/v1/exams  → Lấy tất cả kỳ thi
  getExams: (params = { page: 0, size: 100 }) => api.get("/api/v1/exams", { params }),

  // GET /api/v1/exams/{id} → Chi tiết kỳ thi
  getExamById: (id) => api.get(`/api/v1/exams/${id}`),

  // POST /api/v1/exams → Tạo kỳ thi mới
  createExam: (data) => api.post("/api/v1/exams", data),

  // PUT /api/v1/exams/{id} → Cập nhật kỳ thi
  updateExam: (id, data) => api.put(`/api/v1/exams/${id}`, data),

  // DELETE /api/v1/exams/{id} → Xóa kỳ thi
  deleteExam: (id) => api.delete(`/api/v1/exams/${id}`),

  // ===== Exam Attempts API =====
  listAttempts: (examId, userId) => api.get(`/api/v1/exam-attempts`, { params: { examId, userId } }),
  attemptDetail: (id) => api.get(`/api/v1/exam-attempts/detail`, { params: { id } }),
  startAttempt: (examId, userId) => api.post(`/api/v1/exam-attempts/start`, { examId, userId }),
  submitAttempt: (id, answers) => api.post(`/api/v1/exam-attempts/${id}/submit`, { answers }),
  gradeAttempt: (id, data = {}) => api.post(`/api/v1/exam-attempts/${id}/grade`, data),
};
