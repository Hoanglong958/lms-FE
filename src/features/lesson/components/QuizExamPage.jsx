import React, { useState, useEffect } from "react";
import "./QuizExamPage.css";
import { Link, useParams } from "react-router-dom";

const QuizExamPage = () => {
  const { quizId } = useParams();
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Mock data cho các câu hỏi
  const quizQuestions = [
    {
      id: 1,
      title:
        "Trong JavaScript, phương thức nào được sử dụng để thêm một phần tử vào cuối mảng?",
      timeLimit: "00:01:25",
      options: [
        { id: 1, text: "push()", isCorrect: true },
        { id: 2, text: "unshift()", isCorrect: false },
        { id: 3, text: "append()", isCorrect: false },
        { id: 4, text: "concat()", isCorrect: false },
      ],
    },
    {
      id: 2,
      title:
        "Thuộc tính CSS nào được sử dụng để tạo khoảng cách giữa các phần tử trong Flexbox?",
      timeLimit: "00:01:25",
      options: [
        { id: 1, text: "flex-space", isCorrect: false },
        { id: 2, text: "gap", isCorrect: true },
        { id: 3, text: "margin-between", isCorrect: false },
        { id: 4, text: "space-items", isCorrect: false },
      ],
    },
    {
      id: 3,
      title:
        "Trong React, hook nào được sử dụng để thực hiện các tác vụ phụ (side effects)?",
      timeLimit: "00:01:25",
      options: [
        { id: 1, text: "useEffect()", isCorrect: true },
        { id: 2, text: "useState()", isCorrect: false },
        { id: 3, text: "useContext()", isCorrect: false },
        { id: 4, text: "useReducer()", isCorrect: false },
      ],
    },
    {
      id: 4,
      title:
        "Phương thức HTTP nào thường được sử dụng để cập nhật dữ liệu trên server?",
      timeLimit: "00:01:25",
      options: [
        { id: 1, text: "GET", isCorrect: false },
        { id: 2, text: "POST", isCorrect: false },
        { id: 3, text: "PUT", isCorrect: true },
        { id: 4, text: "DELETE", isCorrect: false },
      ],
    },
    {
      id: 5,
      title:
        "Trong CSS, thuộc tính nào được sử dụng để tạo bóng đổ cho phần tử?",
      timeLimit: "00:01:25",
      options: [
        { id: 1, text: "text-shadow", isCorrect: false },
        { id: 2, text: "element-shadow", isCorrect: false },
        { id: 3, text: "box-shadow", isCorrect: true },
        { id: 4, text: "drop-shadow", isCorrect: false },
      ],
    },
    {
      id: 6,
      title:
        "Trong JavaScript, phương thức nào được sử dụng để chuyển đổi một chuỗi JSON thành đối tượng JavaScript?",
      timeLimit: "00:01:25",
      options: [
        { id: 1, text: "JSON.parse()", isCorrect: true },
        { id: 2, text: "JSON.stringify()", isCorrect: false },
        { id: 3, text: "JSON.convert()", isCorrect: false },
        { id: 4, text: "JSON.toObject()", isCorrect: false },
      ],
    },
  ];

  // Lấy câu hỏi hiện tại
  const currentQuestion = quizQuestions[currentQuestionIndex];

  useEffect(() => {
    // Ở đây có thể gọi API để lấy dữ liệu quiz dựa vào quizId
    console.log("Quiz ID:", quizId);
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu quiz
    // fetchQuizData(quizId);
  }, [quizId]);

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null); // Reset lựa chọn khi chuyển câu hỏi
    }
  };

  return (
    <div className="quiz-exam-wrapper">
      <div className="quiz-exam-container">
        <div className="quiz-exam-main">
          <div className="quiz-exam-content">
            <div className="quiz-timer-container">
              <div className="quiz-timer">
                <span>Thời gian còn lại: {currentQuestion.timeLimit}</span>
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
                          ? "selected"
                          : "selected incorrect"
                        : ""
                    }`}
                    onClick={() => handleOptionSelect(option.id)}
                  >
                    <div className="quiz-option-radio">
                      <div
                        className={`radio-outer ${
                          selectedOption === option.id
                            ? option.isCorrect
                              ? "selected"
                              : "selected incorrect"
                            : ""
                        }`}
                      >
                        {selectedOption === option.id && (
                          <div
                            className={`radio-inner ${
                              !option.isCorrect ? "incorrect" : ""
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
                disabled={currentQuestionIndex === quizQuestions.length - 1}
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
      </div>
    </div>
  );
};

export default QuizExamPage;
