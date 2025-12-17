import React, { useState } from "react";
import "./QuestionCreate.css";
import { useNavigate } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { questionService } from "@utils/questionService";

export default function QuestionCreate() {
  const navigate = useNavigate();

  // State for form fields based on API payload
  const [formData, setFormData] = useState({
    category: "",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: ""
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Format options array as ["A. Text", "B. Text", ...]
    const options = [
      `A. ${formData.optionA}`,
      `B. ${formData.optionB}`,
      `C. ${formData.optionC}`,
      `D. ${formData.optionD}`
    ];

    const payload = {
      category: formData.category,
      questionText: formData.questionText,
      options: options,
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation
    };

    try {
      await questionService.create(payload);
      showNotification("Thành công", "✅ Tạo câu hỏi thành công!", "success");
      setTimeout(() => navigate("/admin/quiz/question-bank"), 1500);
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
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Ví dụ: OOP, Java, React..."
            required
            className="input-text"
          />
        </label>

        {/* Question Text */}
        <label>
          Nội dung câu hỏi:
          <textarea
            name="questionText"
            value={formData.questionText}
            onChange={handleChange}
            placeholder="Nhập nội dung câu hỏi..."
            required
            rows={3}
          />
        </label>

        {/* Options */}
        <div className="options-group">
          <p className="options-label">Các lựa chọn:</p>

          <div className="option-row">
            <span className="option-prefix">A.</span>
            <input
              type="text"
              name="optionA"
              value={formData.optionA}
              onChange={handleChange}
              placeholder="Nội dung đáp án A"
              required
              className="input-text"
            />
          </div>

          <div className="option-row">
            <span className="option-prefix">B.</span>
            <input
              type="text"
              name="optionB"
              value={formData.optionB}
              onChange={handleChange}
              placeholder="Nội dung đáp án B"
              required
              className="input-text"
            />
          </div>

          <div className="option-row">
            <span className="option-prefix">C.</span>
            <input
              type="text"
              name="optionC"
              value={formData.optionC}
              onChange={handleChange}
              placeholder="Nội dung đáp án C"
              required
              className="input-text"
            />
          </div>

          <div className="option-row">
            <span className="option-prefix">D.</span>
            <input
              type="text"
              name="optionD"
              value={formData.optionD}
              onChange={handleChange}
              placeholder="Nội dung đáp án D"
              required
              className="input-text"
            />
          </div>
        </div>

        {/* Correct Answer */}
        <label>
          Đáp án đúng:
          <select
            name="correctAnswer"
            value={formData.correctAnswer}
            onChange={handleChange}
            className="select-input"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </label>

        {/* Explanation */}
        <label>
          Giải thích (Explanation):
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            placeholder="Giải thích vì sao đáp án đó đúng..."
            rows={3}
          />
        </label>

        <div className="form-buttons">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/quiz/question-bank")}
          >
            ⬅ Quay lại
          </button>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Đang lưu..." : "💾 Lưu câu hỏi"}
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
