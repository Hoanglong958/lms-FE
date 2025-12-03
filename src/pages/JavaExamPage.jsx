import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./JavaExamPage.css";

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
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 20); // 20 phút
  const startRef = useRef(Date.now());
  const navigate = useNavigate();

  // ⏳ Đồng hồ đếm ngược
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectAnswer = (qid, index) => {
    setSelectedAnswers({ ...selectedAnswers, [qid]: index });
  };

  const handleSubmit = () => {
    const total = QUESTIONS.length;
    let correct = 0;
    for (const q of QUESTIONS) {
      if (selectedAnswers[q.id] === q.correct) correct++;
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
    navigate("/java-exam/result", { state: { id: attempt.id } });
  };

  return (
    <div className="exam-layout">
      {/* LEFT CONTENT */}
      <div className="exam-content">
        <h2 className="exam-title">Bài Thi Java Spring Boot</h2>
        <p className="exam-desc">Chọn một đáp án đúng cho mỗi câu hỏi.</p>

        {QUESTIONS.map((q, idx) => (
          <div key={q.id} className="question-box">
            <h3 className="question-title">
              Câu {idx + 1}: {q.question}
            </h3>

            <div className="answers">
              {q.answers.map((ans, i) => (
                <button
                  key={i}
                  className={`answer-btn ${
                    selectedAnswers[q.id] === i ? "selected" : ""
                  }`}
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
          {QUESTIONS.map((q, i) => (
            <button
              key={q.id}
              className={`question-number ${
                selectedAnswers[q.id] !== undefined ? "done" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button className="submit-btn" onClick={handleSubmit}>Nộp bài</button>
      </div>
    </div>
  );
}
