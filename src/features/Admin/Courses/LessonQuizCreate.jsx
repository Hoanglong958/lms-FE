import React, { useState } from "react";
import { lessonQuizService } from "@utils/lessonQuizService.js";

// IMPORT CSS RIÊNG CHO TRANG NÀY
import "./CoursesCSS/LessonQuizCreate.css";

export default function LessonQuizCreate({ lesson, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    questionCount: 0,
    maxScore: 10,
    passingScore: 0,
  });

  const handleCreate = async () => {
    if (!form.title || !form.passingScore) {
      alert("Không được để trống trường nào!");
      return;
    }

    if (form.passingScore < 5 || form.passingScore > 10) {
      alert("Điểm đạt phải từ 5 đến 10");
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
      alert("Không thể tạo quiz");
    }
  };

  const fields = [
    { key: "title", label: "Tiêu đề", type: "text" },
    // questionCount removed, default 0
    // maxScore is hidden/default 10
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
    </div>
  );
}
