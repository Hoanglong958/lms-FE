import React, { useEffect, useState } from "react";
import "./QuizManagement.css";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminHeader from "@components/Admin/AdminHeader";
import { quizService } from "@utils/quizService.js";

export default function QuizManagement() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [lessonId, setLessonId] = useState("");

  useEffect(() => {
    if (!lessonId) {
      setQuizzes([]);
      return;
    }
    const load = async () => {
      try {
        const res = await quizService.getQuizzesByLesson(lessonId);
        const data = res.data?.data || res.data || [];
        setQuizzes(Array.isArray(data) ? data : []);
      } catch (e) {
        setQuizzes([]);
      }
    };
    load();
  }, [lessonId]);

  // 🟩 Hành động
  const handleView = (quiz) => {
    navigate(`/admin/quiz/${quiz.id}/preview`);
  };

  const handleEdit = (quiz) => {
    navigate(`/admin/quiz/${quiz.id}/update`);
  };

  const handleDelete = async (quiz) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${quiz.name}" không?`)) {
      await quizService.deleteQuiz(quiz.id);
      const res = await quizService.getQuizzesByLesson(lessonId);
      const data = res.data?.data || res.data || [];
      setQuizzes(Array.isArray(data) ? data : []);
      alert(`Đã xóa quiz: ${quiz.name}`);
    }
  };

  const handleReport = (quiz) => {
    navigate(`/admin/quiz/${quiz.id}/report`);
  };

  const { toggleSidebar } = useOutletContext() || {};

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
        <div className="quiz-stats">
          <div className="quiz-card">
            <p className="quiz-card-title">Tổng Quiz</p>
            <h3>{quizzes.length}</h3>
          </div>
        </div>

        <div className="quiz-table-section">
          <input
            type="text"
            placeholder="Nhập lessonId để tải danh sách..."
            className="quiz-search"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
          />

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
                  <td colSpan="8" style={{ textAlign: "center", padding: "16px" }}>
                    Chưa có quiz nào được tạo.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td>{quiz.title}</td>
                    <td>{quiz.questionCount}</td>
                    <td>{quiz.maxScore}</td>
                    <td>{quiz.passingScore}</td>
                    <td className="quiz-actions">
                      <button className="btn-icon report" onClick={() => handleReport(quiz)}>
                        📄
                      </button>
                      <button className="btn-icon" onClick={() => handleView(quiz)}>
                        👁️
                      </button>
                      <button className="btn-icon" onClick={() => handleEdit(quiz)}>
                        ✏️
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(quiz)}>
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
  