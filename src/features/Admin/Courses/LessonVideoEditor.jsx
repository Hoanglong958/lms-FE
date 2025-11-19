import React, { useState, useEffect } from "react";
import { lessonVideoService as videoService } from "@utils/lessonVideoService.js";
import styles from "./ManageLessons.module.css";

export default function LessonVideoEditor({ lesson, isAdmin }) {
  const [video, setVideo] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    durationSeconds: 0,
    description: "",
  });

  useEffect(() => {
    loadVideo();
  }, [lesson]);

  async function loadVideo() {
    if (!lesson) return;
    try {
      const res = await videoService.getVideoByLesson(lesson.id);
      const v = res.data[0] || null;
      setVideo(v);
      setFormData({
        title: v?.title || "",
        videoUrl: v?.videoUrl || "",
        durationSeconds: v?.durationSeconds || 0,
        description: v?.description || "",
      });
      setEditing(!v); // Nếu chưa có video → mở form tạo mới
    } catch (err) {
      console.error("Load video lỗi:", err);
    }
  }

  async function saveVideo() {
    if (!lesson) return;

    const payload = {
      lessonId: lesson.id,
      title: formData.title,
      videoUrl: formData.videoUrl,
      durationSeconds: Number(formData.durationSeconds),
      description: formData.description,
    };

    try {
      if (video?.id) {
        await videoService.updateVideo(video.id, payload);
      } else {
        await videoService.addVideo(payload);
      }
      await loadVideo();
      setEditing(false);
    } catch (err) {
      console.error("Lưu video lỗi:", err);
      alert("Có lỗi khi lưu video. Kiểm tra console.");
    }
  }

  if (!isAdmin) {
    return video ? (
      <div className={styles.lessonVideoEditor}>
        <h3>Video</h3>
        <video width="600" controls src={video.videoUrl}></video>
        <p>
          <strong>Tiêu đề:</strong> {video.title}
        </p>
        <p>
          <strong>Thời lượng:</strong> {video.durationSeconds} giây
        </p>
        <p>
          <strong>Mô tả:</strong> {video.description}
        </p>
      </div>
    ) : (
      <p>Bài học này chưa có video.</p>
    );
  }

  return (
    <div className={styles.lessonVideoEditor}>
      <h3>Video</h3>

      {video && !editing && (
        <>
          <video width="600" controls src={video.videoUrl}></video>
          <p>
            <strong>Tiêu đề:</strong> {video.title}
          </p>
          <p>
            <strong>Thời lượng:</strong> {video.durationSeconds} giây
          </p>
          <p>
            <strong>Mô tả:</strong> {video.description}
          </p>
          <button onClick={() => setEditing(true)}>Sửa Video</button>
        </>
      )}

      {editing && (
        <div className={styles.videoForm}>
          <div className={styles.formGroup}>
            <label>Tiêu đề</label>
            <input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>URL Video</label>
            <input
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>Thời lượng (giây)</label>
            <input
              type="number"
              value={formData.durationSeconds}
              onChange={(e) =>
                setFormData({ ...formData, durationSeconds: e.target.value })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className={styles.formActions}>
            <button onClick={saveVideo}>Lưu Video</button>
            <button onClick={() => setEditing(false)}>Hủy</button>
          </div>
        </div>
      )}

      {!video && !editing && (
        <button onClick={() => setEditing(true)}>Thêm Video</button>
      )}
    </div>
  );
}
