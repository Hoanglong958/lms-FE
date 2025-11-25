import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || ""; // dùng proxy Vite khi dev

const api = axios.create({
  baseURL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const isAuthPath = /\/auth\/(login|register)/.test(config.url || "");
    console.log("API baseURL:", baseURL, "URL:", config.url, "attachToken:", !!token && !isAuthPath);
    if (token && !isAuthPath) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
