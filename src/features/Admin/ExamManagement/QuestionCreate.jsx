import React, { useState } from "react";
import "./QuestionCreate.css";
import { useNavigate } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal";

export default function QuestionCreate() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [level, setLevel] = useState("Dễ");
  const [type, setType] = useState("Trắc nghiệm");

  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showNotification("Thành công", "✅ Tạo câu hỏi thành công!", "success");
    setTimeout(() => navigate("/admin/quiz/question-bank"), 1500);
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

      </form >
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div >
  );
}
