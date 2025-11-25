// shared/utils/userService.js
import axiosInstance from "./../../config";

// API endpoint cho users
const API_ENDPOINT = "/users";

const userService = {
    // 1. GET /users (Danh sách người dùng)
    getAllUsers: (params) => {
        // params: { page, size, keyword, role, isActive }
        return axiosInstance.get(API_ENDPOINT, { params });
    },

    // 2. POST /users (Tạo người dùng)
    createUser: (payload) => {
        // payload: { fullName, gmail, password, role, isActive, phone }
        return axiosInstance.post(API_ENDPOINT, payload);
    },

    // 3. PUT /users/{id} (Cập nhật người dùng)
    updateUser: (id, payload) => {
        // payload: { fullName, role, isActive }
        return axiosInstance.put(`${API_ENDPOINT}/${id}`, payload);
    },

    // 4. DELETE /users/{id} (Xóa người dùng - Soft delete)
    deleteUser: (id) => {
        return axiosInstance.delete(`${API_ENDPOINT}/${id}`);
    },

    // 5. PATCH /users/{id}/status (Thay đổi trạng thái)
    toggleStatus: (id, active) => {
        return axiosInstance.patch(`${API_ENDPOINT}/${id}/status`, null, {
            params: { active }
        });
    }
};

export default userService;