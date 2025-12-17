import React, { useState } from "react";
import "./QuestionBankCreate.css";
import { useNavigate } from "react-router-dom";
import { questionService } from "@utils/questionService.js";

export default function QuestionBankCreate() {
  const navigate = useNavigate();
  const [type, setType] = useState("Trắc nghiệm");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [questionText, setQuestionText] = useState("");
  const [category, setCategory] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const user = (() => { try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; } })();
  const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";

  const handleOptionChange = (value, index) => {
    const newOps = [...options];
    newOps[index] = value;
    setOptions(newOps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert("Chỉ ADMIN được phép tạo mới câu hỏi");
    if (!questionText.trim()) return;
    const payload = {
      category: category || "",
      questionText: questionText,
      options: type === "Trắc nghiệm" ? options.filter((x) => x && x.trim()) : [],
      correctAnswer: type === "Trắc nghiệm" ? (correctAnswer || "").trim() : "",
      explanation: explanation || "",
    };
    try {
      setSubmitting(true);
      await questionService.create(payload);
      navigate("/admin/question-bank");
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="qb-create-container">
      <h2 className="qb-title">Tạo câu hỏi mới</h2>
      <p className="qb-sub">Nhập thông tin chi tiết cho câu hỏi</p>

      {!isAdmin && (
        <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>
          Chỉ ADMIN được phép tạo mới câu hỏi
        </div>
      )}

      <div className="qb-card">

        {/* Câu hỏi */}
        <label className="qb-label">Câu hỏi *</label>
        <input
          type="text"
          className="qb-input"
          placeholder="Nhập nội dung câu hỏi..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />

        {/* Danh mục */}
        <label className="qb-label">Danh mục *</label>
        <input
          type="text"
          className="qb-input"
          placeholder="VD: React Advanced"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        {/* Loại */}

        <label className="qb-label">Loại câu hỏi *</label>
        <select
          className="qb-input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Trắc nghiệm">Trắc nghiệm</option>
          <option value="Tự luận">Tự luận</option>
        </select>

        {/* Đáp án nếu là trắc nghiệm */}
        {type === "Trắc nghiệm" && (
          <>
            <label className="qb-label">Các lựa chọn *</label>

            {options.map((op, index) => (
              <input
                key={index}
                type="text"
                className="qb-input"
                placeholder={`Đáp án ${index + 1}`}
                value={op}
                onChange={(e) => handleOptionChange(e.target.value, index)}
              />
            ))}

            <label className="qb-label">Đáp án đúng *</label>
            <input
              type="text"
              className="qb-input"
              placeholder="Nhập đáp án đúng"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
            />
          </>
        )}

        {/* Giải thích */}
        <label className="qb-label">Giải thích</label>
        <textarea
          className="qb-textarea"
          placeholder="Nhập giải thích đáp án..."
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />

        {/* Buttons */}
        <div className="qb-actions">
          <button className="qb-btn cancel" onClick={() => navigate("/admin/question-bank")}>Hủy</button>
          <button className="qb-btn submit" disabled={!isAdmin || submitting} onClick={handleSubmit}>{submitting ? "Đang lưu..." : "Lưu câu hỏi"}</button>
        </div>
      </div>
    </div>
  );
}
