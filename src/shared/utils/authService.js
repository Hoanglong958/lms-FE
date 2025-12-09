// src/services/authService.js
import api from "@services/api";

export const authService = {
  // POST /api/v1/auth/login
  login(payload) {
    return api.post("/api/v1/auth/login", payload);
  },

  // POST /api/v1/auth/register
  register(payload) {
    return api.post("/api/v1/auth/register", payload);
  },

  // POST /api/v1/users/change-password (Assuming this endpoint based on common practices)
  // or /api/v1/auth/change-password
  changePassword(payload) {
    return api.post("/api/v1/auth/change-password", payload);
  },
};
