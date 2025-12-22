// src/utils/scheduleService.js
import api from "@services/api";

export const scheduleService = {
  // GET /api/v1/schedules/course/{courseId}
  getByCourse: (courseId) => {
    return api.get(`/api/v1/schedules/course/${courseId}`);
  },

  // GET /api/v1/schedules/class/{classId}
  getByClass: (classId) => {
    return api.get(`/api/v1/schedules/class/${classId}`);
  },

  // DELETE /api/v1/schedules/course/{courseId}
  deleteByCourse: (courseId) => {
    return api.delete(`/api/v1/schedules/course/${courseId}`);
  },

  // DELETE /api/v1/schedules/class-course/{classCourseId}
  deleteByClassCourseId: (classCourseId) => {
    return api.delete(`/api/v1/schedules/class-course/${classCourseId}`);
  },

  // GET /api/v1/schedules/class-course/{classCourseId}/schedule
  getByClassCourseId: (classCourseId) => {
    return api.get(`/api/v1/schedules/class-course/${classCourseId}/schedule`);
  },

  // POST /api/v1/schedules/generate – tạo tự động
  generateAuto: (data) => {
    return api.post("/api/v1/schedules/generate", data);
  },

  // POST /api/v1/schedules/manual – tạo thủ công
  createManual: (data) => {
    return api.post("/api/v1/schedules/manual", data);
  },

  // PUT /api/v1/schedules/schedule-items/{id}
  updateItem: (itemId, data) => {
    return api.put(`/api/v1/schedules/schedule-items/${itemId}`, data);
  },
};
