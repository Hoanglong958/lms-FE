import React, { useState } from "react";
import "./QuestionCreate.css";
import { useNavigate } from "react-router-dom";

export default function QuestionCreate() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState("Dễ");
  const [type, setType] = useState("Trắc nghiệm");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) {
      alert("⚠️ Vui lòng nhập nội dung câu hỏi!");
      return;
    }

    alert("✅ Tạo câu hỏi thành công!");
    navigate("/admin/question");
  };

  return (
    <div className="question-create-container">
      <div className="question-create-header">
        <h2>➕ Tạo câu hỏi mới</h2>
        <p>Nhập nội dung và cấu hình cho câu hỏi</p>
      </div>

      <form onSubmit={handleSubmit} className="question-form">
        <div className="form-group">
          <label>Nội dung câu hỏi *</label>
          <textarea
            rows="3"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Nhập nội dung câu hỏi..."
          />
        </div>

        <div className="form-group">
          <label>Mức độ</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="Dễ">Dễ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Khó">Khó</option>
          </select>
        </div>

        <div className="form-group">
          <label>Loại câu hỏi</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Trắc nghiệm">Trắc nghiệm</option>
            <option value="Tự luận">Tự luận</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/question")}
          >
            ← Quay lại
          </button>
          <button type="submit" className="btn-save">
            💾 Lưu câu hỏi
          </button>
        </div>
      </form>
    </div>
  );
}
