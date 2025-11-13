// features/Admin/Dashboard/ExamManagement/ExamDetail.jsx
import React, { useState } from "react";
import "./ExamDetail.css";
import { useNavigate } from "react-router-dom";

export default function ExamDetail() {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Giả lập dữ liệu bài làm
  const submissions = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      submittedAt: "15/11/2024 10:30",
      duration: "85 phút",
      status: "Đúng hạn",
      score: 45,
      total: 50,
      answers: [
        {
          question: "React là thư viện hay framework?",
          options: ["Framework", "Library", "Công cụ build", "Module"],
          correct: "Library",
          chosen: "Library",
        },
        {
          question: "Hook nào dùng để quản lý state?",
          options: ["useEffect", "useContext", "useState", "useReducer"],
          correct: "useState",
          chosen: "useEffect",
        },
      ],
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      submittedAt: "15/11/2024 14:20",
      duration: "110 phút",
      status: "Nộp muộn",
      score: 35,
      total: 50,
      
      answers: [
        {
          question: "JSX là gì trong React?",
          options: [
            "Công cụ build React",
            "Cú pháp mở rộng của JavaScript",
            "Hàm render của React",
            "API của React DOM",
          ],
          correct: "Cú pháp mở rộng của JavaScript",
          chosen: "Công cụ build React",
        },
        {
          question: "Hook nào chạy sau mỗi lần render?",
          options: ["useMemo", "useCallback", "useEffect", "useLayoutEffect"],
          correct: "useEffect",
          chosen: "useEffect",
        },
      ],
    },
  ];

  const handleViewExam = (student) => {
    if (selectedStudent && selectedStudent.id === student.id) {
      setSelectedStudent(null); // Ẩn nếu bấm lại
    } else {
      setSelectedStudent(student);
    }
  };

  return (
    <div className="exam-detail-container">
      <button
        className="exam-export-btn"
        onClick={() => navigate("/admin/exam")}
      >
        ← Quay lại danh sách câu hỏi
      </button>

      {/* Header */}
      <div className="exam-detail-header">
        <h2>React Advanced - Final Exam</h2>
        <p>Chấm điểm và quản lý bài nộp của học viên</p>
      </div>

      {/* Stats section */}
      <div className="exam-detail-stats">
        <div className="exam-stat-card">
          <div className="exam-stat-icon">
            <i className="fa fa-user"></i>
          </div>
          <div className="exam-stat-info">
            <h4>Tổng học viên</h4>
            <p>5</p>
          </div>
        </div>

        <div className="exam-stat-card">
          <div className="exam-stat-icon">
            <i className="fa fa-check-circle"></i>
          </div>
          <div className="exam-stat-info">
            <h4>Đã nộp</h4>
            <p>4/5 (80%)</p>
          </div>
        </div>

        <div className="exam-stat-card">
          <div className="exam-stat-icon">
            <i className="fa fa-clipboard-list"></i>
          </div>
          <div className="exam-stat-info">
            <h4>Đã chấm</h4>
            <p>2/4 (50%)</p>
          </div>
        </div>

        <div className="exam-stat-card">
          <div className="exam-stat-icon">
            <i className="fa fa-clock"></i>
          </div>
          <div className="exam-stat-info">
            <h4>Điểm trung bình</h4>
            <p>40/50 (80%)</p>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="exam-submission-list">
        <h3>Danh sách bài nộp</h3>

        <div className="exam-search-container">
          <input
            type="text"
            placeholder="Tìm kiếm học viên..."
            className="exam-search-input"
          />
          <select className="exam-filter">
            <option>Tất cả</option>
            <option>Đúng hạn</option>
            <option>Nộp muộn</option>
          </select>
        </div>

        <table className="exam-table">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Email</th>
              <th>Thời gian nộp</th>
              <th>Thời gian làm</th>
              <th>Trạng thái</th>
              <th>Điểm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.submittedAt}</td>
                <td>{student.duration}</td>
                <td>
                  <span
                    className={`badge ${
                      student.status === "Đúng hạn"
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td>
                  {student.score}/{student.total}
                </td>
                <td>
                  <button
                    className="exam-action-btn"
                    onClick={() => handleViewExam(student)}
                  >
                    <i className="fa fa-eye"></i>{" "}
                    {selectedStudent?.id === student.id
                      ? "Ẩn bài làm"
                      : "Xem bài"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Chi tiết bài làm */}
        {selectedStudent && (
          <div className="exam-detail-view">
            <h3>
              Bài làm của: <span>{selectedStudent.name}</span>
            </h3>
            <p>
              Điểm:{" "}
              <strong>
                {selectedStudent.score}/{selectedStudent.total}
              </strong>
            </p>

            {selectedStudent.answers.map((q, idx) => (
              <div key={idx} className="exam-question">
                <h4>
                  Câu {idx + 1}: {q.question}
                </h4>
                <ul>
                  {q.options.map((opt, i) => {
                    const isCorrect = opt === q.correct;
                    const isChosen = opt === q.chosen;
                    return (
                      <li
                        key={i}
                        className={`exam-option ${
                          isChosen
                            ? isCorrect
                              ? "correct"
                              : "wrong"
                            : isCorrect
                            ? "highlight"
                            : ""
                        }`}
                      >
                        {opt}
                        {isChosen &&
                          (isCorrect ? (
                            <span className="icon">✅</span>
                          ) : (
                            <span className="icon">❌</span>
                          ))}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
