// src/utils/scheduleService.js
import axiosClient from "./axiosClient";

export const scheduleService = {
  // GET /api/v1/schedules/course/{courseId}
  getByCourse: (courseId) => {
    return axiosClient.get(`/api/v1/schedules/course/${courseId}`);
  },

  // DELETE /api/v1/schedules/course/{courseId}
  deleteByCourse: (courseId) => {
    return axiosClient.delete(`/api/v1/schedules/course/${courseId}`);
  },

  // POST /api/v1/schedules/generate – tạo tự động
  generateAuto: (data) => {
    return axiosClient.post("/api/v1/schedules/generate", data);
  },

  // POST /api/v1/schedules/manual – tạo thủ công
  createManual: (data) => {
    return axiosClient.post("/api/v1/schedules/manual", data);
  },

  // PUT /api/v1/schedules/schedule-items/{id}
  updateItem: (itemId, data) => {
    return axiosClient.put(`/api/v1/schedules/schedule-items/${itemId}`, data);
  },
};
