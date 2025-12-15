import api from "@services/api";

const USER_BASE_PATH = "/api/v1/users";

export const userService = {
  
  // GET /api/v1/users
  getAllUsers(params = {}) {
    return api.get(USER_BASE_PATH, { params });
  },

  // POST /api/v1/users
  createUser(payload) {
    return api.post(USER_BASE_PATH, payload);
  },

  // PUT /api/v1/users/{id}
  updateUser(id, payload) {
    return api.put(`${USER_BASE_PATH}/${id}`, payload);
  },

  // DELETE /api/v1/users/{id}
  deleteUser(id) {
    return api.delete(`${USER_BASE_PATH}/${id}`);
  },

  // PATCH /api/v1/users/{id}/status
  toggleStatus(id, active) {
    // Try sending in body if query param fails or is not preferred 
    // AND keep query param if uncertain, but usually one is enough. 
    // Let's try body first as it is more standard for PATCH.
    return api.patch(`${USER_BASE_PATH}/${id}/status`, { active });
  },
  
};


export default userService;
