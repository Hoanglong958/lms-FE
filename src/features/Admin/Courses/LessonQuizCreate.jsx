import React, { useState } from "react";
import { lessonQuizService } from "@utils/lessonQuizService.js";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./CoursesCSS/LessonQuizCreate.css";

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

  const fields = [
    { key: "title", label: "Tiêu đề", type: "text" },
    { key: "passingScore", label: "Điểm đạt (5-10)", type: "number", min: 5, max: 10 },
  ];

  return (
    <div className="lqc-wrapper">
      <h3 className="lqc-title">Thêm Quiz Mới</h3>

      {fields.map((f) => (
        <div key={f.key} className="lqc-form-row">
          <label className="lqc-label">{f.label}:</label>
          <input
            type={f.type}
            min={f.min}
            max={f.max}
            className="lqc-input"
            value={form[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            required
            autoFocus={f.key === "title"}
          />
        </div>
      ))}

      <button className="lqc-btn" onClick={handleCreate}>
        Tạo Quiz
      </button>

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
