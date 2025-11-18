import api from "@services/api";

export const lessonVideoService = {
  // Lấy video của bài học
  getVideo(id) {
    return api.get(`/api/v1/lesson-videos/${id}`);
  },

  // Cập nhật video
  updateVideo(id, data) {
    return api.put(`/api/v1/lesson-videos/${id}`, data);
  },

  // Xóa video
  deleteVideo(id) {
    return api.delete(`/api/v1/lesson-videos/${id}`);
  },

  // Tạo video mới
  addVideo(data) {
    return api.post(`/api/v1/lesson-videos`, data);
  },

  // Lấy video theo lesson
  getVideoByLesson(lessonId) {
    return api.get(`/api/v1/lesson-videos/lesson/${lessonId}`);
  },
};
