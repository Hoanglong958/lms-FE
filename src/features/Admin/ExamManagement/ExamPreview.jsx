import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ExamPreview.module.css";

export default function ExamPreview() {
  const navigate = useNavigate();

  const questions = [
    {
      id: 1,
      question: "React là thư viện hay framework?",
      answers: ["Framework", "Library", "Công cụ build", "Module"],
      correct: 1,
    },
    {
      id: 2,
      question: "Hook nào dùng để quản lý state trong component?",
      answers: ["useEffect", "useState", "useRef", "useMemo"],
      correct: 1,
    },
    {
      id: 3,
      question: "JSX là gì?",
      answers: [
        "Ngôn ngữ riêng của React",
        "Cú pháp mở rộng của JavaScript",
        "Công cụ biên dịch",
        "Thư viện CSS",
      ],
      correct: 1,
    },
    {
      id: 4,
      question: "Props dùng để làm gì trong React?",
      answers: [
        "Lưu state cục bộ",
        "Truyền dữ liệu giữa các component",
        "Render danh sách",
        "Tạo sự kiện click",
      ],
      correct: 1,
    },
    {
      id: 5,
      question: "Lệnh nào dùng để tạo project React?",
      answers: [
        "npm create-react",
        "npm create vite@latest",
        "npx create-react-app",
        "yarn init react",
      ],
      correct: 2,
    },
  ];

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút

  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted]);

  const handleAnswer = (qid, index) => {
    if (!submitted) setAnswers({ ...answers, [qid]: index });
  };

  const handleSubmit = () => {
    let total = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct) total++;
    });
    setScore(total);
    setSubmitted(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <div className={styles.quizPreviewContainer}>
      <div className={styles.quizPreviewHeader}>
        <h2>📝 Bài kiểm tra thử</h2>
        <p>
          Thời gian còn lại: <strong>{formatTime(timeLeft)}</strong>
        </p>
      </div>

      {!submitted ? (
        <div>
          {questions.map((q) => (
            <div key={q.id} className={styles.quizQuestion}>
              <h4>
                {q.id}. {q.question}
              </h4>
              <div className={styles.quizOptions}>
                {q.answers.map((ans, idx) => (
                  <label key={idx} className={styles.quizOption}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === idx}
                      onChange={() => handleAnswer(q.id, idx)}
                    />
                    {ans}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.quizActions}>
            <button className={styles.btnBack} onClick={() => navigate(-1)}>
              ← Quay lại
            </button>
            <button className={styles.btnSubmit} onClick={handleSubmit}>
              Nộp bài
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.quizResult}>
          <h3>🎯 Kết quả thi thử</h3>
          <p>
            Bạn đúng <strong>{score}</strong> / {questions.length} câu (
            {Math.round((score / questions.length) * 100)}%)
          </p>
          <button className={styles.btnBack} onClick={() => navigate(-1)}>
            ← Quay lại trang quản lý
          </button>
        </div>
      )}
    </div>
  );
}

