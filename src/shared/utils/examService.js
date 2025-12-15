import api from "@services/api";

/**
 * ================================
 * 📌 SERVICE QUẢN LÝ KỲ THI (EXAM)
 * ================================
 */
export const examService = {

  /** Lấy danh sách kỳ thi */
  getExams: (params) => 
    params ? api.get("/api/v1/exams", { params }) : api.get("/api/v1/exams"),

  /** Lấy chi tiết kỳ thi (API backend yêu cầu dạng /detail?id=) */
  getExamById: (id) => 
    api.get("/api/v1/exams/detail", { params: { id } }),

  /** Tạo kỳ thi */
  createExam: (data) => 
    api.post("/api/v1/exams", data),

  /** Cập nhật kỳ thi */
  updateExam: (id, data) => 
    api.put(`/api/v1/exams/${id}`, data),

  /** Xóa kỳ thi */
  deleteExam: (id) => {
    const rid = Number(id);
    if (!Number.isFinite(rid) || rid <= 0) {
      return Promise.reject(new Error("Invalid exam id"));
    }
    return api.delete(`/api/v1/exams/${rid}`);
  },


  // ==================================================
  // 📌 Exam Attempts - Làm bài, nộp bài, xem kết quả
  // ==================================================

  /** Lấy danh sách lượt thi */
  listAttempts: (examId, userId) => 
    api.get(`/api/v1/exam-attempts`, { params: { examId, userId } }),

  /** Lấy chi tiết bài làm */
  attemptDetail: (id) => 
    api.get(`/api/v1/exam-attempts/detail`, { params: { id } }),

  /** Bắt đầu làm bài */
  startAttempt: (examId, userId) => 
    api.post(`/api/v1/exam-attempts/start`, { examId, userId }),

  /** Nộp bài */
  submitAttempt: (id, answers) => 
    api.post(`/api/v1/exam-attempts/${id}/submit`, { answers }),

  /** Chấm điểm */
  gradeAttempt: (id, data = {}) => 
    api.post(`/api/v1/exam-attempts/${id}/grade`, data),

  answersByAttempt: (attemptId) => 
    api.get(`/api/v1/exam-answers/by-attempt/${attemptId}`),

  myAnswersByAttempt: (attemptId) => 
    api.get(`/api/v1/exam-answers/my/${attemptId}`),
};
