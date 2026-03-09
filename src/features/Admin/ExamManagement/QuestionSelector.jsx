import React, { useEffect, useMemo, useState } from "react";
import "./QuestionSelector.css";

import { questionService } from "@utils/questionService.js";

export default function QuestionSelector({ open, onOpenChange, selectedQuestions = [], onSelectQuestions }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelected, setLocalSelected] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);

      questionService
        .getPage({ page: 0, size: 100 })
        .then((res) => {
          const raw = res?.data ?? {};

          const arr = Array.isArray(raw)
            ? raw
            : Array.isArray(raw.data)
              ? raw.data
              : Array.isArray(raw.content)
                ? raw.content
                : Array.isArray(raw.items)
                  ? raw.items
                  : [];

          setQuestions(arr);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setLocalSelected(Array.isArray(selectedQuestions) ? selectedQuestions : []);
    }
  }, [open, selectedQuestions]);

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return questions;

    return questions.filter((q) =>
      String(q.questionText || q.title || "").toLowerCase().includes(s) ||
      String(q.id).includes(s)
    );
  }, [searchTerm, questions]);

  const toggleQuestion = (id) => {
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
          <p className="qs-desc">
            Tìm kiếm và chọn các câu hỏi bạn muốn thêm vào bài kiểm tra
          </p>
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
            {loading ? (
              <div className="qs-loading">Đang tải câu hỏi...</div>
            ) : filtered.length === 0 ? (
              <div className="qs-empty">Không tìm thấy câu hỏi</div>
            ) : (
              filtered.map((q) => (
                <label key={q.id} className="qs-item">
                  <input
                    type="checkbox"
                    checked={localSelected.includes(q.id)}
                    onChange={() => toggleQuestion(q.id)}
                  />

                  <div className="qs-item-main">
                    <div className="qs-row">
                      <span className="qs-id">ID: {q.id}</span>

                      <span
                        className="qs-title-text"
                        style={{
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {q.questionText || q.title || "Câu hỏi không có nội dung"}
                      </span>
                    </div>

                    <div className="qs-row gap">
                      {q.category && (
                        <span className="qs-badge blue">{q.category}</span>
                      )}

                      {q.difficulty && (
                        <span className={getDifficultyClass(q.difficulty)}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          <div className="qs-summary">
            Đã chọn: {localSelected.length} câu hỏi
          </div>
        </div>

        <div className="qs-footer">
          <button
            className="qs-btn primary"
            onClick={() => {
              onSelectQuestions && onSelectQuestions(localSelected);
              onOpenChange && onOpenChange(false);
            }}
          >
            Xác nhận
          </button>

          <button
            className="qs-btn"
            onClick={() => onOpenChange && onOpenChange(false)}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}