import React, { useEffect, useState } from "react";
import "./QuizManagement.css";
import { useNavigate } from "react-router-dom";
import AdminHeader from "@components/Admin/AdminHeader";

export default function QuizManagement() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);

  // 🟩 Lấy quiz từ localStorage khi load trang
  useEffect(() => {
    const storedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");

    // Nếu localStorage trống → giữ danh sách mẫu ban đầu
    if (storedQuizzes.length === 0) {
      const sampleQuizzes = [
        {
          id: 1,
          name: "React Basics Quiz",
          course: "React Advanced",
          questions: 15,
          attempts: 320,
          avgScore: 82,
          passRate: 78,
          duration: "20 phút",
          status: "Hoạt động",
        },
        {
          id: 2,
          name: "Hooks Deep Dive Quiz",
          course: "React Advanced",
          questions: 20,
          attempts: 280,
          avgScore: 75,
          passRate: 72,
          duration: "30 phút",
          status: "Hoạt động",
        },
      ];
      setQuizzes(sampleQuizzes);
      localStorage.setItem("quizzes", JSON.stringify(sampleQuizzes));
    } else {
      setQuizzes(storedQuizzes);
    }
  }, []);

  // 🟩 Các hàm xử lý hành động
  const handleView = (quiz) => {
    // ✅ Chuyển đến trang thi thử
    navigate(`/admin/quiz/${quiz.id}/preview`);
  };

  const handleEdit = (quiz) => {
    alert(`Chỉnh sửa quiz: ${quiz.name}`);
  };

  const handleDelete = (quiz) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${quiz.name}" không?`)) {
      const updated = quizzes.filter((q) => q.id !== quiz.id);
      setQuizzes(updated);
      localStorage.setItem("quizzes", JSON.stringify(updated));
      alert(`Đã xóa quiz: ${quiz.name}`);
    }
  };

  // ✅ Hàm báo cáo chuyển đúng route
  const handleReport = (quiz) => {
    navigate(`/admin/quiz/${quiz.id}/report`);
  };

  return (
    <div className="quiz-management-container">
      <AdminHeader
        title="Quản lý Quiz"
        breadcrumb={<span>Admin / Quizzes</span>}
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
            placeholder="🔍 Tìm kiếm quiz..."
            className="quiz-search"
          />

          <table className="quiz-table">
            <thead>
              <tr>
                <th>Tên Quiz</th>
                <th>Khóa học</th>
                <th>Mô tả</th>
                <th>Ngày mở</th>
                <th>Thời gian</th>
                <th>Điểm đậu</th>
                <th>Trạng thái</th>
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
                  <tr key={quiz.id}>
                    <td>{quiz.name}</td>
                    <td>
                      <span className="quiz-course-tag">{quiz.course}</span>
                    </td>
                    <td>{quiz.description || "—"}</td>
                    <td>{quiz.date || "—"}</td>
                    <td>{quiz.duration ? `${quiz.duration} phút` : "—"}</td>
                    <td>{quiz.passScore ? `${quiz.passScore}%` : "—"}</td>
                    <td>
                      <span
                        className={
                          quiz.status === "Hoạt động" ||
                          quiz.status === "Đang mở"
                            ? "status-active"
                            : "status-paused"
                        }
                      >
                        {quiz.status}
                      </span>
                    </td>
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
