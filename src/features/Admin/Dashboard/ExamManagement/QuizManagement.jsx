import React from "react";
import "./QuizManagement.css";
import { useNavigate } from "react-router-dom";

export default function QuizManagement() {
  const navigate = useNavigate();

  const quizzes = [
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

  // 🟩 Các hàm xử lý hành động
  const handleView = (quiz) => {
    alert(`Xem chi tiết quiz: ${quiz.name}`);
    // navigate(`/admin/quiz/${quiz.id}`);
  };

  const handleEdit = (quiz) => {
    alert(`Chỉnh sửa quiz: ${quiz.name}`);
    // navigate(`/admin/quiz/edit/${quiz.id}`);
  };

  const handleDelete = (quiz) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${quiz.name}" không?`)) {
      alert(`Đã xóa quiz: ${quiz.name}`);
      // Gọi API delete ở đây
    }
  };

  const handleReport = (quiz) => {
    alert(`Xem báo cáo quiz: ${quiz.name}`);
    // navigate(`/admin/quiz/report/${quiz.id}`);
  };

  return (
    <div className="quiz-management-container">
      <div className="quiz-header">
        <h2>Quản lý Quiz</h2>
        <p>Danh sách quiz và thống kê kết quả</p>
      </div>

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
              <th>Câu hỏi</th>
              <th>Lượt làm</th>
              <th>Điểm TB</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td>{quiz.name}</td>
                <td>
                  <span className="quiz-course-tag">{quiz.course}</span>
                </td>
                <td>{quiz.questions}</td>
                <td>{quiz.attempts}</td>
                <td
                  className={quiz.avgScore >= 80 ? "text-green" : "text-red"}
                >
                  {quiz.avgScore}%
                </td>
                <td>{quiz.duration}</td>
                <td>
                  <span
                    className={
                      quiz.status === "Hoạt động"
                        ? "status-active"
                        : "status-paused"
                    }
                  >
                    {quiz.status}
                  </span>
                </td>
                <td className="quiz-actions">
                  <button className="btn-icon" onClick={() => handleReport(quiz)}>
                    📄
                  </button>
                  <button className="btn-icon" onClick={() => handleView(quiz)}>
                    👁️
                  </button>
                  <button className="btn-icon" onClick={() => handleEdit(quiz)}>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
