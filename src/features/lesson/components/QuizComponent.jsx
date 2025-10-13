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
      </div>
      <button className="start-quiz-button">
        Bắt đầu làm bài
        <span className="arrow-icon"></span>
      </button>
    </div>
  );
};

export default QuizComponent;
