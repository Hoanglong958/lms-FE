import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./JavaExamResult.css";
import { examService } from "@utils/examService.js";

export default function JavaExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [serverAttempt, setServerAttempt] = useState(null);
  
  const [exam, setExam] = useState(null);
  const [attemptAnswers, setAttemptAnswers] = useState([]);
  const [questionMap, setQuestionMap] = useState({});
  const [verifiedScore, setVerifiedScore] = useState(null);
  const [correctQCount, setCorrectQCount] = useState(null);

  useEffect(() => {
    const attemptId = location.state && location.state.attemptId;
    let cancelled = false;
    const loadServer = async () => {
      if (!Number.isFinite(Number(attemptId))) return;
      try {
        const res = await examService.attemptDetail(Number(attemptId));
        const data = res?.data || {};
        if (cancelled) return;
        setServerAttempt(data || null);

        // Try getting the exam details if available
        if (data?.examId) {
            try {
                const eRes = await examService.getExamById(data.examId);
                if (!cancelled) setExam(eRes?.data || null);
            } catch (err) {}
        }

        // Fetch answers to do local hybrid verify
        try {
            const ansRes = await examService.myAnswersByAttempt(Number(attemptId)).catch(() => examService.answersByAttempt(Number(attemptId)));
            const arr = Array.isArray(ansRes?.data) ? ansRes.data : [];
            if (!cancelled) setAttemptAnswers(arr);

            const qIds = [...new Set(arr.map((item) => item.questionId))].filter(Boolean);
            const map = {};
            
            // Only import and use questionService if we have answer records
            if (qIds.length > 0) {
               const { questionService } = await import("@utils/questionService.js");
               await Promise.all(
                 qIds.map(async (qid) => {
                   try {
                     const qRes = await questionService.getById(qid);
                     if (qRes?.data) map[qid] = qRes.data;
                   } catch (err) {}
                 })
               );
               if (!cancelled) setQuestionMap(map);
            }
        } catch (err) {}

      } catch {
        if (!cancelled) setServerAttempt(null);
      }
    };
    loadServer();
    return () => { cancelled = true; };
  }, [location.state]);

  // Hybrid Verification Logic
  useEffect(() => {
    if (!serverAttempt) return;

    if (attemptAnswers.length === 0 || Object.keys(questionMap).length === 0) {
      setVerifiedScore(null);
      setCorrectQCount(null);
      return;
    }

    let correctCount = 0;
    const total = attemptAnswers.length;

    attemptAnswers.forEach((ans) => {
      const q = questionMap[ans.questionId];
      let isC = ans.isCorrect;

      if (!isC && q) {
        const userText = String(ans.selectedAnswer || "").trim();
        const correctVal = String(q.correctAnswer || "").trim();
        const userIndex = Number.isFinite(Number(ans.answerIndex)) ? Number(ans.answerIndex) : -1;

        let localPass = false;

        // 1. Index Check
        if (userIndex >= 0 && Array.isArray(q.options) && q.options[userIndex]) {
          const optText = String(q.options[userIndex]).trim();
          const letters = ["A", "B", "C", "D", "E", "F"];
          if (optText === correctVal || letters[userIndex] === correctVal) {
            localPass = true;
          }
        }

        // 2. Text/Fallback Check
        if (!localPass) {
          if (userText === correctVal) localPass = true;
          else if (Array.isArray(q.options)) {
            let idx = q.options.findIndex(o => String(o).trim() === userText);
            // Fallback: Check Letter (A, B...)
            if (idx === -1 && /^[A-F]$/i.test(userText)) {
              const letters = ["A", "B", "C", "D", "E", "F"];
              idx = letters.indexOf(userText.toUpperCase());
              if (idx >= q.options.length) idx = -1;
            }

            if (idx >= 0) {
              const letters = ["A", "B", "C", "D", "E", "F"];
              const optText = String(q.options[idx]).trim();
              if (letters[idx] === correctVal || optText === correctVal) localPass = true;
            }
          }
        }

        if (localPass) isC = true;
      }
      if (isC) correctCount++;
    });

    setCorrectQCount(correctCount);

    const max = Number(exam?.maxScore) || 10;
    const calc = total > 0 && max > 0 ? Math.round((correctCount / total) * max) : correctCount;
    setVerifiedScore(calc);

  }, [serverAttempt, attemptAnswers, questionMap, exam]);

  // Bỏ tự động quay về, chỉ cho phép người dùng bấm nút quay lại

  const finalDate = (() => {
    if (serverAttempt?.submittedAt || serverAttempt?.endTime) {
      const d = serverAttempt.submittedAt || serverAttempt.endTime;
      try { return new Date(d).toLocaleString("vi-VN"); } catch { return String(d || ""); }
    }
    return "";
  })();

  const totalQ = (() => {
    if (attemptAnswers.length > 0) return attemptAnswers.length;
    if (Number.isFinite(Number(serverAttempt?.totalQuestions))) return Number(serverAttempt.totalQuestions);
    if (Number.isFinite(Number(serverAttempt?.total))) return Number(serverAttempt.total);
    return 0;
  })();

  const correctQ = (() => {
    if (correctQCount !== null) return correctQCount;
    if (Number.isFinite(Number(serverAttempt?.correctCount))) return Number(serverAttempt.correctCount);
    if (Array.isArray(serverAttempt?.answers)) {
      const arr = serverAttempt.answers;
      return arr.filter((a) => !!a?.isCorrect || Number(a?.scoreAwarded) > 0).length;
    }
    return 0;
  })();

  const displayScore = verifiedScore !== null ? verifiedScore : (Number.isFinite(Number(serverAttempt?.score)) ? serverAttempt.score : correctQ);
  const displayMaxScore = Number.isFinite(Number(exam?.maxScore)) ? exam.maxScore : 10;

  const percent = (() => {
    if (verifiedScore !== null) return displayMaxScore > 0 ? Math.round((verifiedScore / displayMaxScore) * 100) : 0;
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
    return 0;
  })();

  if (!serverAttempt) {
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
      <h2 className="jexr-title">Kết quả thi {exam?.title || "Java Spring Boot"}</h2>

      <div className="jexr-card">
        <div className="jexr-header">
          <div className={`jexr-badge ${pass ? "success" : "danger"}`}>{percent}%</div>
          <div className="jexr-summary">
            <div className="jexr-score">
              <span className="jexr-score-label">Điểm</span>
              <span className="jexr-score-value">{displayScore}/{displayMaxScore > 0 ? displayMaxScore : 10}</span>
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
