import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// =========================
// 📌 SERVICE QUẢN LÝ KỲ THI (EXAM)
// =========================
export const examService = {
  // GET /api/v1/exams  → Lấy tất cả kỳ thi
  getExams: () => {
    return axios.get(`${API_BASE}/api/v1/exams`);
  },

  // GET /api/v1/exams/{id} → Chi tiết kỳ thi
  getExamById: (id) => {
    return axios.get(`${API_BASE}/api/v1/exams/${id}`);
  },

  // POST /api/v1/exams → Tạo kỳ thi mới
  createExam: (data) => {
    return axios.post(`${API_BASE}/api/v1/exams`, data);
  },

  // PUT /api/v1/exams/{id} → Cập nhật kỳ thi
  updateExam: (id, data) => {
    return axios.put(`${API_BASE}/api/v1/exams/${id}`, data);
  },

  // DELETE /api/v1/exams/{id} → Xóa kỳ thi
  deleteExam: (id) => {
    return axios.delete(`${API_BASE}/api/v1/exams/${id}`);
  },
};
