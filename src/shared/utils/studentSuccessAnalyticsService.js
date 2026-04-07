import api from "@services/api";

const BASE_PATH = "/api/v1/analytics/student-success";

const getClassAnalytics = (classId) =>
  api.get(`${BASE_PATH}/class/${classId}`);

const getAccessibleClasses = () => api.get(`${BASE_PATH}/classes`);

export const studentSuccessAnalyticsService = {
  getClassAnalytics,
  getAccessibleClasses,
};

export default studentSuccessAnalyticsService;
