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
};
