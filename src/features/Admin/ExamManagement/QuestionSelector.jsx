import React, { useEffect, useMemo, useState } from "react";
import "./QuestionSelector.css";

export default function QuestionSelector({ open, onOpenChange, selectedQuestions = [], onSelectQuestions }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelected, setLocalSelected] = useState([]);

  // Mock data demo (có thể thay bằng API sau)
  const mockQuestions = useMemo(() => (
    [
      { id: 1, title: "Câu hỏi về React Hooks", category: "React", difficulty: "Trung bình" },
      { id: 2, title: "Câu hỏi về TypeScript", category: "TypeScript", difficulty: "Khó" },
      { id: 3, title: "Câu hỏi về CSS Flexbox", category: "CSS", difficulty: "Dễ" },
      { id: 4, title: "Câu hỏi về JavaScript ES6", category: "JavaScript", difficulty: "Trung bình" },
      { id: 5, title: "Câu hỏi về Node.js", category: "Backend", difficulty: "Khó" },
    ]
  ), []);

  useEffect(() => {
    if (open) setLocalSelected(Array.isArray(selectedQuestions) ? selectedQuestions : []);
  }, [open, selectedQuestions]);

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return mockQuestions;
    return mockQuestions.filter((q) => q.title.toLowerCase().includes(s));
  }, [searchTerm, mockQuestions]);

  const toggleQuestion = (id) => {
    setLocalSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case "Dễ":
        return "qs-badge green";
      case "Trung bình":
        return "qs-badge yellow";
      case "Khó":
        return "qs-badge red";
      default:
        return "qs-badge";
    }
  };

  if (!open) return null;

  return (
    <div className="qs-overlay" role="dialog" aria-modal="true">
      <div className="qs-drawer">
        <div className="qs-header">
          <h3 className="qs-title">Chọn câu hỏi từ ngân hàng</h3>
          <p className="qs-desc">Tìm kiếm và chọn các câu hỏi bạn muốn thêm vào bài kiểm tra</p>
        </div>

        <div className="qs-body">
          <div className="qs-search">
            <input
              className="qs-input"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="qs-list">
            {filtered.map((q) => (
              <label key={q.id} className="qs-item">
                <input
                  type="checkbox"
                  checked={localSelected.includes(q.id)}
                  onChange={() => toggleQuestion(q.id)}
                />
                <div className="qs-item-main">
                  <div className="qs-row">
                    <span className="qs-id">ID: {q.id}</span>
                    <span className="qs-title-text">{q.title}</span>
                  </div>
                  <div className="qs-row gap">
                    <span className="qs-badge blue">{q.category}</span>
                    <span className={getDifficultyClass(q.difficulty)}>{q.difficulty}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="qs-summary">Đã chọn: {localSelected.length} câu hỏi</div>
        </div>

        <div className="qs-footer">
          <button className="qs-btn primary" onClick={() => { onSelectQuestions && onSelectQuestions(localSelected); onOpenChange && onOpenChange(false); }}>Xác nhận</button>
          <button className="qs-btn" onClick={() => onOpenChange && onOpenChange(false)}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
