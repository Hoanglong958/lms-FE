import React, { useState, useEffect, useCallback, useRef } from "react";
import "./QuizExamPage.css";
import { Link, useParams } from "react-router-dom";

const QuizExamPage = ({ quizId }) => {
  const params = useParams();
  const quizIdFromParams = params.quizId || quizId;

  const [selectedOption, setSelectedOption] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(85); // 85 giây (00:01:25)
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const timerRef = useRef(null);

  // Dữ liệu câu hỏi
  const quizQuestions = [
    {
      id: 1,
      title: "Trong JavaScript, phương thức nào được sử dụng để thêm một phần tử vào cuối mảng?",
      timeLimit: "00:10:00",
      options: [
        { id: 1, text: "push()", isCorrect: true },
        { id: 2, text: "unshift()", isCorrect: false },
        { id: 3, text: "append()", isCorrect: false },
        { id: 4, text: "concat()", isCorrect: false },
      ],
    },
    {
      id: 2,
      title: "Thuộc tính CSS nào được sử dụng để tạo khoảng cách giữa các phần tử trong Flexbox?",
      timeLimit: "00:10:00",
      options: [
        { id: 1, text: "flex-space", isCorrect: false },
        { id: 2, text: "gap", isCorrect: true },
        { id: 3, text: "margin-between", isCorrect: false },
        { id: 4, text: "space-items", isCorrect: false },
      ],
    },
    {
      id: 3,
      title: "Trong React, hook nào được sử dụng để thực hiện các tác vụ phụ (side effects)?",
      timeLimit: "00:10:00",
      options: [
        { id: 1, text: "useEffect()", isCorrect: true },
        { id: 2, text: "useState()", isCorrect: false },
        { id: 3, text: "useContext()", isCorrect: false },
        { id: 4, text: "useReducer()", isCorrect: false },
      ],
    },
    {
      id: 4,
      title: "Phương thức HTTP nào thường được sử dụng để cập nhật dữ liệu trên server?",
      timeLimit: "00:10:00",
      options: [
        { id: 1, text: "GET", isCorrect: false },
        { id: 2, text: "POST", isCorrect: false },
        { id: 3, text: "PUT", isCorrect: true },
        { id: 4, text: "DELETE", isCorrect: false },
      ],
    },
    {
      id: 5,
      title: "Trong CSS, thuộc tính nào được sử dụng để tạo bóng đổ cho phần tử?",
      timeLimit: "00:10:00",
      options: [
        { id: 1, text: "text-shadow", isCorrect: false },
        { id: 2, text: "element-shadow", isCorrect: false },
        { id: 3, text: "box-shadow", isCorrect: true },
        { id: 4, text: "drop-shadow", isCorrect: false },
      ],
    },
    {
      id: 6,
      title: "Trong JavaScript, phương thức nào được sử dụng để chuyển đổi một chuỗi JSON thành đối tượng JavaScript?",
      timeLimit: "00:10:00",
      options: [
        { id: 1, text: "JSON.parse()", isCorrect: true },
        { id: 2, text: "JSON.stringify()", isCorrect: false },
        { id: 3, text: "JSON.convert()", isCorrect: false },
        { id: 4, text: "JSON.toObject()", isCorrect: false },
      ],
    },
  ];

  const currentQuestion = quizQuestions[currentQuestionIndex];

  // Chuyển đổi thời gian "00:MM:SS" -> giây
  const convertTimeToSeconds = (timeString) => {
    const [minutes, seconds] = timeString.split(":").slice(1).map(Number);
    return minutes * 60 + seconds;
  };

  // Chuyển giây -> "00:MM:SS"
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `00:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Hết thời gian
  const handleTimeUp = useCallback(() => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    }
  }, [currentQuestionIndex, quizQuestions.length]);

  // Khi chuyển câu hỏi
  useEffect(() => {
    if (currentQuestion) {
      const seconds = convertTimeToSeconds(currentQuestion.timeLimit);
      setTimeRemaining(seconds);
      setIsTimerActive(true);
      setHasAnswered(false);
    }
  }, [currentQuestionIndex]);

  // Đếm ngược
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, handleTimeUp]);

  // Chọn đáp án
  const handleOptionSelect = (optionId) => {
    if (hasAnswered) return;
    setSelectedOption(optionId);
    setHasAnswered(true);
    setIsTimerActive(false);
  };

  // Chuyển câu tiếp theo
  const handleNextQuestion = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const correctOption = currentQuestion.options.find((opt) => opt.isCorrect);
    const isCorrect = selectedOption === correctOption.id;

    setUserAnswers([
      ...userAnswers,
      { questionIndex: currentQuestionIndex, selectedOption, isCorrect },
    ]);

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setIsTimerActive(true);
    } else {
      completeQuiz();
    }
  };

  // Hoàn thành bài kiểm tra
  const completeQuiz = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const correctOption = currentQuestion.options.find((opt) => opt.isCorrect);
    const isLastCorrect = selectedOption === correctOption.id;

    const correctAnswers =
      userAnswers.filter((a) => a.isCorrect).length + (isLastCorrect ? 1 : 0);

    setScore(correctAnswers);
    setIsQuizCompleted(true);
    setIsTimerActive(false);
  };

  // Làm lại
  const resetQuiz = () => {
    setSelectedOption(null);
    setCurrentQuestionIndex(0);
    const firstTime = convertTimeToSeconds(quizQuestions[0].timeLimit);
    setTimeRemaining(firstTime);
    setHasAnswered(false);
    setIsTimerActive(true);
    setIsQuizCompleted(false);
    setUserAnswers([]);
  };

  // Nếu đã hoàn thành quiz
  if (isQuizCompleted) {
    const isPassed = score >= quizQuestions.length / 2;
    const resultMessage = isPassed
      ? "Chúc mừng bạn đã hoàn thành!"
      : "Bạn chưa vượt qua bài kiểm tra!";
    const resultDescription = isPassed
      ? "Hãy tiếp tục phát huy để đạt được nhiều thành tích hơn"
      : "Hãy cố gắng ôn tập lại kiến thức của mình";

    return (
      <div className="quiz-exam-wrapper">
        <div className="quiz-content">
          <div className="result-cat-image">
            {isPassed ? (
              <img src="/cat-result.png" alt="Quiz Result Success" />
            ) : (
              <img src="/cat-fail.png" alt="Quiz Result Fail" />
            )}
          </div>
          <div className="result-score-section">
            <div className="result-score-circle">
              <span className="result-score-text">
                {score}/{quizQuestions.length}
              </span>
            </div>
            <h2 className="result-title">{resultMessage}</h2>
            <p className="result-description">{resultDescription}</p>
          </div>
          <div className="result-actions">
            <button className="result-button learn-more" onClick={resetQuiz}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 3.33334V12.6667"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.33331 8H12.6666"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Làm lại
            </button>
            <button className="result-button try-again">
              <span>Bài học tiếp theo</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.33331 8H12.6666"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 3.33334L12.6667 8.00001L8 12.6667"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện câu hỏi
  return (
    <div className="quiz-exam-wrapper">
      <div className="quiz-exam-main">
        <div className="quiz-timer-container">
          <div className="quiz-timer">
            <span>
              Thời gian còn lại:{" "}
              {timeRemaining !== null ? formatTime(timeRemaining) : "00:00:00"}
            </span>
          </div>
          <div className="quiz-question-number">
            <span>
              Câu số {currentQuestionIndex + 1}/{quizQuestions.length}
            </span>
          </div>
        </div>

        <div className="quiz-question-container">
          <h2 className="quiz-question-title">{currentQuestion.title}</h2>

          <div className="quiz-options-container">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`quiz-option ${
                  selectedOption === option.id
                    ? option.isCorrect
                      ? "selected correct"
                      : "selected incorrect"
                    : ""
                } ${hasAnswered && selectedOption !== option.id ? "disabled" : ""}`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="quiz-option-radio">
                  <div
                    className={`radio-outer ${
                      selectedOption === option.id
                        ? option.isCorrect
                          ? "selected correct"
                          : "selected incorrect"
                        : ""
                    }`}
                  >
                    {selectedOption === option.id && (
                      <div
                        className={`radio-inner ${
                          option.isCorrect ? "correct" : "incorrect"
                        }`}
                      ></div>
                    )}
                  </div>
                </div>
                <div className="quiz-option-text">{option.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="quiz-navigation-bottom">
          <button
            className="quiz-next-button"
            onClick={handleNextQuestion}
            disabled={!hasAnswered}
          >
            {currentQuestionIndex === quizQuestions.length - 1
              ? "Hoàn thành"
              : "Câu tiếp theo"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.1665 10H15.8332M15.8332 10L9.99984 4.16666M15.8332 10L9.99984 15.8333"
                stroke="currentColor"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizExamPage;
