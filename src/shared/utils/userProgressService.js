import api from "@services/api";

export const userProgressService = {
  // POST /api/v1/user-progress/lessons
  // data: { userId, lessonId, sessionId, courseId, type, status, progressPercent }
  saveLessonProgress(data) {
    return api.post("/api/v1/user-progress/lessons", data);
  },

  // POST /api/v1/user-progress/roadmaps
  // data: { userId, roadmapId, status, currentItemId }
  saveRoadmapProgress(data) {
    return api.post("/api/v1/user-progress/roadmaps", data);
  },

  // GET /api/v1/user-progress/users/{userId}/courses/{courseId}/lessons
  getByCourse(userId, courseId) {
    return api.get(
      `/api/v1/user-progress/users/${userId}/courses/${courseId}/lessons`
    );
  },

  // GET /api/v1/user-progress/users/{userId}/roadmaps/{roadmapId}
  getByRoadmap(userId, roadmapId) {
    return api.get(
      `/api/v1/user-progress/users/${userId}/roadmaps/${roadmapId}`
    );
  },
};
