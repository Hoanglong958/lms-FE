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
  const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";
  const isTeacher = String(user?.role || "").toUpperCase() === "ROLE_TEACHER";
  const canManage = isAdmin || isTeacher;

  const handleOptionChange = (value, index) => {
    const newOps = [...options];
    newOps[index] = value;
    setOptions(newOps);
    if (correctAnswer && !newOps.includes(correctAnswer)) {
      const first = newOps.find((x) => x && x.trim());
      setCorrectAnswer(first || "");
    }
  };

  const addOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (idx) => {
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (correctAnswer && !next.includes(correctAnswer)) {
        const first = next.find((x) => x && x.trim());
        setCorrectAnswer(first || "");
      }
      return next.length > 0 ? next : [""];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) return alert("Chỉ ADMIN hoặc GIẢNG VIÊN được phép tạo mới câu hỏi");
    if (!questionText.trim()) return;
    if (!category.trim()) {
      alert("Danh mục không được để trống");
      return;
    }
    const cleaned = type === "Trắc nghiệm" ? options.filter((x) => x && x.trim()) : [];
    if (type === "Trắc nghiệm" && cleaned.length < 2) {
      alert("Cần ít nhất 2 lựa chọn đáp án");
      return;
    }
    let answer = correctAnswer?.trim();
    if (type === "Trắc nghiệm") {
      if (!answer || !cleaned.includes(answer)) {
        answer = cleaned[0] || "";
      }
    }
    const payload = {
      category: category || "",
      questionText: questionText,
      explanation: explanation || "",
      type: type === "Trắc nghiệm" ? "MULTIPLE_CHOICE" : "ESSAY",
      options: type === "Trắc nghiệm" ? cleaned : null,
      correctAnswer: type === "Trắc nghiệm" ? answer : null,
    };
    try {
      setSubmitting(true);
      await questionService.create(payload);
      navigate(`/${isAdmin ? "admin" : "teacher"}/question-bank`);
    } catch (err) {
      setSubmitting(false);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Tạo câu hỏi thất bại";
      alert(msg);
    }
  };

  return (
    <div className="qb-create-container">
      <div className="qb-card">
        <h2 className="qb-title">Tạo câu hỏi mới</h2>
        <p className="qb-sub">Nhập thông tin chi tiết cho câu hỏi</p>

        {!canManage && (
          <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>
            Chỉ ADMIN hoặc GIẢNG VIÊN được phép tạo mới câu hỏi
          </div>
        )}

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
              <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  className="qb-input"
                  placeholder={`Đáp án ${index + 1}`}
                  value={op}
                  onChange={(e) => handleOptionChange(e.target.value, index)}
                />
                <button type="button" className="qb-btn small" onClick={() => removeOption(index)}>
                  −
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button type="button" className="qb-btn submit" onClick={addOption}>
                Thêm đáp án
              </button>
            </div>
            <label className="qb-label">Đáp án đúng *</label>
            <select
              className="qb-input"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
            >
              <option value="">-- Chọn đáp án đúng --</option>
              {options
                .filter((x) => x && x.trim())
                .map((op, i) => (
                  <option key={i} value={op}>{op}</option>
                ))}
            </select>
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
          <button className="qb-btn cancel" onClick={() => navigate(`/${isAdmin ? "admin" : "teacher"}/question-bank`)}>Hủy</button>
          <button className="qb-btn submit" disabled={!canManage || submitting} onClick={handleSubmit}>
            {submitting ? "Đang lưu..." : "Lưu câu hỏi"}
          </button>
        </div>
      </div>
    </div>
  );
}
