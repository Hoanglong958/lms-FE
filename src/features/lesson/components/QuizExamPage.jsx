import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { lessonQuizService } from "@utils/lessonQuizService.js";
import { quizQuestionService } from "@utils/quizQuestionService.js";
import { questionService } from "@utils/questionService.js";
import { quizResultService } from "@utils/quizResultService.js";

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
          } catch (err) { console.error(err); }
        }
        setQuizQuestions(detailedQuestions);
        if (detailedQuestions[0])
          setTimeRemaining(
            convertTimeToSeconds(detailedQuestions[0].timeLimit)
          );
      } catch (err) { console.error(err); }
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


  const [submissionResult, setSubmissionResult] = useState(null);

  // ... (existing code for render)

  const finishQuiz = async () => {
    if (!quizInfo) return;

    // Get Logged In User
    const userStr = localStorage.getItem("loggedInUser");
    let userId = 0;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        userId = u.id;
      } catch (e) {
        console.error("Error parsing loggedInUser", e);
      }
    }
    if (!Number.isFinite(Number(userId)) || Number(userId) <= 0) {
      alert("Bạn cần đăng nhập để nộp bài");
      return;
    }

    // Map answers
    // Question options map to 1, 2, 3, 4 -> A, B, C, D
    const answers = [];
    const optionMap = ["A", "B", "C", "D"];
    quizQuestions.forEach((q, idx) => {
      const selectedOptionId = Number(userSelections[idx]);
      if (Number.isFinite(selectedOptionId) && selectedOptionId > 0) {
        const answerChar = optionMap[selectedOptionId - 1] || "";
        answers.push({
          questionId: q.id,
          answer: answerChar,
          answerIndex: selectedOptionId - 1,
        });
      }
    });

    const payload = {
      quizId: parseInt(quizIdFromParams),
      userId: userId,
      answers: answers,
    };

    console.log("Logged In User Raw:", userStr);
    console.log("Parsed User ID:", userId);
    console.log("Submission Payload:", JSON.stringify(payload, null, 2));

    try {
      const res = await quizResultService.submitQuiz(payload);
      const serverResult = res?.data || {};
      let finalResult = serverResult;

      const optionIsCorrect = (idx, selId) => {
        const q = quizQuestions[idx];
        const opt = q && Array.isArray(q.options) ? q.options[Number(selId) - 1] : undefined;
        return !!(opt && opt.isCorrect);
      };
      const localCorrect = quizQuestions.reduce((acc, _q, idx) => {
        const sel = Number(userSelections[idx]);
        return acc + (Number.isFinite(sel) && sel > 0 && optionIsCorrect(idx, sel) ? 1 : 0);
      }, 0);
      const localTotal = quizQuestions.length;
      const max = Number(quizInfo?.maxScore) || localTotal || 0;
      const localScore = max > 0 ? Math.round((localCorrect / (localTotal || 1)) * max) : localCorrect;

      const needFallback = (!Number.isFinite(Number(serverResult?.score)) || Number(serverResult?.score) === 0) && localCorrect > 0;
      if (needFallback) {
        finalResult = {
          ...serverResult,
          correctCount: localCorrect,
          totalCount: localTotal,
          score: localScore,
          isPassed: Number.isFinite(Number(quizInfo?.passingScore)) ? localScore >= Number(quizInfo.passingScore) : undefined,
        };
      }

      setSubmissionResult(finalResult);
      setIsQuizCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (error) {
      console.error("Submit quiz error:", error);
      console.log("Error Response Data:", error.response?.data);
      let errorMessage = error.message;
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data, null, 2);
        } else {
          errorMessage = error.response.data;
        }
      }
      alert(`Nộp bài thất bại: ${errorMessage}`);
    }
  };

  // ================== RENDER ==================
  if (!quizInfo || quizQuestions.length === 0) return <p>Đang tải quiz...</p>;

  if (isQuizCompleted && submissionResult) {
    return (
      <div className="quiz-exam-wrapper">
        <div className="quiz-exam-main quiz-result">
          <h2>
            Kết quả: {submissionResult.score}/{quizInfo.maxScore}
          </h2>
          <p>
            Số câu đúng: {submissionResult.correctCount}/{submissionResult.totalCount}
          </p>
          <p>
            {submissionResult.isPassed
              ? "Chúc mừng! Bạn đã vượt qua bài kiểm tra."
              : "Rất tiếc, bạn chưa đạt yêu cầu."}
          </p>
          <button onClick={() => window.location.reload()}>Làm lại</button>
        </div>
      </div>
    );
  } else if (isQuizCompleted) {
    // Fallback if completed but no result yet (shouldn't happen with await, but safety)
    return <p>Đang xử lý kết quả...</p>;
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
