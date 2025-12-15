  import React, { useState, useEffect, useRef, useCallback } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import "./JavaExamPage.css";
  import { examService } from "@utils/examService.js";
  import { API_BASE_URL } from "../config/index.js";

  const QUESTIONS = [
    {
      id: 1,
      question: "Spring Boot dùng annotation nào để đánh dấu lớp khởi chạy chính?",
      answers: ["@SpringBootApplication", "@EnableBoot", "@BootRun", "@StarterApp"],
      correct: 0,
    },
    {
      id: 2,
      question: "Dependency Injection trong Spring được thực hiện qua?",
      answers: ["Constructor / Setter", "Interfaces", "Properties File", "HTTP Request"],
      correct: 0,
    },
    {
      id: 3,
      question: "Spring Boot mặc định sử dụng server nào?",
      answers: ["Tomcat", "Jetty", "Netty", "GlassFish"],
      correct: 0,
    },
    {
      id: 4,
      question: "Annotation để tạo REST API trong Spring Boot là?",
      answers: ["@RestController", "@Service", "@Repository", "@ApiController"],
      correct: 0,
    },
    {
      id: 5,
      question: "File cấu hình mặc định của Spring Boot là?",
      answers: ["application.properties", "config.yml", "settings.conf", "boot.json"],
      correct: 0,
    },
  ];

  export default function JavaExamPage() {
    const { examId } = useParams();
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(60 * 20); // default 20 phút until API overrides
    const startRef = useRef(Date.now());
    const navigate = useNavigate();
  const submittedRef = useRef(false);
  const stompRef = useRef(null);
    const wsAttemptedRef = useRef(false);
    const [notifs, setNotifs] = useState([]);
    const endRef = useRef(Date.now() + 60 * 20 * 1000);
    const EXAM_ACTIVE_KEY = examId ? `examActive:${examId}` : "examActive:default";
    const [exams, setExams] = useState([]);
    const [examsLoading, setExamsLoading] = useState(false);
  const [examDetail, setExamDetail] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examLoaded, setExamLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const attemptIdRef = useRef(null);
  const attemptStartedRef = useRef(false);

    const showNotif = (message, type = "info") => {
      const id = Date.now() + Math.random();
      setNotifs((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setNotifs((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    };

    // ⏳ Đồng hồ đếm ngược: initialize from localStorage if exists (may be overridden by API)
    useEffect(() => {
      if (!examId) return;
      try {
        const raw = localStorage.getItem(EXAM_ACTIVE_KEY);
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj?.endTime && obj?.startedAt) {
            startRef.current = obj.startedAt;
            endRef.current = obj.endTime;
            setSelectedAnswers(obj.selections || {});
            const remaining = Math.max(0, Math.floor((obj.endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
          } else {
            const startedAt = Date.now();
            startRef.current = startedAt;
            endRef.current = startedAt + 60 * 20 * 1000;
            localStorage.setItem(
              EXAM_ACTIVE_KEY,
              JSON.stringify({ startedAt, endTime: endRef.current, selections: {} })
            );
            setTimeLeft(Math.floor((endRef.current - Date.now()) / 1000));
          }
        } else {
          const startedAt = Date.now();
          startRef.current = startedAt;
          endRef.current = startedAt + 60 * 20 * 1000;
          localStorage.setItem(
            EXAM_ACTIVE_KEY,
            JSON.stringify({ startedAt, endTime: endRef.current, selections: {} })
          );
          setTimeLeft(Math.floor((endRef.current - Date.now()) / 1000));
        }
      } catch (e) { void e; }

      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
      }, 1000);
      return () => clearInterval(timer);
    }, [examId, EXAM_ACTIVE_KEY]);

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
          const u = new URL(API_BASE_URL);
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
              showNotif("Đã bắt đầu làm bài thi", "info");
              const user = (() => {
                try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; }
              })();
              const roomId = String(examId || "1");
              try {
                client.subscribe(`/topic/exam-room/${roomId}`,(messageOutput)=>{
                  try {
                    const msg = JSON.parse(messageOutput.body);
                    const content = msg.content || msg.message || msg.type;
                    showNotif(String(content || "Thông báo"), "info");
                  } catch (e) { void e; }
                });
              } catch (e) { void e; }

              try {
                const joinMessage = {
                  type: "JOIN_EXAM",
                  examRoomId: roomId,
                  userId: Number(user?.id) || undefined,
                  examId: Number(examId) || 0,
                };
                client.publish({ destination: "/app/exam/action", body: JSON.stringify(joinMessage) });
                try {
                  const temp = new Client({
                    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
                    webSocketFactory: () => new SockJS("http://localhost:3900/ws"),
                    reconnectDelay: 0,
                    onConnect: () => {
                      try { temp.publish({ destination: "/app/exam/action", body: JSON.stringify(joinMessage) }); } catch { void 0; }
                      setTimeout(() => { try { temp.deactivate(); } catch { void 0; } }, 500);
                    }
                  });
                  temp.activate();
                } catch { void 0; }
              } catch (e) { void e; }
            },
            onStompError: () => {
              showNotif("Kết nối thông báo gặp lỗi", "error");
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
        try {
          stompRef.current?.deactivate();
        } catch (e) { void e; }
        stompRef.current = null;
      };
    }, [examId]);

  useEffect(() => {
    if (!examId || attemptStartedRef.current || !examLoaded || notFound) return;
    const user = (() => { try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; } })();
    const userId = Number(user?.id);
    if (!Number.isFinite(userId)) return;
    attemptStartedRef.current = true;
    examService
      .startAttempt(Number(examId), userId)
      .then((res) => { attemptIdRef.current = res?.data?.id || null; })
      .catch(() => {});
  }, [examId, examLoaded, notFound]);

    useEffect(() => {
      if (examId) return;
      setExamsLoading(true);
      examService
        .getExams({ page: 0, size: 100 })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : [];
          setExams(data);
        })
        .finally(() => setExamsLoading(false));
    }, [examId]);

    // ====== Load exam detail & map questions + sync durationMinutes to timer/localStorage
    useEffect(() => {
      if (!examId) return;
      examService
        .getExamById(examId)
        .then((res) => {
          const data = res.data || null;
          if (!data || (!Array.isArray(data.questions) || data.questions.length === 0)) {
            setNotFound(true);
            setExamLoaded(true);
            return;
          }
          setExamDetail(data);
          const qs = data.questions.map((q, idx) => {
            const correctIndex = Array.isArray(q.options)
              ? q.options.findIndex((opt) => String(opt) === String(q.correctAnswer))
              : -1;
            return {
              id: q.id || idx + 1,
              question: q.questionText || q.question || "",
              answers: Array.isArray(q.options) ? q.options : [],
              correct: correctIndex >= 0 ? correctIndex : undefined,
            };
          });
          setExamQuestions(qs);
          setExamLoaded(true);

          const durationMin = Number(data.durationMinutes) || 20;
          try {
            const raw = localStorage.getItem(EXAM_ACTIVE_KEY) || "";
            if (raw) {
              const obj = JSON.parse(raw);
              if (obj?.startedAt) {
                const newEnd = obj.startedAt + durationMin * 60 * 1000;
                endRef.current = newEnd;
                obj.endTime = newEnd;
                localStorage.setItem(EXAM_ACTIVE_KEY, JSON.stringify(obj));
                const remaining = Math.max(0, Math.floor((newEnd - Date.now()) / 1000));
                setTimeLeft(remaining);
              } else {
                const startedAt = Date.now();
                const newEnd = startedAt + durationMin * 60 * 1000;
                startRef.current = startedAt;
                endRef.current = newEnd;
                localStorage.setItem(EXAM_ACTIVE_KEY, JSON.stringify({ startedAt, endTime: newEnd, selections: {} }));
                setTimeLeft(Math.max(0, Math.floor((newEnd - Date.now()) / 1000)));
              }
            } else {
              const startedAt = Date.now();
              const newEnd = startedAt + durationMin * 60 * 1000;
              startRef.current = startedAt;
              endRef.current = newEnd;
              localStorage.setItem(EXAM_ACTIVE_KEY, JSON.stringify({ startedAt, endTime: newEnd, selections: {} }));
              setTimeLeft(Math.max(0, Math.floor((newEnd - Date.now()) / 1000)));
            }
          } catch (e) { void e; }
        })
        .catch(() => { setNotFound(true); setExamLoaded(true); })
        .finally(() => {});
    }, [examId, EXAM_ACTIVE_KEY]);

    const handleSubmit = useCallback(async (auto = false) => {
      if (submittedRef.current) return;
      if (!auto) {
        const ok = window.confirm("Bạn có chắc chắn muốn nộp bài?");
        if (!ok) return;
      }
      const usedQuestions = examId ? examQuestions : (examQuestions && examQuestions.length ? examQuestions : QUESTIONS);
      const total = usedQuestions.length;
      let correct = 0;
      for (const q of usedQuestions) {
        if (q.correct !== undefined && selectedAnswers[q.id] === q.correct) correct++;
      }
      const finishedAt = Date.now();
      const durationSec = Math.max(
        0,
        Math.round((finishedAt - startRef.current) / 1000)
      );
      const percent = Math.round((correct / total) * 100);

      const attempt = {
        id: finishedAt,
        date: new Date(finishedAt).toISOString(),
        total,
        correct,
        percent,
        durationSec,
        selections: selectedAnswers,
      };

      try {
        const raw = localStorage.getItem("javaExamPracticeHistory") || "[]";
        const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
        arr.unshift(attempt);
        localStorage.setItem(
          "javaExamPracticeHistory",
          JSON.stringify(arr.slice(0, 50))
        );
      } catch (_e) { void _e; }
      submittedRef.current = true;
      try { localStorage.removeItem(EXAM_ACTIVE_KEY); } catch (e) { void e; }
      try {
        const user = (() => { try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; } })();
        const roomId = String(examId || "1");
        const answersArr = usedQuestions.map((q) => {
          const idx = selectedAnswers[q.id];
          return idx !== undefined ? { questionId: q.id, answer: String.fromCharCode(65 + idx) } : { questionId: q.id, answer: "" };
        });
        let attemptId = attemptIdRef.current;
        if (!Number.isFinite(Number(attemptId))) {
          const resStart = await examService.startAttempt(Number(examId), Number(user?.id));
          attemptId = resStart?.data?.id;
          attemptIdRef.current = attemptId || null;
        }
        if (Number.isFinite(Number(attemptId))) {
          await examService.submitAttempt(Number(attemptId), answersArr);
        }
        const submitMessage = {
          type: "SUBMIT_EXAM",
          examRoomId: roomId,
          userId: Number(user?.id) || undefined,
          examId: Number(examId) || 0,
          attemptId: Number(attemptId) || undefined,
          submittedAt: new Date(finishedAt).toISOString(),
          answers: answersArr,
        };
        stompRef.current?.publish({ destination: "/app/exam/action", body: JSON.stringify(submitMessage) });
        try {
          const ch = typeof window !== "undefined" && window.BroadcastChannel ? new BroadcastChannel(`exam-room:${roomId}`) : null;
          ch?.postMessage(submitMessage);
          setTimeout(() => { try { ch?.close(); } catch { void 0; } }, 1000);
        } catch { void 0; }
        try {
          const token = localStorage.getItem("accessToken");
          const { default: SockJS } = await import("sockjs-client");
          const { Client } = await import("@stomp/stompjs");
          const temp = new Client({
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            webSocketFactory: () => new SockJS("http://localhost:3900/ws"),
            reconnectDelay: 0,
            onConnect: () => {
              try { temp.publish({ destination: "/app/exam/action", body: JSON.stringify(submitMessage) }); } catch { void 0; }
              setTimeout(() => { try { temp.deactivate(); } catch { void 0; } }, 500);
            }
          });
          temp.activate();
        } catch { void 0; }
      } catch (e) { void e; }
      showNotif("Đã nộp bài thi thành công", "success");
      const finalAttemptId = Number(attemptIdRef.current) || null;
      navigate("/exam/result", { state: { attemptId: finalAttemptId, localId: attempt.id } });
    }, [navigate, selectedAnswers, EXAM_ACTIVE_KEY, examId, examQuestions]);

    useEffect(() => {
      if (timeLeft === 0 && !submittedRef.current) {
        handleSubmit(true);
      }
    }, [timeLeft, handleSubmit]);

    const formatTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const formatDateTime = (val) => {
      try { return new Date(val).toLocaleString("vi-VN"); } catch { return String(val || ""); }
    };

    const getExamCode = (e) => {
      if (e?.code) return String(e.code);
      const idNum = Number(e?.id);
      if (!Number.isFinite(idNum)) return "";
      const base = Math.max(0, idNum).toString(36);
      return base.padStart(5, "0").slice(-6);
    };

    const selectAnswer = (qid, index) => {
      const next = { ...selectedAnswers, [qid]: index };
      setSelectedAnswers(next);
      try {
        const raw = localStorage.getItem(EXAM_ACTIVE_KEY) || "{}";
        const obj = JSON.parse(raw) || {};
        obj.selections = next;
        localStorage.setItem(EXAM_ACTIVE_KEY, JSON.stringify(obj));
      } catch (e) { void e; }
    };

    if (!examId) {
      let historyCount = 0;
      let history = [];
      try {
        const raw = localStorage.getItem("javaExamPracticeHistory") || "[]";
        const arr = JSON.parse(raw);
        history = Array.isArray(arr) ? arr : [];
        historyCount = history.length;
      } catch (e) { void e; }

      return (
        <div className="exam-layout exam-select">
          {examsLoading ? (
            <div className="exam-select-card"><div className="exam-select-header"><h2>Đang tải danh sách kỳ thi...</h2></div></div>
          ) : exams.length === 0 ? (
            <div className="exam-select-card"><div className="exam-select-header"><h2>Chưa có kỳ thi nào</h2></div></div>
          ) : (
            exams.map((e) => (
              <div key={e.id} className="exam-select-card">
                <div className="exam-select-header">
                  <h2>{e.title}</h2>
                  <div className="exam-code-line">
                    <span className="exam-code-label">Mã đề thi:</span>
                    <span className="exam-code-value">{getExamCode(e) || "—"}</span>
                  </div>
                </div>
                <div className="exam-select-info">
                  <div className="info-row">
                    <span className="info-icon">🕒</span>
                    <span className="info-label">Thời gian làm bài</span>
                    <span className="info-value">{e.durationMinutes ? `${e.durationMinutes} phút` : "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">⏰</span>
                    <span className="info-label">Thời gian vào thi</span>
                    <span className="info-value">{e.startTime ? formatDateTime(e.startTime) : "Không thời hạn"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">❓</span>
                    <span className="info-label">Số lượng câu hỏi</span>
                    <span className="info-value">{e.totalQuestions ?? 0}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">📋</span>
                    <span className="info-label">Loại đề</span>
                    <span className="info-value">Trắc nghiệm</span>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">👥</span>
                    <span className="info-label">Tổng lượt đã làm của đề</span>
                    <span className="info-value">{historyCount}</span>
                  </div>
                </div>
                <div className="exam-select-actions">
                  <button className="exam-start-btn" onClick={() => navigate(`/exam/${e.id}`)}>Bắt đầu thi</button>
                </div>
              </div>
            ))
          )}
          <div className="exam-select-history">
            <button
              className={historyOpen ? "history-btn active" : "history-btn"}
              onClick={() => setHistoryOpen((v) => !v)}
            >
              {historyOpen ? "Ẩn lịch sử làm bài" : `Xem lịch sử làm bài (${historyCount})`}
            </button>
          </div>

          {historyOpen && (
            <div className="exam-history-card">
              <h3 className="exam-history-title">Lịch sử làm bài</h3>
              {history.length === 0 ? (
                <p className="exam-history-empty">Chưa có lần làm nào.</p>
              ) : (
                <div className="exam-history-table">
                  <div className="eh-head">Thời gian nộp</div>
                  <div className="eh-head">Điểm</div>
                  <div className="eh-head">%</div>
                  <div className="eh-head">Thời gian làm</div>
                  {history.map((a) => (
                    <React.Fragment key={a.id}>
                      <div>{new Date(a.date).toLocaleString("vi-VN")}</div>
                      <div>{a.correct}/{a.total}</div>
                      <div>{a.percent}%</div>
                      <div>{Math.floor(a.durationSec / 60)}p {a.durationSec % 60}s</div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (examId && !examLoaded) {
      return (
        <div className="exam-layout">
          <div className="exam-loading">Đang tải đề thi...</div>
        </div>
      );
    }

    if (examId && notFound) {
      return (
        <div className="exam-layout">
          <div className="exam-loading">Kỳ thi không tồn tại hoặc đã bị xóa.</div>
          <div style={{ marginTop: 12 }}>
            <button className="submit-btn" onClick={() => navigate("/exam")}>Quay về danh sách bài thi</button>
          </div>
        </div>
      );
    }

    return (
      <div className="exam-layout">
        <div className="toast-container" style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
          {notifs.map((n) => (
            <div key={n.id} style={{ padding: "10px 12px", borderRadius: 8, color: "#fff", fontWeight: 600, boxShadow: "0 6px 20px rgba(0,0,0,0.12)", background: n.type === "success" ? "#16a34a" : n.type === "error" ? "#ef4444" : "#2563eb" }}>
              {n.message}
            </div>
          ))}
        </div>
        {/* LEFT CONTENT */}
        <div className="exam-content">
          <h2 className="exam-title">{examDetail?.title || "Bài Thi Java Spring Boot"}</h2>
          <p className="exam-desc">Chọn một đáp án đúng cho mỗi câu hỏi.</p>

          {examQuestions.map((q, idx) => (
            <div key={q.id} className="question-box">
              <h3 className="question-title">
                Câu {idx + 1}: {q.question}
              </h3>

              <div className="answers">
                {q.answers.map((ans, i) => (
                  <button
                    key={i}
                    className={`answer-btn ${ selectedAnswers[q.id] === i ? "selected" : "" }`}
                    onClick={() => selectAnswer(q.id, i)}
                  >
                    <span className="answer-label">{String.fromCharCode(65 + i)}</span>
                    {ans}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="sidebar">
          <div className="timer-box">
            ⏱ Thời gian còn lại:
            <div className="timer">{formatTime(timeLeft)}</div>
          </div>

          <h4 className="sidebar-title">Danh sách câu hỏi</h4>

          <div className="question-list">
            {examQuestions.map((q, i) => (
              <button
                key={q.id}
                className={`question-number ${ selectedAnswers[q.id] !== undefined ? "done" : "" }`}
              >
                {selectedAnswers[q.id] !== undefined
                  ? String.fromCharCode(65 + selectedAnswers[q.id])
                  : i + 1}
              </button>
            ))}
          </div>

          <button className="submit-btn" onClick={() => handleSubmit(false)}>Nộp bài</button>
        </div>
      </div>
    );
  }
