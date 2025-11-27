import api from "@services/api";

export const dashboardService = {
  getOverview: () => api.get("/api/v1/dashboard"),
  getCourseProgress: (courseId) => api.get(`/api/v1/dashboard/course-progress/${courseId}`),
  getNewCourses: () => api.get("/api/v1/dashboard/new-courses"),
  getNewUsers: () => api.get("/api/v1/dashboard/new-users"),
  getQuizReports: () => api.get("/api/v1/dashboard/quiz-reports"),
  getRecentQuizzes: () => api.get("/api/v1/dashboard/recent-quizzes"),
  getTopStudents: () => api.get("/api/v1/dashboard/top-students"),
  getUserGrowthByMonth: () => api.get("/api/v1/dashboard/user-growth/month"),
  getUserGrowthByWeek: () => api.get("/api/v1/dashboard/user-growth/week"),
};

export default dashboardService;
