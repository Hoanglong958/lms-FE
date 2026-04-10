import React, { useState } from "react";
import { lessonQuizService } from "@utils/lessonQuizService.js";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./styles/LessonDocumentEditor.css";

export default function LessonQuizCreate({ lesson, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    questionCount: 0,
    maxScore: 10,
    passingScore: 0,
  });

  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCreate = async () => {
    if (!form.title || !form.passingScore) {
      showNotification("Lỗi", "Không được để trống trường nào!", "error");
      return;
    }

    if (form.passingScore < 5 || form.passingScore > 10) {
      showNotification("Lỗi", "Điểm đạt phải từ 5 đến 10", "error");
      return;
    }

    const payload = {
      lessonId: lesson.id,
      title: form.title,
      questionCount: 0,
      maxScore: Number(form.maxScore),
      passingScore: Number(form.passingScore),
    };

    try {
      const res = await lessonQuizService.addQuiz(payload);
      onCreated(res.data);
    } catch (err) {
      showNotification("Lỗi", "Không thể tạo quiz", "error");
    }
  };

  return (
    <div className="admin-form-container">
      <h3 className="admin-form-title">
        <span style={{ fontSize: "24px" }}>📝</span> Thêm Quiz Mới
      </h3>

      <div className="admin-form-group">
        <label className="admin-form-label">Tiêu đề</label>
        <input
          type="text"
          className="admin-input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          autoFocus
          placeholder="Nhập tiêu đề Quiz"
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Điểm đạt (5-10)</label>
        <input
          type="number"
          min={5}
          max={10}
          className="admin-input"
          value={form.passingScore}
          onChange={(e) => setForm({ ...form, passingScore: e.target.value })}
          required
        />
      </div>

      <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button className="admin-btn admin-btn-primary" onClick={handleCreate} style={{ width: "100%", justifyContent: "center" }}>
          Tạo Quiz
        </button>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
