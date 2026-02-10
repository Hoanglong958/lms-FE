import api from "@services/api";

export const postService = {
    // GET /api/v1/posts
    // params: { page, size, sort, ... }
    // GET /api/v1/posts
    // params: { page, size, sort, ... }
    getPosts(params) {
        return api.get("/api/v1/posts", { params });
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

    // GET /api/v1/posts/tags
    getTags() {
        return api.get("/api/v1/posts/tags");
    }
};
