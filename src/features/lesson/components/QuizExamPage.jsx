import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { lessonQuizService } from "@utils/lessonQuizService.js";
import { quizQuestionService } from "@utils/quizQuestionService.js";
import { questionService } from "@utils/questionService.js";

import "./QuizExamPage.css";

export default function QuizExamPage({ quizId }) {
  const params = useParams();
  const quizIdFromParams = params.quizId || quizId;

  const [quizInfo, setQuizInfo] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userSelections, setUserSelections] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const timerRef = useRef(null);

  // ================== LOAD QUIZ DATA ==================
  useEffect(() => {
    if (!quizIdFromParams) return;

    (async () => {
      try {
        const quizRes = await lessonQuizService.getQuiz(quizIdFromParams);
        setQuizInfo(quizRes.data);

        const quizQsRes = await quizQuestionService.getByQuiz(quizIdFromParams);
        const quizQs = quizQsRes.data || [];

        const detailedQuestions = [];
        for (const q of quizQs) {
          try {
            const detail = await questionService.getById(q.questionId);
            const optionLetters = ["A", "B", "C", "D"];
            const options = detail.data.options.map((text, index) => ({
              id: index + 1,
              text,
              isCorrect: optionLetters[index] === detail.data.correctAnswer,
            }));
            detailedQuestions.push({
              id: detail.data.id,
              title: detail.data.questionText,
              timeLimit: detail.data.timeLimit || "00:01:00",
              options,
            });
          } catch (err) { }
        }
        setQuizQuestions(detailedQuestions);
        if (detailedQuestions[0])
          setTimeRemaining(
            convertTimeToSeconds(detailedQuestions[0].timeLimit)
          );
      } catch (err) { }
    })();
  }, [quizIdFromParams]);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  // ================== TIME HELPERS ==================
  const convertTimeToSeconds = (timeString) => {
    const [h, m, s] = timeString.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `00:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ================== TIMER ==================
  useEffect(() => {
    if (!currentQuestion) return;
    setTimeRemaining(convertTimeToSeconds(currentQuestion.timeLimit));

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (currentQuestionIndex < quizQuestions.length - 1)
            setCurrentQuestionIndex((i) => i + 1);
          else finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentQuestionIndex, currentQuestion]);

  // ================== USER ACTIONS ==================
  const handleOptionSelect = (optionId) => {
    setUserSelections((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionId,
    }));
  };

  const handleSidebarClick = (idx) => {
    setCurrentQuestionIndex(idx);
  };

  const finishQuiz = () => {
    if (!quizInfo) return;

    const perQuestionScore = quizInfo.maxScore / quizQuestions.length;
    let totalScore = 0;

    quizQuestions.forEach((q, idx) => {
      const selected = userSelections[idx];
      const correct = q.options.find((o) => o.isCorrect);
      if (selected === correct?.id) totalScore += perQuestionScore;
    });

    setScore(totalScore);
    setIsQuizCompleted(true);
    clearInterval(timerRef.current);
  };

  // ================== RENDER ==================
  if (!quizInfo || quizQuestions.length === 0) return <p>Đang tải quiz...</p>;

  if (isQuizCompleted) {
    const isPassed = score >= quizInfo.passingScore;
    return (
      <div className="quiz-exam-wrapper">
        <div className="quiz-exam-main quiz-result">
          <h2>
            Kết quả: {score}/{quizInfo.maxScore}
          </h2>
          <p>{isPassed ? "Bạn đã vượt qua!" : "Bạn chưa đạt yêu cầu."}</p>
          <button onClick={() => window.location.reload()}>Làm lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-exam-wrapper" style={{ display: "flex" }}>
      <div className="quiz-exam-main" style={{ flex: 1 }}>
        <div className="quiz-timer-container">
          <div className="quiz-timer">
            Thời gian còn lại: {formatTime(timeRemaining)}
          </div>
          <div className="quiz-question-number">
            Câu {currentQuestionIndex + 1}/{quizQuestions.length}
          </div>
        </div>

        <div className="quiz-question-title">{currentQuestion.title}</div>

        <div className="quiz-options-container">
          {currentQuestion.options.map((opt) => (
            <div
              key={opt.id}
              className={`quiz-option ${userSelections[currentQuestionIndex] === opt.id
                ? "selected"
                : ""
                }`}
              onClick={() => handleOptionSelect(opt.id)}
            >
              {opt.text}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            if (currentQuestionIndex < quizQuestions.length - 1)
              setCurrentQuestionIndex((i) => i + 1);
            else finishQuiz();
          }}
          className="quiz-next-button"
        >
          {currentQuestionIndex === quizQuestions.length - 1
            ? "Hoàn thành"
            : "Câu tiếp theo"}
        </button>
      </div>

      <div className="quiz-sidebar">
        <h3>Danh sách câu hỏi</h3>
        <ul>
          {quizQuestions.map((q, idx) => {
            const sel = userSelections[idx];
            const cls =
              idx === currentQuestionIndex ? "current" : sel ? "selected" : "";
            return (
              <li
                key={q.id}
                className={cls}
                onClick={() => handleSidebarClick(idx)}
              >
                Câu {idx + 1}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
