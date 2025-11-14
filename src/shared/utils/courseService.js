import api from "@services/api";

export const courseService = {
  // GET /api/v1/courses
  getCourses() {
    return api.get("/api/v1/courses");
  },

  // GET /api/v1/courses/{id}
  getCourse(id) {
    return api.get(`/api/v1/courses/${id}`);
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
};
