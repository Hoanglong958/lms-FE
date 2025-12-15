import axios from "axios";

const resolveBaseURL = () => {
  const raw = import.meta?.env?.VITE_API_URL;
  let base = raw || "http://localhost:3900";
  try {
    const u = new URL(base);
    if (["5173", "5174", "5175"].includes(u.port)) {
      base = "http://localhost:3900";
    }
  } catch (e) { void e; }
  return base;
};

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 100000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const isAuthPath = /\/auth\/(login|register)/.test(config.url || "");
    if (token && !isAuthPath) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("accessToken");
      localStorage.removeItem("loggedInUser");

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
