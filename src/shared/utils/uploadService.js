import api from "@services/api";

export const uploadService = {
  // POST /api/v1/uploads/image
  uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/api/v1/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // POST /api/v1/uploads/video
  uploadVideo(file) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/api/v1/uploads/video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // POST /api/v1/uploads/pdf
  uploadPdf(file) {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/api/v1/uploads/pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
