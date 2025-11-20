import React, { useState } from "react";
import { lessonQuizService } from "@utils/lessonQuizService.js";

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

    const res = await lessonQuizService.addQuiz(payload);
    onCreated(res.data);
  };

  return (
    <div>
      <h3>Thêm Quiz Mới</h3>

      <div>
        <label>Tiêu đề:</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div>
        <label>Số câu hỏi:</label>
        <input
          type="number"
          value={form.questionCount}
          onChange={(e) => setForm({ ...form, questionCount: e.target.value })}
        />
      </div>

      <div>
        <label>Điểm tối đa:</label>
        <input
          type="number"
          value={form.maxScore}
          onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
        />
      </div>

      <div>
        <label>Điểm đạt:</label>
        <input
          type="number"
          value={form.passingScore}
          onChange={(e) => setForm({ ...form, passingScore: e.target.value })}
        />
      </div>

      <button onClick={handleCreate}>Tạo Quiz</button>
    </div>
  );
}
