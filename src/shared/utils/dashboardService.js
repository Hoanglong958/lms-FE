import api from "@services/api";

export const dashboardService = {
  getOverview: () => api.get("/api/v1/dashboard"),
  getCourseProgress: (courseId) => api.get(`/api/v1/dashboard/course-progress/${courseId}`),
  getNewCourses: () => api.get("/api/v1/dashboard/new-courses"),
  getNewUsers: () => api.get("/api/v1/dashboard/new-users"),
  getQuizReports: () => api.get("/api/v1/dashboard/quiz-reports"),
  getRecentExams: () => api.get("/api/v1/dashboard/recent-exams"),
  getTopStudents: () => api.get("/api/v1/dashboard/top-students"),

  // ⭐ FIXED: truyền params theo requirement Swagger
  getUserGrowthByMonth: (months = 12) =>
    api.get(`/api/v1/dashboard/user-growth/month?months=${months}`),

  getUserGrowthByWeek: (weeks = 4) =>
    api.get(`/api/v1/dashboard/user-growth/week?weeks=${weeks}`),

  getRevenueGrowthByMonth: (months = 12) =>
    api.get(`/api/v1/dashboard/revenue-growth/month?months=${months}`),

  getRecentTransactions: (limit = 10) =>
    api.get(`/api/v1/dashboard/recent-transactions?limit=${limit}`),
};

export default dashboardService;
