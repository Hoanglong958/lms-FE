import api from "@services/api";

const BASE_PATH = "/api/v1/classes/teachers";

// GET /api/v1/classes/teachers?classId={classId}
const getClassTeachers = (classId) => api.get(BASE_PATH, { params: { classId: parseInt(classId) } });

// POST /api/v1/classes/teachers
const assignTeacherToClass = (data) => api.post(BASE_PATH, data);

// DELETE /api/v1/classes/{classId}/teachers/{teacherId}
const removeTeacherFromClass = (classId, teacherId) =>
    api.delete(`/api/v1/classes/${classId}/teachers/${teacherId}`);

export const classTeacherService = {
    getClassTeachers,
    assignTeacherToClass,
    removeTeacherFromClass
};

export default classTeacherService;
