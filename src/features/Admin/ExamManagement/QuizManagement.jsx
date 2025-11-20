import React, { useEffect, useState } from "react";
import "./QuizManagement.css";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminHeader from "@components/Admin/AdminHeader";
import { quizService } from "@utils/quizService.js";
import { lessonService } from "@utils/lessonService.js";

export default function QuizManagement() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonId, setLessonId] = useState(""); // ✅ khai báo lessonId

  const { toggleSidebar } = useOutletContext() || {};

  // 🟩 Load lessonId từ localStorage khi mount
  useEffect(() => {
    const savedLessonId = localStorage.getItem("quizLessonId") || "";
    if (savedLessonId) setLessonId(savedLessonId);
  }, []);

  // 🟩 Load danh sách lesson từ backend
  useEffect(() => {
    const loadLessons = async () => {
      try {
        const sessionId = 1; // Thay sessionId thực tế nếu cần
        const res = await lessonService.getLessonsBySession(sessionId);
        setLessons(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Load lessons error", err);
        setLessons([]);
      }
    };
    loadLessons();
  }, []);

  // 🟩 Load quizzes khi lessonId thay đổi
  useEffect(() => {
    if (!lessonId) {
      setQuizzes([]);
      return;
    }

    const load = async () => {
      try {
        const res = await quizService.getQuizzesByLessonId(lessonId);
        const quizzesArray = Array.isArray(res.data) ? res.data : [];
        setQuizzes(quizzesArray);
        localStorage.setItem("quizLessonId", lessonId);
      } catch (e) {
        console.error("Load quizzes error", e);
        setQuizzes([]);
      }
    };

    load();
  }, [lessonId]);

  // 🟩 Hành động
  const handleView = (quiz) => navigate(`/admin/quiz/${quiz.quizId}/preview`);
  const handleEdit = (quiz) => navigate(`/admin/quiz/${quiz.quizId}/update`);
  const handleReport = (quiz) => navigate(`/admin/quiz/${quiz.quizId}/report`);

  const handleDelete = async (quiz) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${quiz.title}" không?`)) {
      try {
        await quizService.deleteQuiz(quiz.quizId);
        // update state bằng filter thay vì gọi lại API
        const newQuizzes = quizzes.filter((q) => q.quizId !== quiz.quizId);
        setQuizzes(newQuizzes);
        alert(`Đã xóa quiz: ${quiz.title}`);
      } catch (err) {
        console.error("Delete quiz error", err);
        alert("Xóa quiz thất bại!");
      }
    }
  };

  return (
    <div className="quiz-management-container">
      <AdminHeader
        title="Quản lý Quiz"
        onMenuToggle={toggleSidebar}
        actions={
          <div className="quiz-header-actions">
            <button
              className="quiz-btn bank"
              onClick={() => navigate("/admin/question-bank")}
            >
              📚 Ngân hàng câu hỏi
            </button>
            <button
              className="quiz-btn create"
              onClick={() => navigate("/admin/quiz/create")}
            >
              ➕ Thêm Quiz
            </button>
          </div>
        }
      />

      <div className="quiz-content-page">
        {/* Dropdown chọn lesson */}
        <div className="lesson-select">
          <label>Chọn Lesson: </label>
          <select
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
          >
            <option value="">-- Chọn lesson --</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>

        <div className="quiz-stats">
          <div className="quiz-card">
            <p className="quiz-card-title">Tổng Quiz</p>
            <h3>{quizzes.length}</h3>
          </div>
        </div>

        <div className="quiz-table-section">
          <table className="quiz-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Số câu hỏi</th>
                <th>Điểm tối đa</th>
                <th>Điểm đạt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: "center", padding: "16px" }}
                  >
                    Chưa có quiz nào được tạo.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz.quizId}>
                    <td>{quiz.title}</td>
                    <td>{quiz.questionCount}</td>
                    <td>{quiz.maxScore}</td>
                    <td>{quiz.passingScore}</td>
                    <td className="quiz-actions">
                      <button
                        className="btn-icon report"
                        onClick={() => handleReport(quiz)}
                      >
                        📄
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleView(quiz)}
                      >
                        👁️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(quiz)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(quiz)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
