import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { lessonQuizService } from "@utils/lessonQuizService";
import quizIllustration from "@assets/images/quiz-cat-illustration.svg";
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

import { userProgressService } from "@utils/userProgressService"; // Added import

// Nhận prop 'progress'
const QuizComponent = ({ item, progress }) => {
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false); // Toggle state

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
          const basicQuiz = quizzes[0];
          // setQuiz(basicQuiz); // Old logic

          // Fetch Full Details to get Description
          try {
            const detailRes = await lessonQuizService.getQuiz(basicQuiz.id || basicQuiz.quizId);
            setQuiz(detailRes.data);
          } catch (e) {
            console.warn("Failed to fetch full quiz details, using basic info", e);
            setQuiz(basicQuiz);
          }
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

  const handleQuizFinish = async (result) => {
    // Logic: Save progress only if higher than current
    try {
      const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      if (!user.id || !item.id || !item.courseId) {
        console.warn("Missing info to save quiz progress");
        return;
      }

      const score = result.score || 0;
      const maxScore = quiz?.maxScore || 10; // Avoid division by zero
      let newPercent = Math.round((score / maxScore) * 100);
      if (newPercent > 100) newPercent = 100;

      // Fetch current progress
      // Ideally we fetch specifically for this lesson, but getByCourse returns a list.
      // Or we can just blindly save if we trust backend not to overwrite with lower? 
      // User asked explicitly "lưu tiến trình cao nhất".
      // Let's fetch first.
      let currentPercent = 0;
      try {
        const res = await userProgressService.getByCourse(user.id, item.courseId);
        const myProg = (res.data || []).find(p => String(p.lessonId) === String(item.id));
        if (myProg) {
          currentPercent = myProg.progressPercent || 0;
        }
      } catch (e) {
        console.error("Failed to fetch existing progress", e);
      }

      console.log(`Quiz Result: ${newPercent}%. Current: ${currentPercent}%`);

      if (newPercent > currentPercent) {
        await userProgressService.saveLessonProgress({
          userId: user.id,
          lessonId: item.id,
          sessionId: item.sessionId || 0,
          courseId: item.courseId || 0,
          type: "quiz",
          status: newPercent >= 100 ? "COMPLETED" : "IN_PROGRESS",
          progressPercent: newPercent
        });
        console.log("Quiz progress updated.");
      } else {
        console.log("New score not higher than existing progress. Skipping update.");
      }

    } catch (e) {
      console.error("Error saving quiz progress", e);
    }
  };

  if (loading)
    return <div className="qc-loading">Đang tải bài kiểm tra...</div>;

  if (showQuiz && quiz) {
    return (
      <QuizExamPage
        quizId={quiz.quizId || quiz.id || item.id}
        onFinish={handleQuizFinish}
      />
    );
  }

  const displayTitle = quiz?.title || item.title || "Bài kiểm tra";
  const questionCount = quiz?.questionCount || item.questions || 5;
  const description = quiz?.description || "Nội dung đang được cập nhật...";

  return (
    <div className="qc-container">
      {/* 1. INTRO CARD */}
      <div className="qc-intro-card">
        <div className="qc-intro-image">
          <img src={quizIllustration} alt="Quiz Illustration" />
        </div>

        <div className="qc-intro-content">
          <h2 className="qc-card-title">{displayTitle}</h2>
          <p className="qc-card-meta">Bài kiểm tra • {questionCount} câu hỏi</p>


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

          {/* New History Button */}
          <button
            className="qc-history-btn"
            onClick={() => setShowHistory(true)}
            style={{
              marginTop: "10px",
              background: "none",
              border: "none",
              color: "#666",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Xem lịch sử làm bài
          </button>
        </div>
      </div>

      <div className="qc-info-section">
        <div className="qc-info-header">
          <h1 className="qc-main-title">{displayTitle}</h1>
          <div className="qc-progress-badge">
            {(() => {
              // Extract numbers from "1/10 Bài học" string
              const match = typeof progress === 'string' ? progress.match(/(\d+)\/(\d+)/) : null;
              const current = match ? parseInt(match[1]) : 0;
              const total = match ? parseInt(match[2]) : 1;
              const percent = total > 0 ? Math.round((current / total) * 100) : 0;

              // SVG Logic for Circle
              const radius = 18;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (percent / 100) * circumference;

              return (
                <>
                  <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="24" cy="24" r={radius} stroke="#E0E0E0" strokeWidth="4" fill="none" />
                      <circle
                        cx="24" cy="24" r={radius}
                        stroke="#F05123" strokeWidth="4" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 'bold', color: '#333'
                    }}>
                      {percent}%
                    </div>
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#333' }}>
                    {current}/{total} Bài học
                  </span>
                </>
              );
            })()}
          </div>
        </div>

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
            Cập nhật: {formatDate(quiz?.createdAt || item.createdAt || new Date())}
          </span>
        </div>




        {/* 3. HISTORY MODAL */}
        {showHistory && (
          <div className="qc-modal-overlay" onClick={() => setShowHistory(false)} style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <div className="qc-modal-content" onClick={e => e.stopPropagation()} style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "500px",
              maxWidth: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative"
            }}>
              <button
                onClick={() => setShowHistory(false)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  border: "none",
                  background: "none",
                  fontSize: "18px",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
              <QuizHistory quizId={quiz?.id || item.id} />
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

const QuizHistory = ({ quizId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!quizId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        // 1. Get User ID
        const userStr = localStorage.getItem("loggedInUser");
        let userId = 0;
        if (userStr) {
          const u = JSON.parse(userStr);
          userId = u.id;
        }

        if (!userId) {
          setLoading(false);
          return;
        }

        // 2. Fetch all results (Assuming API returns list)
        // Check if there is an API to get by user, otherwise filter client side
        // Using existing getResults which might return all. 
        // If the list is huge, this is not ideal, but following current instructions.
        const res = await import("@utils/quizResultService").then(m => m.quizResultService.getResults());

        // 3. Filter for this user and this quiz
        // Note: The structure of response data might be res.data or res
        const allResults = Array.isArray(res.data) ? res.data : [];
        console.log("All Results:", allResults);
        console.log("Filtering by:", { quizId, userId });

        const myHistory = allResults.filter(
          (r) => r.quizId == quizId && r.userId == userId
        );

        console.log("Filtered History:", myHistory);

        // Sort by submittedAt desc
        myHistory.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        setHistory(myHistory);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [quizId]);

  if (loading) return <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>Đang tải lịch sử...</div>;
  if (history.length === 0) return <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>Chưa có lịch sử làm bài.</div>;

  return (
    <div className="qc-history-section" style={{ marginTop: "20px" }}>
      <h3 className="qc-desc-title">Lịch sử làm bài</h3>
      <div className="qc-history-table-container">
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5", textAlign: "left" }}>
              <th style={{ padding: "8px", border: "1px solid #eee" }}>STT</th>
              <th style={{ padding: "8px", border: "1px solid #eee" }}>Ngày nộp</th>
              <th style={{ padding: "8px", border: "1px solid #eee" }}>Điểm số</th>
              <th style={{ padding: "8px", border: "1px solid #eee" }}>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, index) => (
              <tr key={h.id || index}>
                <td style={{ padding: "8px", border: "1px solid #eee" }}>{index + 1}</td>
                <td style={{ padding: "8px", border: "1px solid #eee" }}>
                  {h.submittedAt ? new Date(h.submittedAt).toLocaleString("vi-VN") : "N/A"}
                </td>
                <td style={{ padding: "8px", border: "1px solid #eee" }}>{h.score}</td>
                <td style={{ padding: "8px", border: "1px solid #eee" }}>
                  <span
                    style={{
                      color: h.isPassed ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {h.isPassed ? "Đạt" : "Chưa đạt"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuizComponent;
