import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JavaExamCard.css";

const JavaExamCard = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("javaExamPracticeHistory") || "[]";
      const arr = JSON.parse(raw);
      setAttempts(Array.isArray(arr) ? arr : []);
    } catch {
      setAttempts([]);
    }
  }, []);

  const toggleHistory = () => {
    try {
      const raw = localStorage.getItem("javaExamPracticeHistory") || "[]";
      const arr = JSON.parse(raw);
      setAttempts(Array.isArray(arr) ? arr : []);
    } catch {
      setAttempts([]);
    }
    setShowHistory((v) => !v);
  };
  return (
    <div className="exam-container">
      <h2 className="title">
        ĐỀ THI SỐ 1 – JAVA SPRING BOOT
        <br />
        <span className="subtitle">
          (Bài kiểm tra thử kiến thức Spring Boot dành cho lập trình viên)
        </span>
      </h2>

      <p className="exam-code">
        Mã đề thi: <strong>jsb01</strong>
      </p>

      <ul className="exam-info">
        <li>
          ⏱ Thời gian làm bài: <strong>60 phút</strong>
        </li>
        <li>
          📅 Thời gian vào thi: <strong>Không giới hạn</strong>
        </li>
        <li>
          ❓ Số lượng câu hỏi: <strong>25</strong>
        </li>
        <li>
          📄 Loại đề: <strong>Trắc nghiệm</strong>
        </li>
        <li>
          👥 Tổng lượt đã làm: <strong>{attempts.length} lượt</strong>
        </li>
      </ul>

      <button
        className="start-btn"
        onClick={() => navigate("/java-exam/start")}
      >
        Bắt đầu thi ➜
      </button>
      <button className="history-btn" onClick={toggleHistory}>
        Xem lịch sử làm bài
      </button>

      {showHistory && (
        <div className="history-panel">
          <div className="history-header">
            <h3>Lịch sử làm bài</h3>
            <span className="history-count">{attempts.length} lượt</span>
          </div>

          {attempts.length === 0 ? (
            <div className="history-empty">Chưa có lịch sử làm bài</div>
          ) : (
            <div className="history-items">
              {attempts.map((a) => {
                const dateStr = new Date(a.date).toLocaleString("vi-VN");
                const pass = a.percent >= 60;
                return (
                  <div className="history-card" key={a.id}>
                    <div className="history-top">
                      <div className={`history-percent ${pass ? "success" : "danger"}`}>{a.percent}%</div>
                      <div className="history-score">{a.correct}/{a.total}</div>
                    </div>
                    <div className="history-meta">
                      <div className="history-date">{dateStr}</div>
                      <div className="history-duration">{Math.floor(a.durationSec/60)}p {a.durationSec%60}s</div>
                    </div>
                    <div className="history-progress">
                      <div className="history-progress-bar" style={{ width: `${a.percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JavaExamCard;
