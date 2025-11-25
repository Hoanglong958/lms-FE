import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
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

export default api;
