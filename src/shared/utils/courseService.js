import api from "@services/api";

export const courseService = {
  // GET /api/v1/courses
  getCourses() {
    return api.get("/api/v1/courses");
  },

  // GET /api/v1/courses/paging
  getCoursesPaging(params) {
    // params có thể là { page: 1, size: 10, sort: 'name,asc' } tùy swagger
    return api.get("/api/v1/courses/paging", { params });
  },

  // GET /api/v1/courses/detail
  getCourseDetail(id) {
    return api.get(`/api/v1/courses/detail`, { params: { id } });
  },

  // POST /api/v1/courses
  addCourse(data) {
    return api.post("/api/v1/courses", data);
  },

  // PUT /api/v1/courses/{id}
  updateCourse(id, data) {
    return api.put(`/api/v1/courses/${id}`, data);
  },

  // DELETE /api/v1/courses/{id}
  deleteCourse(id) {
    return api.delete(`/api/v1/courses/${id}`);
  },

  // PATCH /api/v1/courses/{id}/toggle-active
  toggleCourseActive(id) {
    return api.patch(`/api/v1/courses/${id}/toggle-active`);
  },
};
