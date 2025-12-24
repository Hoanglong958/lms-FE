import api from "@services/api";

const ATTENDANCE_BASE_PATH = "/api/v1/attendance";
const ATTENDANCE_SESSIONS_BASE_PATH = "/api/v1/attendance-sessions";
const CLASSES_BASE_PATH = "/api/v1/classes";

export const attendanceService = {
    /**
     * Điểm danh từng học viên
     * POST /api/v1/attendance
     */
    markAttendance: (data) => api.post(ATTENDANCE_BASE_PATH, data),

    /**
     * Tạo buổi học để điểm danh
     * POST /api/v1/attendance-sessions
     */
    createAttendanceSession: (data) => api.post(ATTENDANCE_SESSIONS_BASE_PATH, data),

    /**
     * Danh sách học viên cần điểm danh theo buổi
     * GET /api/v1/attendance-sessions/{attendanceSessionId}/students
     */
    getStudentsBySession: (attendanceSessionId) =>
        api.get(`${ATTENDANCE_SESSIONS_BASE_PATH}/${attendanceSessionId}/students`),

    /**
     * Điểm danh hàng loạt
     * POST /api/v1/attendance/bulk
     */
    bulkMarkAttendance: (data) => api.post(`${ATTENDANCE_BASE_PATH}/bulk`, data),

    /**
     * Danh sách buổi học của lớp
     * GET /api/v1/classes/{classId}/attendance-sessions
     */
    getClassAttendanceSessions: (classId) =>
        api.get(`${CLASSES_BASE_PATH}/${classId}/attendance-sessions`),

    /**
     * Thống kê điểm danh theo từng buổi của lớp
     * GET /api/v1/classes/{classId}/attendance-summary
     */
    getClassAttendanceSummary: (classId) =>
        api.get(`${CLASSES_BASE_PATH}/${classId}/attendance-summary`),

    /**
     * Thống kê điểm danh theo khóa học của lớp 
     * GET /api/v1/classes/{classId}/courses/{courseId}/attendance
     */
    getClassCourseAttendance: (classId, courseId) =>
        api.get(`${CLASSES_BASE_PATH}/${classId}/courses/${courseId}/attendance`),
};

export default attendanceService;
