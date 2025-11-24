import React, { useState } from "react";
import { lessonQuizService } from "@utils/lessonQuizService.js";

// IMPORT CSS RIÊNG CHO TRANG NÀY
import "./CoursesCSS/LessonQuizCreate.css";

export default function LessonQuizCreate({ lesson, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    questionCount: 0,
    maxScore: 0,
    passingScore: 0,
  });

  const handleCreate = async () => {
    if (!form.title) {
      alert("Tiêu đề quiz không được để trống");
      return;
    }

    const payload = {
      lessonId: lesson.id,
      title: form.title,
      questionCount: Number(form.questionCount),
      maxScore: Number(form.maxScore),
      passingScore: Number(form.passingScore),
    };

    try {
      const res = await lessonQuizService.addQuiz(payload);
      onCreated(res.data);
    } catch (err) {
      console.error(err);
      alert("Không thể tạo quiz");
    }
  };

  const fields = [
    { key: "title", label: "Tiêu đề", type: "text" },
    { key: "questionCount", label: "Số câu hỏi", type: "number" },
    { key: "maxScore", label: "Điểm tối đa", type: "number" },
    { key: "passingScore", label: "Điểm đạt", type: "number" },
  ];

  return (
    <div className="lqc-wrapper">
      <h3 className="lqc-title">Thêm Quiz Mới</h3>

      {fields.map((f) => (
        <div key={f.key} className="lqc-form-row">
          <label className="lqc-label">{f.label}:</label>
          <input
            type={f.type}
            className="lqc-input"
            value={form[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
          />
        </div>
      ))}

      <button className="lqc-btn" onClick={handleCreate}>
        Tạo Quiz
      </button>
    </div>
  );
}
