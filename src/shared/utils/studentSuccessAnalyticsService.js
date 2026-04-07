import api from "@services/api";

const BASE_PATH = "/api/v1/analytics/student-success";

const getClassAnalytics = (classId) =>
  api.get(`${BASE_PATH}/class/${classId}`);

export const studentSuccessAnalyticsService = {
  getClassAnalytics,
};

export default studentSuccessAnalyticsService;
