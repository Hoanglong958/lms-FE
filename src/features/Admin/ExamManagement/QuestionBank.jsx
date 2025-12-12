import React, { useState } from "react";
import "./QuestionBank.css";
import { useNavigate } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal";

export default function QuestionBank() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  // ================================
  // MOCK DATA
  // ================================
  const questions = [
    { id: 1, question: "React là thư viện hay framework?", course: "Frontend React", type: "Trắc nghiệm" },
    { id: 2, question: "Hook useEffect dùng để làm gì?", course: "Frontend React", type: "Tự luận" },
    { id: 3, question: "Props khác State như thế nào?", course: "Lập trình Web", type: "Trắc nghiệm" },
  ];

  // Dùng để lấy danh sách khóa học duy nhất
  const uniqueCourses = ["Tất cả", ...new Set(questions.map((q) => q.course))];

  // ================================
  // FILTER STATE
  // ================================
  const [filterType, setFilterType] = useState("Tất cả");
  const [filterCourse, setFilterCourse] = useState("Tất cả");

  const handleView = (q) => {
    navigate(`/admin/quiz/question/${q.id}`);
  };

  // ================================
  // FILTER APPLY
  // ================================
  const filteredQuestions = questions.filter((q) => {
    const matchType = filterType === "Tất cả" ? true : q.type === filterType;
    const matchCourse = filterCourse === "Tất cả" ? true : q.course === filterCourse;
    return matchType && matchCourse;
  });

  return (
    <div className="question-bank-container">
      <div className="question-bank-header">
        <div>
          <h2>📚 Ngân hàng câu hỏi</h2>
          <p>Quản lý danh sách câu hỏi dùng cho các quiz</p>
        </div>

        <button
          className="question-btn add"
          onClick={() => navigate("/admin/question-bank/create")}
        >
          + Thêm câu hỏi mới
        </button>
      </div>

      <div className="question-bank-table-section">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="🔍 Tìm kiếm câu hỏi..."
          className="question-search"
        />

        {/* FILTER ROW */}
        <div className="filter-row">

          {/* FILTER BY TYPE */}
          <select
            className="question-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="Tất cả">Tất cả loại</option>
            <option value="Trắc nghiệm">Trắc nghiệm</option>
            <option value="Tự luận">Tự luận</option>
          </select>

          {/* FILTER BY COURSE */}
          <select
            className="question-filter"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            {uniqueCourses.map((course, idx) => (
              <option key={idx} value={course}>{course}</option>
            ))}
          </select>

        </div>

        {/* TABLE */}
        <table className="question-bank-table">
          <thead>
            <tr>
              <th>Câu hỏi</th>
              <th>Khóa học</th>
              <th>Loại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.map((q) => (
              <tr key={q.id}>
                <td>{q.question}</td>
                <td>{q.course}</td>
                <td>{q.type}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleView(q)}>
                    👁️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => showNotification("Thông báo", `Sửa câu hỏi: ${q.question}`, "info")}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() =>
                      window.confirm("Bạn có chắc muốn xóa câu hỏi này?")
                    }
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
