import api from "@services/api";

const BASE_PATH = "/api/v1/classes/students";

/**
 * GET /api/v1/classes/students?classId={classId}
 * Lấy danh sách học viên trong lớp
 * @param {number} classId - ID của lớp học
 * @returns {Promise} Response containing array of students in class
 */
const getClassStudents = (classId) => api.get(BASE_PATH, { params: { classId: parseInt(classId) } });

/**
 * POST /api/v1/classes/students
 * Thêm học viên vào lớp
 * @param {Object} data - Student enrollment data
 * @param {number} data.classId - ID của lớp học
 * @param {number} data.studentId - ID của học viên
 * @param {string} data.status - Trạng thái (ACTIVE, etc.)
 * @param {number} [data.finalScore] - Điểm cuối kỳ
 * @param {number} [data.attendanceRate] - Tỷ lệ điểm danh
 * @param {string} [data.note] - Ghi chú
 * @returns {Promise} Response containing created enrollment record
 */
const addStudentToClass = (data) => api.post(BASE_PATH, data);

/**
 * DELETE /api/v1/classes/{classId}/students/{studentId}
 * Xóa học viên khỏi lớp
 * @param {number} classId - ID của lớp học
 * @param {number} studentId - ID của học viên
 * @returns {Promise} Response confirming deletion
 */
const removeStudentFromClass = (classId, studentId) =>
    api.delete(`/api/v1/classes/${classId}/students/${studentId}`);

export const classStudentService = {
    getClassStudents,
    addStudentToClass,
    removeStudentFromClass
};

export default classStudentService;
