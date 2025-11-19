import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizCreate.css";
import { quizService } from "@utils/quizService.js";

export default function QuizCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    lessonId: "",
    title: "",
    questionCount: "",
    maxScore: "",
    passingScore: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["lessonId", "questionCount", "maxScore", "passingScore"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lessonId || !formData.title) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    try {
      console.log("Create quiz payload:", formData);
      await quizService.addQuiz(formData);
      alert("✅ Tạo bài quiz thành công!");
      navigate("/admin/quiz");
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("❌ Create quiz error:", err);
      alert(`❌ Tạo quiz thất bại! Status: ${status ?? "N/A"} Message: ${
        typeof data === "string" ? data : JSON.stringify(data)
      }`);
    }
  };

  return (
    <div className="exam-create-container">
      <div className="exam-create-header">
        <h2>Tạo bài quiz mới</h2>
        <p>Nhập thông tin chi tiết cho bài quiz</p>
      </div>

      <form onSubmit={handleSubmit} className="exam-create-form">
        <div className="form-group">
          <label>Lesson ID *</label>
          <input
            type="number"
            name="lessonId"
            placeholder="VD: 123"
            value={formData.lessonId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Tiêu đề *</label>
          <input
            type="text"
            name="title"
            placeholder="VD: Quiz React cơ bản"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Số câu hỏi</label>
            <input
              type="number"
              name="questionCount"
              placeholder="VD: 30"
              value={formData.questionCount}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Điểm tối đa</label>
            <input
              type="number"
              name="maxScore"
              placeholder="VD: 100"
              value={formData.maxScore}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Điểm đạt</label>
            <input
              type="number"
              name="passingScore"
              placeholder="VD: 50"
              value={formData.passingScore}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/quiz")}
          >
            ← Hủy
          </button>
          <button type="submit" className="btn-save">
            💾 Lưu bài quiz
          </button>
        </div>
      </form>
    </div>
  );
}
