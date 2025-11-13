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
    alert("✅ Tạo câu hỏi thành công!");
    navigate("/admin/quiz/question-bank");
  };

  return (
    <div className="question-create-container">
      <h2>📝 Tạo câu hỏi mới</h2>

      <form className="question-form" onSubmit={handleSubmit}>
        <label>
          Nội dung câu hỏi:
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </label>

        <label>
          Mức độ:
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="Dễ">Dễ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Khó">Khó</option>
          </select>
        </label>

        <label>
          Loại câu hỏi:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Trắc nghiệm">Trắc nghiệm</option>
            <option value="Tự luận">Tự luận</option>
          </select>
        </label>

        <div className="form-buttons">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/quiz/question-bank")}
          >
            ⬅ Quay lại
          </button>

          <button type="submit" className="btn-primary">
            💾 Lưu câu hỏi
          </button>
        </div>
      </form>
    </div>
  );
}
