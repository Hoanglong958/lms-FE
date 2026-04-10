import React, { useState } from "react";
import "./styles/QuestionCreate.css";
import { useNavigate } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { questionService } from "@utils/questionService";

export default function QuestionCreate() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const changeOption = (value, index) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      if (correctAnswer && !next.includes(correctAnswer)) {
        const first = next.find((x) => x && x.trim());
        setCorrectAnswer(first || "");
      }
      return next;
    });
  };
  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (idx) =>
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (correctAnswer && !next.includes(correctAnswer)) {
        const first = next.find((x) => x && x.trim());
        setCorrectAnswer(first || "");
      }
      return next.length ? next : [""];
    });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleaned = options.filter((x) => x && x.trim());
    if (cleaned.length < 2) {
      showNotification("Thiếu đáp án", "Cần ít nhất 2 lựa chọn", "error");
      setLoading(false);
      return;
    }
    let answer = correctAnswer?.trim();
    if (!answer || !cleaned.includes(answer)) {
      answer = cleaned[0];
    }

    const payload = {
      category,
      questionText,
      options: cleaned,
      correctAnswer: answer,
      explanation
    };

    try {
      await questionService.create(payload);
      showNotification("Thành công", "✅ Tạo câu hỏi thành công!", "success");
      const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";
      setTimeout(() => navigate(`/${isAdmin ? "admin" : "teacher"}/question-bank`), 1500);
    } catch (error) {
      console.error(error);
      showNotification("Lỗi", "Tạo câu hỏi thất bại. Vui lòng thử lại.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="question-create-container">
      <h2>📝 Tạo câu hỏi mới</h2>

      <form className="question-form" onSubmit={handleSubmit}>
        {/* Category */}
        <label>
          Danh mục (Category):
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ví dụ: OOP, Java, React..."
            required
            className="input-text"
          />
        </label>

        {/* Question Text */}
        <label>
          Nội dung câu hỏi:
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Nhập nội dung câu hỏi..."
            required
            rows={3}
          />
        </label>

        {/* Options */}
        <div className="options-group">
          <p className="options-label">Các lựa chọn:</p>
          {options.map((op, idx) => (
            <div className="option-row" key={idx}>
              <input
                type="text"
                value={op}
                onChange={(e) => changeOption(e.target.value, idx)}
                placeholder={`Nội dung đáp án ${idx + 1}`}
                required
                className="input-text"
              />
              <button type="button" className="btn-cancel" onClick={() => removeOption(idx)}>−</button>
            </div>
          ))}
          <div className="form-actions" style={{ justifyContent: "flex-start" }}>
            <button type="button" className="btn-save" onClick={addOption}>Thêm đáp án</button>
          </div>
        </div>

        {/* Correct Answer */}
        <label>
          Đáp án đúng:
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="select-input"
          >
            <option value="">-- Chọn --</option>
            {options
              .filter((x) => x && x.trim())
              .map((op, i) => (
                <option key={i} value={op}>{op}</option>
              ))}
          </select>
        </label>

        {/* Explanation */}
        <label>
          Giải thích (Explanation):
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Giải thích vì sao đáp án đó đúng..."
            rows={3}
          />
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
              const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";
              navigate(`/${isAdmin ? "admin" : "teacher"}/question-bank`);
            }}
          >
            Quay lại
          </button>

          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu câu hỏi"}
          </button>
        </div>

      </form>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
