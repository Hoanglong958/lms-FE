import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lessonQuizService } from "@utils/lessonQuizService";
import quizIllustration from "@assets/images/quiz-cat-illustration.svg"; // Đảm bảo đúng đường dẫn ảnh
import QuizExamPage from "./QuizExamPage";
import "./QuizComponent.css";

// Helper format ngày
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const QuizComponent = ({ item }) => {
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  // Giả lập progress text (hoặc lấy từ props)
  const progressText = "4/10 Bài học";

  useEffect(() => {
    if (!item?.id) {
      setLoading(false);
      return;
    }

    const fetchQuiz = async () => {
      try {
        const res = await lessonQuizService.getQuizzesByLesson(item.id);
        const quizzes = res.data || [];
        if (quizzes.length > 0) {
          setQuiz(quizzes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [item.id]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  if (loading)
    return <div className="qc-loading">Đang tải bài kiểm tra...</div>;

  // Nếu đã bấm bắt đầu -> Show giao diện làm bài
  if (showQuiz && quiz) {
    return <QuizExamPage quizId={quiz.quizId || quiz.id || item.id} />;
  }

  // Giao diện Intro (Giống Figma)
  const displayTitle = quiz?.title || item.title || "Bài kiểm tra";
  const questionCount = quiz?.questionCount || item.questions || 5; // Fallback số câu
  const description = quiz?.description || "Nội dung đang được cập nhật...";

  return (
    <div className="qc-container">
      {/* 1. INTRO CARD (Phần khung chứa ảnh con mèo và nút) */}
      <div className="qc-intro-card">
        <div className="qc-intro-image">
          <img src={quizIllustration} alt="Quiz Illustration" />
        </div>

        <div className="qc-intro-content">
          <h2 className="qc-card-title">{displayTitle}</h2>
          <p className="qc-card-meta">Bài kiểm tra • {questionCount} câu hỏi</p>
          <p className="qc-card-desc">
            {/* Chỉ hiện 1 đoạn ngắn mô tả trong card thôi cho đẹp */}
            Ornare eu elementum felis porttitor nunc tortor. Ornare neque
            accumsan metus nulla ultricies.
          </p>

          <button className="qc-start-btn" onClick={handleStartQuiz}>
            <span>Bắt đầu làm bài</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.1665 10H15.8332M15.8332 10L9.99984 4.16666M15.8332 10L9.99984 15.8333"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. INFO SECTION (Phần thông tin chi tiết bên dưới - Giống VideoPlayer) */}
      <div className="qc-info-section">
        {/* Header: Title + Progress */}
        <div className="qc-info-header">
          <h1 className="qc-main-title">{displayTitle}</h1>
          <div className="qc-progress">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ccc"
              strokeWidth="2"
              style={{ marginRight: 6 }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{progressText}</span>
          </div>
        </div>

        {/* Date */}
        <div className="qc-meta-date">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>
            {formatDate(quiz?.createdAt || item.createdAt || new Date())}
          </span>
        </div>

        {/* Description Box */}
        <div className="qc-desc-box">
          <h3 className="qc-desc-title">Mô tả</h3>
          <div className="qc-desc-content">
            <p>{description}</p>
            {/* Placeholder text giống ảnh mẫu nếu description ngắn */}
            <p style={{ marginTop: 8, color: "#666" }}>
              Ornare eu elementum felis porttitor nunc tortor. Ornare neque
              accumsan metus nulla ultricies maecenas rhoncus ultrices cras.
              Vestibulum varius adipiscing ipsum pharetra.
            </p>
          </div>
          <button className="qc-btn-more">Xem thêm</button>
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;
