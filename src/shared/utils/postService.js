import api from "@services/api";

export const postService = {
    /**
     * GET /api/v1/posts
     * Lấy danh sách bài viết đã xuất bản (PUBLISHED)
     * @param {Object} params - { page, size, sort }
     */
    getPosts(params = { page: 0, size: 10, sort: "createdAt,desc" }) {
        return api.get("/api/v1/posts", { params });
    },

    /**
     * GET /api/v1/posts/drafts
     * Lấy danh sách bài viết bản nháp (DRAFT)
     * @param {Object} params - { page, size, sort }
     */
    getDrafts(params = { page: 0, size: 10, sort: "createdAt,desc" }) {
        return api.get("/api/v1/posts/drafts", { params });
    },

    /**
     * GET /api/v1/posts/{id}
     * Lấy chi tiết bài viết
     */
    getPostById(id) {
        return api.get(`/api/v1/posts/${id}`);
    },

    /**
     * POST /api/v1/posts
     * Tạo bài viết mới
     * @param {Object} payload - { title, slug, content, authorId, tagNames, status }
     */
    createPost(payload) {
        return api.post("/api/v1/posts", payload);
    },

    /**
     * PUT /api/v1/posts/{id}
     * Cập nhật bài viết
     */
    updatePost(id, payload) {
        return api.put(`/api/v1/posts/${id}`, payload);
    },

    /**
     * DELETE /api/v1/posts/{id}
     * Xóa bài viết
     */
    deletePost(id) {
        return api.delete(`/api/v1/posts/${id}`);
    },
};
