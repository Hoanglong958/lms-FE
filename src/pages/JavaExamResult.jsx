import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./JavaExamResult.css";

export default function JavaExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    let id = location.state && location.state.id;
    try {
      const raw = localStorage.getItem("javaExamPracticeHistory") || "[]";
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        const found = id ? arr.find((a) => a.id === id) : arr[0];
        setAttempt(found || null);
      } else {
        setAttempt(null);
      }
    } catch {
      setAttempt(null);
    }
  }, [location.state]);

  useEffect(() => {
    const t = setTimeout(() => navigate("/java-exam"), 5000);
    return () => clearTimeout(t);
  }, [navigate]);

  if (!attempt) {
    return (
      <div className="jexr-container">
        <h2 className="jexr-title">Kết quả thi thử</h2>
        <div className="jexr-card">
          <p className="jexr-desc">Không tìm thấy kết quả. Đang quay về trang thi thử...</p>
          <div className="jexr-actions">
            <button className="jexr-btn" onClick={() => navigate("/java-exam")}>Quay về ngay</button>
          </div>
        </div>
      </div>
    );
  }

  const dateStr = new Date(attempt.date).toLocaleString("vi-VN");

  const pass = attempt.percent >= 60;

  return (
    <div className="jexr-container">
      <h2 className="jexr-title">Kết quả thi thử Java Spring Boot</h2>

      <div className="jexr-card">
        <div className="jexr-header">
          <div className={`jexr-badge ${pass ? "success" : "danger"}`}>{attempt.percent}%</div>
          <div className="jexr-summary">
            <div className="jexr-score">
              <span className="jexr-score-label">Điểm</span>
              <span className="jexr-score-value">{attempt.correct}/{attempt.total}</span>
            </div>
            <div className="jexr-date">
              <span className="jexr-date-label">Thời gian nộp</span>
              <span className="jexr-date-value">{dateStr}</span>
            </div>
          </div>
        </div>

        <div className="jexr-progress">
          <div className="jexr-progress-bar" style={{ width: `${attempt.percent}%` }} />
        </div>

        <div className="jexr-stats">
          <div className="jexr-stat">
            <span className="jexr-stat-label">Tổng câu hỏi</span>
            <span className="jexr-stat-value">{attempt.total}</span>
          </div>
          <div className="jexr-stat">
            <span className="jexr-stat-label">Trả lời đúng</span>
            <span className="jexr-stat-value">{attempt.correct}</span>
          </div>
          <div className="jexr-stat">
            <span className="jexr-stat-label">Thời gian làm</span>
            <span className="jexr-stat-value">{Math.floor(attempt.durationSec / 60)}p {attempt.durationSec % 60}s</span>
          </div>
        </div>

        <div className="jexr-actions">
          <button className="jexr-btn" onClick={() => navigate("/java-exam")}>Quay về trang thi thử</button>
          <span className="jexr-note">Tự động quay về sau 5 giây</span>
        </div>
      </div>
    </div>
  );
}
