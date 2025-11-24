import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lessonQuizService } from "@utils/lessonQuizService";
import quizIllustration from "@assets/images/quiz-cat-illustration.svg";
import QuizExamPage from "./QuizExamPage";

const QuizComponent = ({ item }) => {
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item?.id) {
      setLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      try {
        // Fetch quiz theo lessonId giống như Admin
        const res = await lessonQuizService.getQuizzesByLesson(item.id);
        const quizzes = res.data || [];
        if (quizzes.length > 0) {
          setQuiz(quizzes[0]);
        }
      } catch (err) {
        console.error("Lỗi tải quiz:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [item.id]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  if (loading) {
    return <div className="quiz-wrapper">Đang tải quiz...</div>;
  }

  if (!quiz) {
    return <div className="quiz-wrapper">Chưa có quiz</div>;
  }

  return (
    <div className="quiz-wrapper">
      {!showQuiz ? (
        <>
          <img
            src={quizIllustration}
            alt="Quiz"
            className="quiz-illustration"
          />
          <div className="quiz-content">
            <div className="quiz-content-title-group">
              <h2 className="quiz-title">{quiz.title || item.title}</h2>
              <p className="quiz-meta">
                Bài kiểm tra • {quiz.questionCount || item.questions || 0} câu hỏi
              </p>
              <p>{quiz.description || item.content || "Nội dung đang được cập nhật..."}</p>
            </div>
            <p className="quiz-summary">{item.summary}</p>
            <button className="start-quiz-button" onClick={handleStartQuiz}>
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
        </>
      ) : (
        <QuizExamPage quizId={quiz.quizId || item.id} />
      )}
    </div>
  );
};

export default QuizComponent;
