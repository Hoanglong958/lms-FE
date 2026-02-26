import api from "@services/api";

const BASE_PATH = "/api/v1";

/**
 * Tạo buổi học để điểm danh
 * @param {Object} data 
 * @returns {Promise}
 */
const createSession = (data) => api.post(`${BASE_PATH}/attendance-sessions`, data);

/**
 * Lấy danh sách buổi học của lớp
 * @param {number} classId 
 * @returns {Promise}
 */
const listSessionsByClass = (classId) => api.get(`${BASE_PATH}/classes/${classId}/attendance-sessions`);

/**
 * Lấy danh sách học viên cần điểm danh theo buổi
 * @param {number} sessionId 
 * @returns {Promise}
 */
const listStudentsForSession = (sessionId) => api.get(`${BASE_PATH}/attendance-sessions/${sessionId}/students`);

/**
 * Điểm danh từng học viên
 * @param {Object} data 
 * @returns {Promise}
 */
const markAttendance = (data) => api.post(`${BASE_PATH}/attendance`, data);

/**
 * Điểm danh hàng loạt
 * @param {number} sessionId 
 * @param {Array} records 
 * @returns {Promise}
 */
const markAttendanceBulk = (sessionId, records) => api.post(`${BASE_PATH}/attendance/bulk`, { sessionId, records });

/**
 * Thống kê điểm danh theo từng buổi của lớp
 * @param {number} classId 
 * @returns {Promise}
 */
const summarizeByClass = (classId) => api.get(`${BASE_PATH}/classes/${classId}/attendance-summary`);

/**
 * Thống kê điểm danh theo khóa học của lớp
 * @param {number} classId 
 * @param {number} courseId 
 * @returns {Promise}
 */
const summarizeByCourse = (classId, courseId) => api.get(`${BASE_PATH}/classes/${classId}/courses/${courseId}/attendance`);

/**
 * Kiểm tra xem ngày có lịch học không
 * @param {number} classId 
 * @param {string} date 
 * @returns {Promise}
 */
const validateScheduleDate = (classId, date) => api.get(`${BASE_PATH}/classes/${classId}/schedule/validate?date=${date}`);

/**
 * Lấy điểm danh theo lớp và ngày
 * @param {number} classId 
 * @param {string} date 
 * @returns {Promise}
 */
const getAttendanceByClassAndDate = (classId, date) => api.get(`${BASE_PATH}/classes/${classId}/attendance?date=${date}`);

/**
 * Lấy danh sách ngày có lịch học trong tháng
 * @param {number} classId 
 * @param {number} year 
 * @param {number} month 
 * @returns {Promise}
 */
const getScheduledDates = (classId, year, month) =>
    api.get(`${BASE_PATH}/classes/${classId}/schedule-dates?year=${year}&month=${month}`);

export const attendanceService = {
    createSession,
    listSessionsByClass,
    listStudentsForSession,
    markAttendance,
    markAttendanceBulk,
    summarizeByClass,
    summarizeByCourse,
    validateScheduleDate,
    getAttendanceByClassAndDate,
    getScheduledDates
};

export default attendanceService;
