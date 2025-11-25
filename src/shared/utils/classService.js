import axiosInstance from "./../../config";

// API endpoint cho classes
const API_ENDPOINT = "/classes";

const classService = {
  // 1. GET /classes (Danh sách lớp học với pagination)
  getAllClasses: (params) => {
    // params: { page, size, keyword, status }
    return axiosInstance.get(API_ENDPOINT, { params });
  },

  // 2. POST /classes (Tạo lớp học)
  createClass: (payload) => {
    // payload: { name, description, teacherId, startDate, endDate, ... }
    return axiosInstance.post(API_ENDPOINT, payload);
  },

  // 3. PUT /classes/{id} (Cập nhật lớp học)
  updateClass: (id, payload) => {
    // payload: { name, description, teacherId, startDate, endDate, ... }
    return axiosInstance.put(`${API_ENDPOINT}/${id}`, payload);
  },

  // 4. DELETE /classes/{id} (Xóa lớp học - Soft delete)
  deleteClass: (id) => {
    return axiosInstance.delete(`${API_ENDPOINT}/${id}`);
  }
};

export default classService;
