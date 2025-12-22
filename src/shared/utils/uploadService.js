import api from "@services/api";

export const uploadService = {
  // POST /api/v1/uploads/image
  uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/api/v1/uploads/image", formData);
  },

  // POST /api/v1/uploads/pdf
  uploadPdf(file) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/api/v1/uploads/pdf", formData);
  },

  // POST /api/v1/uploads/video
  uploadVideo(file) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/api/v1/uploads/video", formData);
  },
};
