import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JavaExamCard.css";
import { examService } from "@utils/examService.js";

const JavaExamCard = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const user = (() => { try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; } })();
    const userId = Number(user?.id);
    if (!Number.isFinite(userId)) {
      setAttempts([]);
      return;
    }
    setLoading(true);
    Promise.all([
      examService.listAttempts(undefined, userId),
      examService.getExams({ page: 0, size: 100 })
    ])
      .then(([attemptsRes, examsRes]) => {
        const arr = Array.isArray(attemptsRes?.data) ? attemptsRes.data : [];
        const ex = Array.isArray(examsRes?.data) ? examsRes.data : [];
        setAttempts(arr);
        setExams(ex);
      })
      .catch(() => {
        setAttempts([]);
        setExams([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleHistory = () => {
    setShowHistory((v) => !v);
  };

  const history = useMemo(() => {
    const examMap = new Map(exams.map((e) => [String(e.id), e]));
    return attempts.map((a) => {
      const ex = examMap.get(String(a.examId)) || {};
      const maxScore = Number(ex?.maxScore) || 0;
      const score = Number(a?.score) || 0;
      const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const stRaw = a?.startTime || a?.start_time || a?.startedAt || a?.startAt || null;
      const etRaw = a?.endTime || a?.end_time || a?.finishTime || a?.finishedAt || a?.submittedAt || a?.endAt || null;
      let durationSec = 0;
      try {
        const st = stRaw ? new Date(stRaw).getTime() : 0;
        const et = etRaw ? new Date(etRaw).getTime() : 0;
        if (st && et && et >= st) durationSec = Math.round((et - st) / 1000);
      } catch { void 0; }
      return {
        id: a?.id,
        date: etRaw || stRaw || null,
        percent,
        score,
        maxScore,
        durationSec,
      };
    });
  }, [attempts, exams]);
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
          👥 Tổng lượt đã làm: <strong>{history.length} lượt</strong>
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
            <span className="history-count">{history.length} lượt</span>
          </div>

          {loading ? (
            <div className="history-empty">Đang tải lịch sử...</div>
          ) : history.length === 0 ? (
            <div className="history-empty">Chưa có lịch sử làm bài</div>
          ) : (
            <div className="history-items">
              {history.map((a) => {
                const dateStr = a.date ? new Date(a.date).toLocaleString("vi-VN") : "—";
                const pass = a.percent >= 60;
                return (
                  <div className="history-card" key={a.id}>
                    <div className="history-top">
                      <div className={`history-percent ${pass ? "success" : "danger"}`}>{a.percent}%</div>
                      <div className="history-score">{a.score}{a.maxScore ? `/${a.maxScore}` : ""}</div>
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
