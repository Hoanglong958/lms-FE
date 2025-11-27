import api from "@services/api";

export const lessonVideoService = {
  // Lấy danh sách video theo bài học (dùng query)
  // GET /api/v1/lesson-videos?lessonId=xxx
  getVideosByLesson(lessonId) {
    return api.get(`/api/v1/lesson-videos`, {
      params: { lessonId },
    });
  },

  // Tạo video
  // POST /api/v1/lesson-videos
  addVideo(data) {
    return api.post(`/api/v1/lesson-videos`, data);
  },

  // Cập nhật video
  // PUT /api/v1/lesson-videos/{id}
  updateVideo(id, data) {
    return api.put(`/api/v1/lesson-videos/${id}`, data);
  },

  // Xóa video
  // DELETE /api/v1/lesson-videos/{id}
  deleteVideo(id) {
    return api.delete(`/api/v1/lesson-videos/${id}`);
  },

  // Lấy chi tiết video
  // GET /api/v1/lesson-videos/detail?id=xxx
  getVideoDetail(id) {
    return api.get(`/api/v1/lesson-videos/detail`, {
      params: { id },
    });
  },
};
