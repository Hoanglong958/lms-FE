import React, { useState, useEffect } from "react";
import { lessonQuizService } from "@utils/lessonQuizService.js";

export default function LessonQuizEditor({ quiz, onUpdated }) {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    title: "",
    questionCount: 0,
    maxScore: 0,
    passingScore: 0,
  });

  // Khi quiz prop thay đổi → reset form
  useEffect(() => {
    if (!quiz) return;

    setForm({
      title: quiz.title || "",
      questionCount: quiz.questionCount || 0,
      maxScore: quiz.maxScore || 0,
      passingScore: quiz.passingScore || 0,
    });

    setEditing(false);
  }, [quiz]);

  const handleSave = async () => {
    if (!form.title) {
      alert("Tiêu đề quiz không được để trống");
      return;
    }

    const payload = {
      lessonId: quiz.lessonId,
      title: form.title,
      questionCount: Number(form.questionCount),
      maxScore: Number(form.maxScore),
      passingScore: Number(form.passingScore),
    };

    const res = await lessonQuizService.updateQuiz(quiz.quizId, payload);

    onUpdated(res.data);
    setEditing(false);
  };

  // ============================
  //   VIEW MODE
  // ============================
  if (!editing) {
    return (
      <div>
        <h3>{quiz.title}</h3>

        <p>
          <b>Số câu hỏi:</b> {quiz.questionCount}
        </p>
        <p>
          <b>Điểm tối đa:</b> {quiz.maxScore}
        </p>
        <p>
          <b>Điểm đạt:</b> {quiz.passingScore}
        </p>

        <button onClick={() => setEditing(true)}>Sửa</button>
      </div>
    );
  }

  // ============================
  //   EDIT MODE
  // ============================
  return (
    <div>
      <h3>Sửa Quiz</h3>

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

      <button onClick={handleSave}>Lưu</button>
      <button onClick={() => setEditing(false)}>Hủy</button>
    </div>
  );
}
