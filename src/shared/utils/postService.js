import api from "@services/api";

export const postService = {
    // GET /api/v1/posts
    // params: { page, size, sort, ... }
    async getPosts(params) {
        const baseParams = params || { page: 0, size: 100 };
        const p1 = { page: baseParams.page, size: baseParams.size };
        const p2 = { pageNumber: baseParams.page, pageSize: baseParams.size };
        try {
            return await api.get("/api/v1/posts/page", { params: p1 });
        } catch {
            try {
                return await api.get("/api/v1/posts/page", { params: p2 });
            } catch {
                try {
                    return await api.get("/api/v1/posts", { params: baseParams });
                } catch {
                    return await api.get("/api/v1/posts");
                }
            }
        }
    },

    // GET /api/v1/posts/{id}
    getPostById(id) {
        return api.get(`/api/v1/posts/${id}`);
    },

    // POST /api/v1/posts
    // payload: { title, slug, content, authorId, tagNames, status }
    createPost(payload) {
        return api.post("/api/v1/posts", payload);
    },

    // PUT /api/v1/posts/{id}
    updatePost(id, payload) {
        return api.put(`/api/v1/posts/${id}`, payload);
    },

    // DELETE /api/v1/posts/{id}
    deletePost(id) {
        return api.delete(`/api/v1/posts/${id}`);
    },
};
