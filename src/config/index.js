import axios from "axios";

// Cấu hình Axios instance
const SERVER_URL = "http://localhost:3900";
const API_BASE_URL = `${SERVER_URL}/api/v1`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
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
    return Promise.reject(error);
  }
);

export { axiosInstance, API_BASE_URL, SERVER_URL };
export default axiosInstance;
