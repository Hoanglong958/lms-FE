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

  // PUT /api/v1/auth/change-password
  changePassword(payload) {
    return api.put("/api/v1/auth/change-password", payload);
  },

  // POST /api/v1/auth/forgot-password
  forgotPassword(payload) {
    return api.post("/api/v1/auth/forgot-password", payload);
  },

  // POST /api/v1/auth/reset-password
  resetPassword(payload) {
    return api.post("/api/v1/auth/reset-password", payload);
  },
};
