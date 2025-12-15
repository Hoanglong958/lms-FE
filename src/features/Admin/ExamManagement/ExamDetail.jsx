import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ExamDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { examService } from "@utils/examService.js";
import { userService } from "@utils/userService.js";
import { API_BASE_URL } from "@/config/index.js";

export default function ExamDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const examId = params.examId;
  const [exam, setExam] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [users, setUsers] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptAnswers, setAttemptAnswers] = useState([]);
  const [reloading, setReloading] = useState(false);
  const stompRef = useRef(null);
  const wsAttemptedRef = useRef(false);
  const [wsSubmitted, setWsSubmitted] = useState(new Map());
  const [answersSubmitted, setAnswersSubmitted] = useState(new Map());

  const loadData = () => {
    if (!examId) return;
    setReloading(true);
    Promise.all([
      examService.getExamById(examId),
      examService.listAttempts(Number(examId)),
      userService.getAllUsers({ page: 0, size: 1000 }),
    ])
      .then(([examRes, attemptsRes, usersRes]) => {
        const e = examRes?.data || {};
        const arr = Array.isArray(attemptsRes?.data) ? attemptsRes.data : [];
        let userList = [];
        const ur = usersRes?.data;
        if (Array.isArray(ur)) userList = ur;
        else if (Array.isArray(ur?.data)) userList = ur.data;
        else if (Array.isArray(ur?.content)) userList = ur.content;
        else if (Array.isArray(usersRes?.data?.data)) userList = usersRes.data.data;
        else if (Array.isArray(usersRes?.data?.data?.content)) userList = usersRes.data.data.content;
        const attemptsWithUsers = arr.map((a) => {
          const u = userList.find((x) => String(x.id) === String(a.userId)) || {};
          return { ...a, user: u };
        });
        setExam(e);
        setAttempts(attemptsWithUsers);
        setUsers(userList);
      })
      .catch(() => {
        setExam(null);
        setAttempts([]);
        setUsers([]);
      })
      .finally(() => setReloading(false));
  };

  useEffect(() => { loadData(); }, [examId]);

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
        loadData();
      };
    } catch { void 0; }
    const id = setInterval(() => { loadData(); }, 8000);
    return () => clearInterval(id);
  }, [examId]);

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
        if (typeof window !== "undefined" && typeof window.global === "undefined") {
          window.global = window;
        }
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
                loadData();
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
      try { bc?.close(); } catch { void 0; }
    };
  }, [examId]);

  useEffect(() => {
    const latestByUser = new Map();
    attempts.forEach((a) => {
      const key = String(a.userId);
      const prev = latestByUser.get(key);
      const prevOverride = wsSubmitted.get(`ATT:${prev?.id}`) || wsSubmitted.get(`UID:${prev?.userId}`) || answersSubmitted.get(String(prev?.id));
      const curOverride = wsSubmitted.get(`ATT:${a?.id}`) || wsSubmitted.get(`UID:${a?.userId}`) || answersSubmitted.get(String(a?.id));
      const prevTime = prevOverride
        ? new Date(prevOverride).getTime()
        : (prev?.endTime || prev?.end_time || prev?.finishTime || prev?.finishedAt || prev?.submittedAt || prev?.endAt)
        ? new Date(prev.endTime || prev.end_time || prev.finishTime || prev.finishedAt || prev.submittedAt || prev.endAt).getTime()
        : 0;
      const curTime = curOverride
        ? new Date(curOverride).getTime()
        : (a?.endTime || a?.end_time || a?.finishTime || a?.finishedAt || a?.submittedAt || a?.endAt)
        ? new Date(a.endTime || a.end_time || a.finishTime || a.finishedAt || a.submittedAt || a.endAt).getTime()
        : 0;
      if (!prev || curTime >= prevTime) latestByUser.set(key, a);
    });
    const allRows = Array.from(latestByUser.values()).map((a) => {
      const stRaw = a?.startTime || a?.start_time || a?.startedAt || a?.startAt || null;
      let etRaw = a?.endTime || a?.end_time || a?.finishTime || a?.finishedAt || a?.submittedAt || a?.submitTime || a?.endAt || null;
      const st = stRaw ? new Date(stRaw).getTime() : 0;
      let et = etRaw ? new Date(etRaw).getTime() : 0;
      const baseStatus = String(a?.status || "").toUpperCase();
      const stat = baseStatus
        ? baseStatus
        : etRaw
        ? "COMPLETED"
        : stRaw
        ? "IN_PROGRESS"
        : "NOT_STARTED";
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
    const pending = attempts
      .filter((a) => !a?.endTime && !a?.end_time && !a?.finishTime && !a?.finishedAt && !a?.submittedAt && !a?.endAt)
      .filter((a) => String(a?.status).toUpperCase() === "IN_PROGRESS")
      .filter((a) => Number.isFinite(Number(a?.id)));
    const limit = pending.slice(0, 8);
    let alive = true;
    Promise.all(
      limit.map((a) =>
        examService
          .answersByAttempt(Number(a.id))
          .then((res) => {
            const arr = Array.isArray(res?.data) ? res.data : [];
            if (alive && arr.length > 0) {
              setAnswersSubmitted((prev) => {
                const next = new Map(prev);
                next.set(String(a.id), new Date().toISOString());
                return next;
              });
            }
          })
          .catch(() => {})
      )
    ).then(() => {});
    return () => { alive = false; };
  }, [attempts]);

  const fmt = (val) => {
    try { return new Date(val).toLocaleString("vi-VN"); } catch { return ""; }
  };
  const durationText = (item) => {
    const st = item?.startTime ? new Date(item.startTime).getTime() : 0;
    const et = item?.endTime ? new Date(item.endTime).getTime() : 0;
    if (st && et && et >= st) {
      const sec = Math.round((et - st) / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}p ${s}s`;
    }
    if (st && !et && String(item?.status).toUpperCase() === "IN_PROGRESS") {
      const now = Date.now();
      const sec = Math.max(0, Math.round((now - st) / 1000));
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}p ${s}s`;
    }
    return "—";
  };

  const handleViewAttempt = (a) => {
    if (!a?.attemptId) return;
    if (selectedAttempt && selectedAttempt.id === a.attemptId) {
      setSelectedAttempt(null);
      setAttemptAnswers([]);
      return;
    }
    const att = { id: a.attemptId };
    setSelectedAttempt(att);
    examService
      .answersByAttempt(att.id)
      .then((res) => {
        const arr = Array.isArray(res?.data) ? res.data : [];
        setAttemptAnswers(arr);
      })
      .catch(() => setAttemptAnswers([]));
  };

  return (
    <div className="exam-detail-container">
      <button
        className="exam-export-btn"
        onClick={() => navigate("/admin/exam")}
      >
        ← Quay lại danh sách câu hỏi
      </button>

      {/* Header */}
      <div className="exam-detail-header">
        <h2>{exam?.title || "Chi tiết kỳ thi"}</h2>
        <p>Chấm điểm và quản lý bài nộp</p>
        <div>
          <button
            className="exam-export-btn"
            onClick={loadData}
            disabled={reloading}
            title="Làm mới dữ liệu"
          >
            {reloading ? "Đang làm mới..." : "Làm mới"}
          </button>
        </div>
      </div>

      {/* Stats section */}
      <div className="exam-detail-stats">
        <div className="exam-stat-card">
          <div className="exam-stat-icon">
            <i className="fa fa-user"></i>
          </div>
          <div className="exam-stat-info">
            <h4>Tổng lượt làm</h4>
            <p>{stats.total}</p>
          </div>
        </div>

        <div className="exam-stat-card">
          <div className="exam-stat-icon">
            <i className="fa fa-check-circle"></i>
          </div>
          <div className="exam-stat-info">
            <h4>Đã nộp</h4>
            <p>{stats.submitted}/{stats.total}</p>
          </div>
        </div>

        <div className="exam-stat-card">
          <div className="exam-stat-icon">
            <i className="fa fa-clipboard-list"></i>
          </div>
          <div className="exam-stat-info">
            <h4>Đã chấm</h4>
            <p>{stats.graded}/{stats.submitted}</p>
          </div>
        </div>

        <div className="exam-stat-card">
          <div className="exam-stat-icon">
            <i className="fa fa-clock"></i>
          </div>
          <div className="exam-stat-info">
            <h4>Điểm trung bình</h4>
            <p>{stats.avgScore.toFixed(1)}/{exam?.maxScore ?? "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="exam-submission-list">
        <h3>Danh sách bài nộp</h3>

        <div className="exam-search-container">
          <input
            type="text"
            placeholder="Tìm kiếm học viên..."
            className="exam-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="exam-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            <option value="NOT_STARTED">Chưa làm</option>
            <option value="IN_PROGRESS">Đang làm</option>
            <option value="COMPLETED">Đã nộp</option>
            <option value="GRADED">Đã chấm</option>
          </select>
        </div>

        <table className="exam-table">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Email</th>
              <th>Thời gian nộp</th>
              <th>Thời gian làm</th>
              <th>Trạng thái</th>
              <th>Điểm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter((r) => {
                const q = searchQuery.trim().toLowerCase();
                if (!q) return true;
                const name = String(r.user?.fullName || "").toLowerCase();
                const email = String(r.user?.gmail || "").toLowerCase();
                return name.includes(q) || email.includes(q);
              })
              .filter((r) => {
                if (statusFilter === "ALL") return true;
                return String(r.status).toUpperCase() === statusFilter;
              })
              .map((a) => (
              <tr key={a.attemptId || a.userId}>
                <td>{a.user?.fullName || `#${a.userId}`}</td>
                <td>{a.user?.gmail || "—"}</td>
                <td>{a.endTime ? fmt(a.endTime) : a.status === "NOT_STARTED" ? "Chưa làm" : "Chưa nộp"}</td>
                <td>{durationText(a)}</td>
                <td>
                  <span className={`badge ${String(a.status).toUpperCase() === "COMPLETED" || String(a.status).toUpperCase() === "GRADED" ? "badge-success" : a.status === "NOT_STARTED" ? "badge-danger" : "badge-warning"}`}>
                    {a.status}
                  </span>
                </td>
                <td>{a.score}/{exam?.maxScore ?? "N/A"}</td>
                <td>
                  <button
                    className="exam-action-btn"
                    onClick={() => handleViewAttempt(a)}
                    disabled={!a.attemptId}
                  >
                    <i className="fa fa-eye"></i>{" "}
                    {selectedAttempt?.id === a.attemptId ? "Ẩn" : a.attemptId ? "Xem đáp án" : "—"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Chi tiết bài làm */}
        {selectedAttempt && (
          <div className="exam-detail-view">
            <h3>
              Lượt làm: <span>#{selectedAttempt.id}</span>
            </h3>
            <p>
              Điểm: <strong>{selectedAttempt.score}/{exam?.maxScore ?? "N/A"}</strong>
            </p>
            <div className="exam-question">
              <ul>
                {attemptAnswers.map((ans, idx) => (
                  <li key={idx} className={`exam-option ${ans.isCorrect ? "correct" : "wrong"}`}>
                    Câu {ans.questionId}: chọn {ans.selectedAnswer} {ans.isCorrect ? "✔" : "✖"} (+{ans.scoreAwarded})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
