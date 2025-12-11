import api from "@services/api";

const BASE_PATH = "/api/v1/classes";

const getTeachers = (classId) =>
  api.get(`${BASE_PATH}/teachers`, { params: { classId } });

const assignTeacher = (data) => api.post(`${BASE_PATH}/teachers`, data);

const removeTeacher = (classId, teacherId) =>
  api.delete(`${BASE_PATH}/${classId}/teachers/${teacherId}`);

export const classTeacherService = {
  getTeachers,
  assignTeacher,
  removeTeacher,
};

export default classTeacherService;
