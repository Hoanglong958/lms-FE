import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizCreate.css";

export default function QuizCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    course: "",
    date: "",
    duration: "",
    passScore: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.course) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // ✅ Lưu vào localStorage (giả lập backend)
    const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
    quizzes.push({
      id: quizzes.length + 1,
      ...formData,
      status: "Đang mở",
    });
    localStorage.setItem("quizzes", JSON.stringify(quizzes));

    alert("✅ Tạo bài quiz thành công!");
    navigate("/admin/quiz");
  };

  return (
    <div className="exam-create-container">
      <div className="exam-create-header">
        <h2>Tạo bài quiz mới</h2>
        <p>Nhập thông tin chi tiết cho bài quiz</p>
      </div>

      <form onSubmit={handleSubmit} className="exam-create-form">
        <div className="form-group">
          <label>Tên bài quiz *</label>
          <input
            type="text"
            name="name"
            placeholder="VD: Quiz React cơ bản"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            name="description"
            placeholder="Nhập mô tả ngắn cho bài quiz..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Khóa học *</label>
          <input
            type="text"
            name="course"
            placeholder="VD: React Advanced"
            value={formData.course}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ngày mở *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Thời gian (phút)</label>
            <input
              type="number"
              name="duration"
              placeholder="VD: 30"
              value={formData.duration}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Điểm đậu (%)</label>
            <input
              type="number"
              name="passScore"
              placeholder="VD: 50"
              value={formData.passScore}
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
