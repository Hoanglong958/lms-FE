import api from "@services/api";

export const commentService = {
    getComments(postId) {
        return api.get(`/api/v1/posts/${postId}/comments`);
    },

    addComment(postId, payload) {
        return api.post(`/api/v1/posts/${postId}/comments`, payload);
    }
};

export default commentService;
