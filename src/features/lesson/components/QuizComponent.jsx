import React from "react";
import quizIllustration from "@assets/images/quiz-cat-illustration.svg";

const QuizComponent = ({ item }) => {
  return (
    <div className="quiz-wrapper">
      <img src={quizIllustration} alt="Quiz" className="quiz-illustration" />
      <div className="quiz-content">
        <div className="quiz-content-title-group">
          <h2 className="quiz-title">{item.title}</h2>
          <p className="quiz-meta">Bài kiểm tra • {item.questions} câu hỏi</p>
          <p>{item.content || "Nội dung đang được cập nhật..."}</p>
        </div>
        <p className="quiz-summary">{item.summary}</p>
        <button className="start-quiz-button">
          <span>Bắt đầu làm bài</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="start-quiz-arrow"
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
  );
};

export default QuizComponent;
