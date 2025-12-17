import api from "@services/api";

const BASE_PATH = "/api/v1/roadmaps";

/**
 * Get roadmap by classId and courseId
 * GET /api/v1/roadmaps?classId={classId}&courseId={courseId}
 */
const getRoadmap = (classId, courseId) =>
    api.get(BASE_PATH, { params: { classId, courseId } });

/**
 * Delete roadmap by classId and courseId
 * DELETE /api/v1/roadmaps?classId={classId}&courseId={courseId}
 */
const deleteRoadmap = (classId, courseId) =>
    api.delete(BASE_PATH, { params: { classId, courseId } });

/**
 * Assign roadmap items
 * POST /api/v1/roadmaps/assign
 * Body: { classId, courseId, sessionIds: [], lessonIds: [], periodIds: [] }
 */
const assignRoadmap = (data) =>
    api.post(`${BASE_PATH}/assign`, data);

export const roadmapService = {
    getRoadmap,
    deleteRoadmap,
    assignRoadmap
};

export default roadmapService;
