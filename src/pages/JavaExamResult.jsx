import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./JavaExamResult.css";
import { examService } from "@utils/examService.js";

export default function JavaExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [serverAttempt, setServerAttempt] = useState(null);

  useEffect(() => {
    const localId = location.state && (location.state.localId || location.state.id);
    const attemptId = location.state && location.state.attemptId;
    let cancelled = false;
    const loadLocal = () => {
      try {
        const raw = localStorage.getItem("javaExamPracticeHistory") || "[]";
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          const found = localId ? arr.find((a) => a.id === localId) : arr[0];
          if (!cancelled) setAttempt(found || null);
        } else {
          if (!cancelled) setAttempt(null);
        }
      } catch {
        if (!cancelled) setAttempt(null);
      }
    };
    const loadServer = async () => {
      if (!Number.isFinite(Number(attemptId))) return;
      try {
        const res = await examService.attemptDetail(Number(attemptId));
        const data = res?.data || {};
        if (!cancelled) setServerAttempt(data || null);
      } catch {
        if (!cancelled) setServerAttempt(null);
      }
    };
    loadLocal();
    loadServer();
    return () => { cancelled = true; };
  }, [location.state]);

  // Bỏ tự động quay về, chỉ cho phép người dùng bấm nút quay lại

  const finalDate = (() => {
    if (serverAttempt?.submittedAt || serverAttempt?.endTime) {
      const d = serverAttempt.submittedAt || serverAttempt.endTime;
      try { return new Date(d).toLocaleString("vi-VN"); } catch { return String(d || ""); }
    }
    if (attempt?.date) {
      try { return new Date(attempt.date).toLocaleString("vi-VN"); } catch { return String(attempt.date || ""); }
    }
    return "";
  })();

  const totalQ = (() => {
    if (Number.isFinite(Number(serverAttempt?.totalQuestions))) return Number(serverAttempt.totalQuestions);
    if (Number.isFinite(Number(serverAttempt?.total))) return Number(serverAttempt.total);
    return Number(attempt?.total) || 0;
  })();

  const correctQ = (() => {
    if (Number.isFinite(Number(serverAttempt?.correctCount))) return Number(serverAttempt.correctCount);
    if (Array.isArray(serverAttempt?.answers)) {
      const arr = serverAttempt.answers;
      return arr.filter((a) => !!a?.isCorrect || Number(a?.scoreAwarded) > 0).length;
    }
    return Number(attempt?.correct) || 0;
  })();

  const percent = (() => {
    if (Number.isFinite(Number(serverAttempt?.percent))) return Number(serverAttempt.percent);
    const t = totalQ || 0;
    const c = correctQ || 0;
    return t > 0 ? Math.round((c / t) * 100) : 0;
  })();

  const durationSec = (() => {
    if (Number.isFinite(Number(serverAttempt?.durationSec))) return Number(serverAttempt.durationSec);
    if (serverAttempt?.startTime && (serverAttempt?.endTime || serverAttempt?.submittedAt)) {
      try {
        const st = new Date(serverAttempt.startTime).getTime();
        const et = new Date(serverAttempt.endTime || serverAttempt.submittedAt).getTime();
        if (st && et && et >= st) return Math.round((et - st) / 1000);
      } catch { void 0; }
    }
    return Number(attempt?.durationSec) || 0;
  })();

  if (!attempt && !serverAttempt) {
    return (
      <div className="jexr-container">
        <h2 className="jexr-title">Kết quả thi</h2>
        <div className="jexr-card">
        <p className="jexr-desc">Không tìm thấy kết quả. Đang quay về trang thi thử...</p>
          <div className="jexr-actions">
            <button className="jexr-btn" onClick={() => navigate("/exam")}>Quay về danh sách bài thi</button>
          </div>
        </div>
      </div>
    );
  }

  const dateStr = finalDate;

  const pass = percent >= 60;

  return (
    <div className="jexr-container">
      <h2 className="jexr-title">Kết quả thi Java Spring Boot</h2>

      <div className="jexr-card">
        <div className="jexr-header">
          <div className={`jexr-badge ${pass ? "success" : "danger"}`}>{percent}%</div>
          <div className="jexr-summary">
            <div className="jexr-score">
              <span className="jexr-score-label">Điểm</span>
              <span className="jexr-score-value">{correctQ}/{totalQ}</span>
            </div>
            <div className="jexr-date">
              <span className="jexr-date-label">Thời gian nộp</span>
              <span className="jexr-date-value">{dateStr}</span>
            </div>
          </div>
        </div>

        <div className="jexr-progress">
          <div className="jexr-progress-bar" style={{ width: `${percent}%` }} />
        </div>

        <div className="jexr-stats">
          <div className="jexr-stat">
            <span className="jexr-stat-label">Tổng câu hỏi</span>
            <span className="jexr-stat-value">{totalQ}</span>
          </div>
          <div className="jexr-stat">
            <span className="jexr-stat-label">Trả lời đúng</span>
            <span className="jexr-stat-value">{correctQ}</span>
          </div>
          <div className="jexr-stat">
            <span className="jexr-stat-label">Thời gian làm</span>
            <span className="jexr-stat-value">{Math.floor(durationSec / 60)}p {durationSec % 60}s</span>
          </div>
        </div>

        <div className="jexr-actions">
          <button className="jexr-btn" onClick={() => navigate("/exam")}>Quay về danh sách bài thi</button>
        </div>
      </div>

      
    </div>
  );
}
