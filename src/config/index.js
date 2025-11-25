import axios from "axios";

// Cấu hình Axios instance
const API_BASE_URL = "http://localhost:3999/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor để xử lý request (thêm token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý lỗi unauthorized (tuỳ chọn: logout user)
      console.error("Unauthorized - redirecting to login");
    }
    return Promise.reject(error);
  }
);

export { axiosInstance, API_BASE_URL };
export default axiosInstance;
