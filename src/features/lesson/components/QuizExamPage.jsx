import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { lessonQuizService } from "@utils/lessonQuizService.js";
import { quizQuestionService } from "@utils/quizQuestionService.js";
import { questionService } from "@utils/questionService.js";
import { quizResultService } from "@utils/quizResultService.js";
import { quizAttemptService } from "@utils/quizAttemptService.js"; // Added import

import "./QuizExamPage.css";

export default function QuizExamPage({ quizId, attemptId, onFinish, onNextLesson }) {
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
            // Lấy chi tiết câu hỏi từ Ngân hàng câu hỏi
            const detail = await questionService.getById(q.questionId);
            const optionLetters = ["A", "B", "C", "D"];

            // Xử lý options và xác định đáp án đúng cho Client chấm điểm (Display only)
            const options = detail.data.options.map((text, index) => ({
              id: index + 1,
              text,
              // Logic kiểm tra đáp án đúng tại Client
              isCorrect: optionLetters[index] === detail.data.correctAnswer || text === detail.data.correctAnswer,
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
    const answers = [];
    quizQuestions.forEach((q, idx) => {
      const selectedOptionId = Number(userSelections[idx]);
      if (Number.isFinite(selectedOptionId) && selectedOptionId > 0) {
        // Find the selected option object
        const selectedOption = q.options.find(opt => opt.id === selectedOptionId);
        // Use the text content as the answer to match Question Bank data
        const answerText = selectedOption ? String(selectedOption.text).trim() : "";

        answers.push({
          questionId: q.id,
          answer: answerText, // Gửi Text chuẩn
          answerIndex: selectedOptionId - 1, // Gửi Index chuẩn tuân thủ API cũ
        });
      }
    });

    const payload = {
      quizId: parseInt(quizIdFromParams),
      userId: userId,
      answers: answers,
    };

    console.log("Submission Payload:", JSON.stringify(payload, null, 2));

    try {
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
      const max = Number(quizInfo?.maxScore) || 10;
      const localScore = max > 0 && localTotal > 0 ? Math.round((localCorrect / localTotal) * max * 10) / 10 : 0;

      // Determine if passed
      // Passing score might be percentage (e.g. 50%) or absolute value.
      // Based on UI "50% passing", let's assume if maxScore is 10, passing is 5.
      // Or check quizInfo.passingScore if available.
      let isPassed = false;
      if (Number.isFinite(Number(quizInfo?.passingScore))) {
        isPassed = localScore >= Number(quizInfo.passingScore);
      } else {
        // Default 50%
        isPassed = (localScore / max) >= 0.5;
      }

      let res;
      let finalResult;

      // LOGIC CHANGE: If we don't have an attemptId yet, create one now (Lazy Creation)
      let currentAttemptId = attemptId;

      if (!currentAttemptId) {
        try {
          // Create attempt now
          const startRes = await quizAttemptService.startAttempt({
            quizId: parseInt(quizIdFromParams),
            userId: userId
          });
          const startData = startRes.data || {};
          currentAttemptId = startData.attemptId || startData.id;
          console.log("Lazy-created Attempt ID:", currentAttemptId);
        } catch (startErr) {
          console.error("Failed to lazy-start quiz attempt", startErr);
          // Maybe show specific error?
          throw startErr;
        }
      }

      if (currentAttemptId) {
        // New flow: Submit calculated stats to Quiz Attempt API
        const payloadStats = {
          score: localScore,
          correctCount: localCorrect,
          totalCount: localTotal,
          passed: isPassed
        };
        console.log("Submitting Attempt Payload:", JSON.stringify(payloadStats, null, 2));
        res = await quizAttemptService.submitAttempt(currentAttemptId, payloadStats);

        // API returns the attempt object. Map it to local state result format.
        const attemptData = res.data || {};
        finalResult = {
          score: attemptData.score ?? localScore, // Use server value if present
          correctCount: attemptData.correctCount ?? localCorrect,
          totalCount: attemptData.totalCount ?? localTotal,
          isPassed: attemptData.passed ?? isPassed
        };

      } else {
        // Old flow: Submit to Quiz Result API (Fallback if lazy creation failed or logic dictates)
        console.warn("No attemptId available, falling back to legacy quizResultService");
        res = await quizResultService.submitQuiz(payload);
        finalResult = res?.data || {};

        // Apply fallback for old logic if server returned incomplete data
        const needFallback = (!Number.isFinite(Number(finalResult?.score)) || Number(finalResult?.score) === 0) && localCorrect > 0;
        if (needFallback) {
          finalResult = {
            ...finalResult,
            correctCount: localCorrect,
            totalCount: localTotal,
            score: localScore,
            isPassed: isPassed,
          };
        }
      }

      setSubmissionResult(finalResult);
      setIsQuizCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);

      // Trigger callback (for progress saving in parent)
      if (onFinish) {
        onFinish(finalResult);
      }
    } catch (error) {
      console.error("Submit quiz error:", error);
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

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setUserSelections({});
    setIsQuizCompleted(false);
    setSubmissionResult(null);
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
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={handleRetry}>Làm lại</button>
            {submissionResult.isPassed && onNextLesson && (
              <button
                className="quiz-next-lesson-btn"
                onClick={onNextLesson}
                style={{
                  backgroundColor: "#F05123",
                  color: "#fff",
                  border: "none"
                }}
              >
                Bài tiếp theo
              </button>
            )}
          </div>
        </div>
      </div>
    );
  } else if (isQuizCompleted) {
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
