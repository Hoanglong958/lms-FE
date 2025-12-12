import api from "@services/api";

const BASE_PATH = "/api/v1/classes/courses";

// GET /api/v1/classes/courses?classId={classId}
const getClassCourses = (classId) => api.get(BASE_PATH, { params: { classId: parseInt(classId) } });

// POST /api/v1/classes/courses
const assignCourseToClass = (data) => api.post(BASE_PATH, data);

// DELETE /api/v1/classes/{classId}/courses/{courseId}
const removeCourseFromClass = (classId, courseId) =>
    api.delete(`/api/v1/classes/${classId}/courses/${courseId}`);

export const classCourseService = {
    getClassCourses,
    assignCourseToClass,
    removeCourseFromClass
};

export default classCourseService;
