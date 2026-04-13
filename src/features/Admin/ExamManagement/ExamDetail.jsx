// ExamDetail.jsx - Hoàn chỉnh, không lỗi spinner, giao diện mới
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles/ExamDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { examService } from "@utils/examService.js";
import { userService } from "@utils/userService.js";
import { questionService } from "@utils/questionService.js";
import { classStudentService } from "@utils/classStudentService.js";
import { registrationService } from "@utils/registrationService.js";
import { API_BASE_URL } from "@/config/index.js";
import { useNotification } from "@shared/notification";

const LoadingSpinner = () => (
  <div className="loading-overlay">
    <div className="spinner"></div>
    <p>Đang tải dữ liệu...</p>
  </div>
);

export default function ExamDetail() {
  const { confirm, success, error } = useNotification();
  const navigate = useNavigate();
  const params = useParams();
  const examId = params.examId;
  const [exam, setExam] = useState(null);
  const user = (() => { try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; } })();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const [attempts, setAttempts] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptAnswers, setAttemptAnswers] = useState([]);
  const [questionMap, setQuestionMap] = useState({});
  const [missingStudents, setMissingStudents] = useState([]);
  const [reloading, setReloading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const stompRef = useRef(null);
  const wsAttemptedRef = useRef(false);
  const [wsSubmitted, setWsSubmitted] = useState(new Map());
  const [answersSubmitted, setAnswersSubmitted] = useState(new Map());
  const [verifiedScore, setVerifiedScore] = useState(null);

  // Verified score calculation
  useEffect(() => {
    if (!selectedAttempt || attemptAnswers.length === 0 || Object.keys(questionMap).length === 0) {
      setVerifiedScore(null);
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
        if (userIndex >= 0 && Array.isArray(q.options) && q.options[userIndex]) {
          const optText = String(q.options[userIndex]).trim();
          const letters = ["A", "B", "C", "D", "E", "F"];
          if (optText === correctVal || letters[userIndex] === correctVal) localPass = true;
        }
        if (!localPass) {
          if (userText === correctVal) localPass = true;
          else if (Array.isArray(q.options)) {
            let idx = q.options.findIndex(o => String(o).trim() === userText);
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
    const max = Number(exam?.maxScore) || 0;
    const calc = total > 0 && max > 0 ? Math.round((correctCount / total) * max) : correctCount;
    setVerifiedScore(calc);
    setRows((prev) => {
      const idx = prev.findIndex(r => r.attemptId === selectedAttempt.id || r.id === selectedAttempt.id);
      if (idx === -1) return prev;
      const row = prev[idx];
      if (row.score !== calc) {
        const newRows = [...prev];
        newRows[idx] = { ...row, score: calc };
        return newRows;
      }
      return prev;
    });
  }, [selectedAttempt, attemptAnswers, questionMap, exam]);

  const handleRegrade = async () => {
    if (!selectedAttempt) return;
    const isConfirmed = await confirm({
      title: "Xác nhận chấm lại",
      message: "Bạn có chắc chắn muốn chấm lại bài này? Điểm sẽ được cập nhật vào hệ thống.",
      type: "warning",
      confirmText: "Chấm lại",
      cancelText: "Hủy"
    });
    if (!isConfirmed) return;
    try {
      const res = await examService.gradeAttempt(selectedAttempt.id);
      const updatedAttempt = res?.data;
      if (updatedAttempt) {
        const serverScore = updatedAttempt.score;
        const safeScore = (serverScore === 0 && verifiedScore > 0) ? verifiedScore : serverScore;
        success(`Chấm điểm thành công trên Server (Kết quả: ${serverScore})! \nHiển thị điểm đã xác thực: ${safeScore}`);
        setSelectedAttempt(prev => ({ ...prev, score: safeScore, status: updatedAttempt.status }));
        setRows(prevRows => prevRows.map(r => {
          const rId = r.attemptId || r.id;
          if (String(rId) === String(updatedAttempt.id)) return { ...r, score: safeScore, status: updatedAttempt.status };
          return r;
        }));
        handleViewAttempt({ ...selectedAttempt, ...updatedAttempt });
        loadData({ skipSpinner: false });
      }
    } catch (err) {
      console.error(err);
      error("Lỗi khi chấm điểm: " + (err.response?.data?.message || err.message));
    }
  };

  const loadData = async (options = { skipSpinner: false }) => {
    if (!examId) return;
    const showSpinner = !options.skipSpinner;
    if (showSpinner) setReloading(true);
    try {
      const [examRes, attemptsRes, usersRes] = await Promise.all([
        examService.getExamById(examId),
        examService.listAttempts(Number(examId)),
        userService.getAllUsers({ page: 0, size: 1000 }),
      ]);
      const e = examRes?.data || {};
      const arr = Array.isArray(attemptsRes?.data) ? attemptsRes.data : [];
      let userList = [];
      const ur = usersRes?.data;
      if (Array.isArray(ur)) userList = ur;
      else if (Array.isArray(ur?.data)) userList = ur.data;
      else if (Array.isArray(ur?.content)) userList = ur.content;
      else if (Array.isArray(usersRes?.data?.data)) userList = usersRes.data.data;
      else if (Array.isArray(usersRes?.data?.data?.content)) userList = usersRes.data.data.content;
      const userMap = new Map(userList.map((u) => [String(u.id), u]));
      const attemptsWithUsers = arr.map((a) => ({ ...a, user: userMap.get(String(a.userId)) || {} }));
      let expectedStudents = [];
      if (e?.classId && Number.isFinite(Number(e.classId))) {
        const csRes = await classStudentService.getClassStudents(e.classId);
        const cs = Array.isArray(csRes?.data) ? csRes.data : [];
        expectedStudents = cs.map((s) => ({ studentId: s.studentId }));
      } else if (Number.isFinite(Number(e?.courseId))) {
        const regRes = await registrationService.getAllRegistrations();
        const regs = Array.isArray(regRes?.data) ? regRes.data : [];
        expectedStudents = regs
          .filter((r) => String(r.courseId) === String(e.courseId) && String(r.paymentStatus) === "PAID")
          .map((r) => ({ studentId: r.studentId }));
      }
      const attemptedIds = new Set(arr.map((a) => String(a.userId)));
      const missing = expectedStudents
        .filter((s) => !attemptedIds.has(String(s.studentId)))
        .map((s) => {
          const u = userMap.get(String(s.studentId)) || {};
          return { id: s.studentId, fullName: u.fullName || u.full_name || u.name || `#${s.studentId}`, gmail: u.gmail || u.email || "—" };
        });
      setExam(e);
      setAttempts(attemptsWithUsers);
      setMissingStudents(missing);
    } catch {
      setExam(null);
      setAttempts([]);
      setMissingStudents([]);
    } finally {
      if (showSpinner) setReloading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => { loadData({ skipSpinner: false }); }, [examId]);

  // Broadcast & interval (background refresh)
  useEffect(() => {
    if (!examId) return;
    let bc;
    try {
      bc = typeof window !== "undefined" && window.BroadcastChannel ? new BroadcastChannel(`exam-room:${String(examId)}`) : null;
      if (bc) bc.onmessage = (ev) => {
        try {
          const msg = typeof ev?.data === "string" ? JSON.parse(ev.data) : ev.data;
          const t = String(msg?.type || "").toUpperCase();
          const uid = Number(msg?.userId);
          const attId = Number(msg?.attemptId);
          if (t === "SUBMIT_EXAM" && (Number.isFinite(uid) || Number.isFinite(attId))) {
            const when = msg?.submittedAt || new Date().toISOString();
            setWsSubmitted((prev) => {
              const next = new Map(prev);
              if (Number.isFinite(attId)) next.set(`ATT:${attId}`, when);
              if (Number.isFinite(uid)) next.set(`UID:${uid}`, when);
              return next;
            });
          }
        } catch { void 0; }
        loadData({ skipSpinner: true });
      };
    } catch { void 0; }
    const id = setInterval(() => { loadData({ skipSpinner: true }); }, 8000);
    return () => clearInterval(id);
  }, [examId]);

  // WebSocket
  useEffect(() => {
    if (!examId) return;
    const token = localStorage.getItem("accessToken");
    const resolveSockUrl = () => {
      const envUrl = import.meta?.env?.VITE_WS_URL;
      if (envUrl) {
        try {
          const u = new URL(envUrl);
          const httpScheme = u.protocol === "wss:" ? "https:" : u.protocol === "ws:" ? "http:" : u.protocol;
          const path = u.pathname && u.pathname !== "/" ? u.pathname : "/ws";
          return `${httpScheme}//${u.hostname}${u.port ? ":" + u.port : ""}${path}`;
        } catch (e) { void e; }
      }
      const apiUrl = import.meta?.env?.VITE_API_URL;
      if (apiUrl) {
        try {
          const u = new URL(apiUrl);
          return `${u.protocol}//${u.hostname}${u.port ? ":" + u.port : ""}/ws`;
        } catch (e) { void e; }
      }
      try {
        const u = new URL(API_BASE_URL || "http://localhost:3900");
        return `${u.protocol}//${u.hostname}${u.port ? ":" + u.port : ""}/ws`;
      } catch (e) { void e; }
      return "http://localhost:3900/ws";
    };
    const connectStomp = async () => {
      const sockUrl = resolveSockUrl();
      try {
        if (typeof window !== "undefined" && typeof window.global === "undefined") window.global = window;
        const { default: SockJS } = await import("sockjs-client");
        const { Client } = await import("@stomp/stompjs");
        const client = new Client({
          connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
          webSocketFactory: () => new SockJS(sockUrl),
          reconnectDelay: 0,
          onConnect: () => {
            const roomId = String(examId || "1");
            try {
              client.subscribe(`/topic/exam-room/${roomId}`, (messageOutput) => {
                try {
                  const msg = JSON.parse(messageOutput.body);
                  const t = String(msg?.type || "").toUpperCase();
                  const uid = Number(msg?.userId);
                  const attId = Number(msg?.attemptId);
                  if (t === "SUBMIT_EXAM" && (Number.isFinite(uid) || Number.isFinite(attId))) {
                    const when = msg?.submittedAt || new Date().toISOString();
                    setWsSubmitted((prev) => {
                      const next = new Map(prev);
                      if (Number.isFinite(attId)) next.set(`ATT:${attId}`, when);
                      if (Number.isFinite(uid)) next.set(`UID:${uid}`, when);
                      return next;
                    });
                  }
                } catch (e) { void e; }
                loadData({ skipSpinner: true });
              });
            } catch (e) { void e; }
          },
          onWebSocketClose: () => {
            if (!wsAttemptedRef.current) {
              wsAttemptedRef.current = true;
              setTimeout(connectStomp, 1500);
            }
          }
        });
        stompRef.current = client;
        client.activate();
      } catch (e) { void e; }
    };
    wsAttemptedRef.current = false;
    connectStomp();
    return () => {
      try { stompRef.current?.deactivate(); } catch (e) { void e; }
      stompRef.current = null;
    };
  }, [examId]);

  useEffect(() => {
    const latestByUser = new Map();
    attempts.forEach((a) => {
      const key = String(a.userId);
      const prev = latestByUser.get(key);
      const prevOverride = wsSubmitted.get(`ATT:${prev?.id}`) || wsSubmitted.get(`UID:${prev?.userId}`) || answersSubmitted.get(String(prev?.id));
      const curOverride = wsSubmitted.get(`ATT:${a?.id}`) || wsSubmitted.get(`UID:${a?.userId}`) || answersSubmitted.get(String(a?.id));
      const prevTime = prevOverride ? new Date(prevOverride).getTime() : (prev?.endTime || prev?.end_time || prev?.finishTime || prev?.finishedAt || prev?.submittedAt || prev?.endAt) ? new Date(prev.endTime || prev.end_time || prev.finishTime || prev.finishedAt || prev.submittedAt || prev.endAt).getTime() : 0;
      const curTime = curOverride ? new Date(curOverride).getTime() : (a?.endTime || a?.end_time || a?.finishTime || a?.finishedAt || a?.submittedAt || a?.endAt) ? new Date(a.endTime || a.end_time || a.finishTime || a.finishedAt || a.submittedAt || a.endAt).getTime() : 0;
      if (!prev || curTime >= prevTime) latestByUser.set(key, a);
    });
    const allRows = Array.from(latestByUser.values()).map((a) => {
      const stRaw = a?.startTime || a?.start_time || a?.startedAt || a?.startAt || null;
      let etRaw = a?.endTime || a?.end_time || a?.finishTime || a?.finishedAt || a?.submittedAt || a?.submitTime || a?.endAt || null;
      const st = stRaw ? new Date(stRaw).getTime() : 0;
      let et = etRaw ? new Date(etRaw).getTime() : 0;
      const baseStatus = String(a?.status || "").toUpperCase();
      const stat = baseStatus ? baseStatus : etRaw ? "COMPLETED" : stRaw ? "IN_PROGRESS" : "NOT_STARTED";
      const overrideSubmit = wsSubmitted.get(`ATT:${a?.id}`) || wsSubmitted.get(`UID:${a.userId}`) || answersSubmitted.get(String(a?.id));
      if (stat === "IN_PROGRESS" && overrideSubmit) {
        etRaw = overrideSubmit;
        et = new Date(overrideSubmit).getTime();
      }
      return {
        attemptId: a?.id || null,
        user: a.user || {},
        userId: a.userId,
        status: stat === "IN_PROGRESS" && overrideSubmit ? "COMPLETED" : stat,
        endTime: etRaw,
        startTime: stRaw,
        score: typeof a?.score === "number" ? a.score : 0,
        durationSec: st && et && et >= st ? Math.round((et - st) / 1000) : 0,
      };
    });
    setRows(allRows);
  }, [attempts, wsSubmitted, answersSubmitted]);

  const stats = useMemo(() => {
    const total = attempts.length;
    const submittedRaw = attempts.filter((a) => a?.endTime || a?.end_time || a?.finishTime || a?.finishedAt || a?.submittedAt || a?.endAt).length;
    const overrideCount = Array.from(wsSubmitted.keys()).length + Array.from(answersSubmitted.keys()).length;
    const submitted = Math.max(submittedRaw, submittedRaw + overrideCount);
    const graded = attempts.filter((a) => String(a?.status).toUpperCase() === "GRADED").length;
    const avg = attempts.reduce((s, a) => s + (Number(a?.score) || 0), 0);
    const avgScore = total > 0 ? avg / total : 0;
    return { total, submitted, graded, avgScore };
  }, [attempts, wsSubmitted, answersSubmitted]);

  useEffect(() => {
    const pending = attempts.filter((a) => !a?.endTime && !a?.end_time && !a?.finishTime && !a?.finishedAt && !a?.submittedAt && !a?.endAt).filter((a) => String(a?.status).toUpperCase() === "IN_PROGRESS").filter((a) => Number.isFinite(Number(a?.id)));
    const limit = pending.slice(0, 8);
    let alive = true;
    Promise.all(limit.map((a) => examService.answersByAttempt(Number(a.id)).then((res) => { const arr = Array.isArray(res?.data) ? res.data : []; if (alive && arr.length > 0) { setAnswersSubmitted((prev) => { const next = new Map(prev); next.set(String(a.id), new Date().toISOString()); return next; }); } }).catch(() => { }))).then(() => { });
    return () => { alive = false; };
  }, [attempts]);

  const fmt = (val) => { try { return new Date(val).toLocaleString("vi-VN"); } catch { return ""; } };
  const durationText = (item) => {
    const st = item?.startTime ? new Date(item.startTime).getTime() : 0;
    const et = item?.endTime ? new Date(item.endTime).getTime() : 0;
    if (st && et && et >= st) { const sec = Math.round((et - st) / 1000); const m = Math.floor(sec / 60); const s = sec % 60; return `${m}p ${s}s`; }
    if (st && !et && String(item?.status).toUpperCase() === "IN_PROGRESS") { const now = Date.now(); const sec = Math.max(0, Math.round((now - st) / 1000)); const m = Math.floor(sec / 60); const s = sec % 60; return `${m}p ${s}s`; }
    return "—";
  };

  const handleViewAttempt = (a) => {
    if (!a?.attemptId) return;
    if (selectedAttempt && selectedAttempt.id === a.attemptId) {
      setSelectedAttempt(null);
      setAttemptAnswers([]);
      setQuestionMap({});
      return;
    }
    const att = { ...a, id: a.attemptId };
    setSelectedAttempt(att);
    setQuestionMap({});
    examService.answersByAttempt(att.id).then(async (res) => {
      const arr = Array.isArray(res?.data) ? res.data : [];
      const qIds = [...new Set(arr.map((item) => item.questionId))].filter(Boolean);
      const map = {};
      await Promise.all(qIds.map(async (qid) => { try { const qRes = await questionService.getById(qid); if (qRes?.data) map[qid] = qRes.data; } catch (err) { console.error(err); } }));
      const finalAnswers = arr.map((ans) => ({ ...ans, scoreAwarded: typeof ans.scoreAwarded === "number" ? ans.scoreAwarded : (ans.isCorrect ? 1 : 0) }));
      setQuestionMap(map);
      setAttemptAnswers(finalAnswers);
    }).catch((err) => { console.error(err); setAttemptAnswers([]); });
  };

  return (
    <div className="exam-detail-container">
      {(initialLoading || reloading) && <LoadingSpinner />}
      <button className="exam-export-btn" onClick={() => navigate(isAdmin ? "/admin/exam" : "/teacher/exam")}>← Quay lại danh sách bài thi</button>
      <div className="exam-detail-header"><h2>{exam?.title || "Chi tiết kỳ thi"}</h2><p>Chấm điểm và quản lý bài nộp</p></div>
      <div className="exam-detail-stats">
        <div className="exam-stat-card"><div className="exam-stat-icon"><i className="fa fa-user"></i></div><div className="exam-stat-info"><h4>Tổng lượt làm</h4><p>{stats.total}</p></div></div>
        <div className="exam-stat-card"><div className="exam-stat-icon"><i className="fa fa-check-circle"></i></div><div className="exam-stat-info"><h4>Đã nộp</h4><p>{stats.submitted}/{stats.total}</p></div></div>
        <div className="exam-stat-card"><div className="exam-stat-icon"><i className="fa fa-clipboard-list"></i></div><div className="exam-stat-info"><h4>Đã chấm</h4><p>{stats.graded}/{stats.submitted}</p></div></div>
        <div className="exam-stat-card"><div className="exam-stat-icon"><i className="fa fa-chart-line"></i></div><div className="exam-stat-info"><h4>Điểm trung bình</h4><p>{stats.avgScore.toFixed(1)}/{exam?.maxScore ?? "N/A"}</p></div></div>
      </div>
      {(() => {
        const inProgress = rows.filter((r) => String(r.status).toUpperCase() === "IN_PROGRESS"); if (inProgress.length === 0) return null; return (
          <div className="exam-inprogress"><div className="exam-inprogress-header"><h3><i className="fa fa-hourglass-half"></i> Đang làm ({inProgress.length})</h3></div><div className="exam-inprogress-list">{inProgress.map((p) => (<div key={p.attemptId || p.userId} className="exam-inprogress-item"><div className="inprog-main"><span className="inprog-name">{p.user?.fullName || `#${p.userId}`}</span><span className="inprog-email">{p.user?.gmail || "—"}</span></div><div className="inprog-meta"><span><i className="fa fa-play-circle"></i> {p.startTime ? fmt(p.startTime) : "—"}</span><span><i className="fa fa-stopwatch"></i> {durationText(p)}</span></div></div>))}</div></div>
        );
      })()}
      {missingStudents.length > 0 && (<div className="exam-inprogress missing"><div className="exam-inprogress-header"><h3><i className="fa fa-user-slash"></i> Chưa làm ({missingStudents.length})</h3></div><div className="exam-inprogress-list">{missingStudents.map((s) => (<div key={s.id} className="exam-inprogress-item"><div className="inprog-main"><span className="inprog-name">{s.fullName}</span><span className="inprog-email">{s.gmail}</span></div><div className="inprog-meta"><span className="status-badge not-started">CHƯA LÀM</span></div></div>))}</div></div>)}
      <div className="exam-submission-list"><h3><i className="fa fa-table-list"></i> Danh sách bài nộp</h3><div className="exam-search-container"><input type="text" placeholder="🔍 Tìm kiếm học viên..." className="exam-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /><select className="exam-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="ALL">📋 Tất cả</option><option value="NOT_STARTED">⏳ Chưa làm</option><option value="IN_PROGRESS">✍️ Đang làm</option><option value="COMPLETED">✅ Đã nộp</option><option value="GRADED">🏆 Đã chấm</option></select></div><div className="table-responsive"><table className="exam-table"><thead><tr><th>Học viên</th><th>Email</th><th>Thời gian nộp</th><th>Thời gian làm</th><th>Trạng thái</th><th>Điểm</th><th>Thao tác</th></tr></thead><tbody>{rows.filter((r) => { const q = searchQuery.trim().toLowerCase(); if (!q) return true; const name = String(r.user?.fullName || "").toLowerCase(); const email = String(r.user?.gmail || "").toLowerCase(); return name.includes(q) || email.includes(q); }).filter((r) => { if (statusFilter === "ALL") return true; return String(r.status).toUpperCase() === statusFilter; }).map((a) => (<tr key={a.attemptId || a.userId}><td><strong>{a.user?.fullName || `#${a.userId}`}</strong></td><td>{a.user?.gmail || "—"}</td><td>{a.endTime ? fmt(a.endTime) : a.status === "NOT_STARTED" ? "Chưa làm" : "Chưa nộp"}</td><td>{durationText(a)}</td><td><span className={`badge ${String(a.status).toUpperCase() === "COMPLETED" || String(a.status).toUpperCase() === "GRADED" ? "badge-success" : a.status === "NOT_STARTED" ? "badge-danger" : "badge-warning"}`}>{a.status === "NOT_STARTED" ? "Chưa làm" : a.status === "IN_PROGRESS" ? "Đang làm" : a.status === "COMPLETED" ? "Đã nộp" : "Đã chấm"}</span></td><td className="score-cell">{selectedAttempt?.id === a.attemptId && verifiedScore !== null ? verifiedScore : a.score}/{exam?.maxScore ?? "N/A"}</td><td><button className="exam-action-btn" onClick={() => handleViewAttempt(a)} disabled={!a.attemptId}><i className="fa fa-eye"></i> {selectedAttempt?.id === a.attemptId ? "Ẩn" : a.attemptId ? "Xem đáp án" : "—"}</button></td></tr>))}</tbody></table></div>
        {selectedAttempt && (<div className="exam-detail-view"><div className="exam-detail-info-header"><h3>📝 Lượt làm: <span>#{selectedAttempt.id}</span></h3><div className="exam-detail-scores"><div className="score-actions"><p>Điểm tổng kết: <strong>{verifiedScore !== null ? `${verifiedScore}/${exam?.maxScore ?? "N/A"}` : `${selectedAttempt.score}/${exam?.maxScore ?? "N/A"}`}</strong><span className="note">(Verified by Question Bank)</span></p><button onClick={handleRegrade} className="regrade-btn"><i className="fa fa-sync-alt"></i> Chấm lại (Server)</button></div></div></div><div className="exam-question-list">{attemptAnswers.map((ans, idx) => { const qDetail = questionMap[ans.questionId]; const userText = String(ans.selectedAnswer || "").trim(); const userIndex = Number.isFinite(Number(ans.answerIndex)) ? Number(ans.answerIndex) : -1; let isCorrectFinal = ans.isCorrect; let matchedOptionIndex = -1; let localIsCorrect = false; if (qDetail) { const correctVal = String(qDetail.correctAnswer || "").trim(); if (userIndex >= 0 && Array.isArray(qDetail.options) && qDetail.options[userIndex]) { matchedOptionIndex = userIndex; } else if (Array.isArray(qDetail.options)) { matchedOptionIndex = qDetail.options.findIndex(o => String(o).trim() === userText); if (matchedOptionIndex === -1 && /^[A-F]$/i.test(userText)) { const letters = ["A", "B", "C", "D", "E", "F"]; const letterIdx = letters.indexOf(userText.toUpperCase()); if (letterIdx >= 0 && letterIdx < qDetail.options.length) matchedOptionIndex = letterIdx; } } if (matchedOptionIndex >= 0) { const optText = String(qDetail.options[matchedOptionIndex]).trim(); const letters = ["A", "B", "C", "D", "E", "F"]; if (optText === correctVal || letters[matchedOptionIndex] === correctVal) localIsCorrect = true; } else if (userText === correctVal) localIsCorrect = true; if (!isCorrectFinal && localIsCorrect) isCorrectFinal = true; } return (<div key={idx} className={`exam-question-item ${isCorrectFinal ? "is-correct" : "is-wrong"}`}><div className="eq-header"><span className="eq-title">Câu {idx + 1} <span className="eq-id">(ID: {ans.questionId})</span></span><span className={`eq-badge ${isCorrectFinal ? "badge-success" : "badge-danger"}`}>{isCorrectFinal ? "Đúng" : "Sai"}{!ans.isCorrect && isCorrectFinal && " (Check lại: OK)"}</span></div>{qDetail ? (<div className="eq-content"><div className="eq-question-text">{qDetail.questionText}</div><div className="eq-options-grid">{(qDetail.options || []).map((opt, oIdx) => { const letters = ["A", "B", "C", "D", "E", "F"]; const optText = String(opt).trim(); const isSelected = (oIdx === matchedOptionIndex) || (optText === userText); const isThisCorrect = letters[oIdx] === qDetail.correctAnswer || optText === qDetail.correctAnswer; let cls = "eq-option"; if (isSelected) cls += " selected-answer"; if (isThisCorrect) cls += " correct-answer"; if (isSelected && !isThisCorrect) cls += " wrong-choice"; return (<div key={oIdx} className={cls}><span className="opt-char">{letters[oIdx]}.</span><span className="opt-text">{opt}</span>{isSelected && <i className="fa fa-hand-point-left opt-icon"></i>}{isThisCorrect && <i className="fa fa-check opt-check"></i>}</div>); })}</div>{matchedOptionIndex === -1 && userText && (<div className="eq-nomatch"><p>⚠️ Không tìm thấy đáp án khớp: "<strong>{userText}</strong>"</p></div>)}{!isCorrectFinal && (<div className="eq-explain-box"><strong>💡 Giải thích:</strong> {qDetail.explanation || "Không có giải thích chi tiết."}</div>)}</div>) : (<div className="eq-loading"><p>Đáp án chọn: <strong>{ans.selectedAnswer}</strong></p><p className="loading-note">(Đang tải nội dung câu hỏi...)</p></div>)}</div>); })}</div></div>)}
      </div>
    </div>
  );
}