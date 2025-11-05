import React from "react";
import "./AssignmentManagement.css";

export default function AssignmentManagement() {
  const assignments = [
    {
      id: 1,
      name: "Build a Todo App with React",
      course: "React Advanced",
      dueDate: "10/11/2024",
      submitted: 380,
      graded: 320,
      waiting: 60,
      avgScore: 85,
      status: "Đang mở",
      tagColor: "react",
    },
    {
      id: 2,
      name: "Python Data Analysis Project",
      course: "Python for AI",
      dueDate: "15/11/2024",
      submitted: 290,
      graded: 290,
      waiting: 0,
      avgScore: 82,
      status: "Đã đóng",
      tagColor: "python",
    },
    {
      id: 3,
      name: "Flutter E-commerce App",
      course: "Flutter Mobile Dev",
      dueDate: "20/11/2024",
      submitted: 180,
      graded: 120,
      waiting: 60,
      avgScore: 78,
      status: "Đang mở",
      tagColor: "flutter",
    },
    {
      id: 4,
      name: "Design a Mobile App UI",
      course: "UI/UX Design",
      dueDate: "8/11/2024",
      submitted: 250,
      graded: 250,
      waiting: 0,
      avgScore: 88,
      status: "Đang mở",
      tagColor: "uiux",
    },
    {
      id: 5,
      name: "Deploy AWS Infrastructure",
      course: "AWS Cloud",
      dueDate: "25/11/2024",
      submitted: 95,
      graded: 45,
      waiting: 50,
      avgScore: 76,
      status: "Đang mở",
      tagColor: "aws",
    },
  ];

  const recentSubmissions = [
    { id: 1, name: "Nguyễn Văn A", date: "5/11/2024", score: 90, status: "Đã chấm" },
    { id: 2, name: "Trần Thị B", date: "6/11/2024", score: 85, status: "Đã chấm" },
    { id: 3, name: "Lê Văn C", date: "7/11/2024", status: "Chờ chấm" },
    { id: 4, name: "Phạm Thị D", date: "8/11/2024", status: "Chờ chấm" },
    { id: 5, name: "Hoàng Văn E", date: "4/11/2024", score: 95, status: "Đã chấm" },
  ];

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <h2>Danh sách bài tập và bài nộp học viên</h2>
      </div>

      {/* Thống kê */}
      <div className="assignment-stats">
        <div className="stat-box orange">
          <p>Tổng bài tập</p>
          <h3>5</h3>
        </div>
        <div className="stat-box blue">
          <p>Bài nộp</p>
          <h3>1195</h3>
        </div>
        <div className="stat-box green">
          <p>Đã chấm</p>
          <h3>1025</h3>
        </div>
        <div className="stat-box red">
          <p>Chờ chấm</p>
          <h3>170</h3>
        </div>
      </div>

      <div className="assignment-content">
        {/* Bảng bên trái */}
        <div className="assignment-table-section">
          <div className="assignment-search-bar">
            <input type="text" placeholder="🔍 Tìm kiếm bài tập..." />
            <select>
              <option>Tất cả</option>
              <option>Đang mở</option>
              <option>Đã đóng</option>
            </select>
          </div>

          <table className="assignment-table">
            <thead>
              <tr>
                <th>Bài tập</th>
                <th>Khóa học</th>
                <th>Hạn nộp</th>
                <th>Nộp/Chấm</th>
                <th>Điểm TB</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td><span className={`tag ${a.tagColor}`}>{a.course}</span></td>
                  <td>{a.dueDate}</td>
                  <td>{a.submitted} nộp<br />{a.graded} chấm / {a.waiting} chờ</td>
                  <td className={a.avgScore >= 80 ? "text-green" : "text-red"}>
                    {a.avgScore}%
                  </td>
                  <td>
                    <span className={a.status === "Đang mở" ? "status-open" : "status-closed"}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cột bên phải */}
        <div className="recent-submissions">
          <h4>Bài nộp gần đây</h4>
          {recentSubmissions.map((s) => (
            <div key={s.id} className="submission-card">
              <p><strong>{s.name}</strong></p>
              <p>Nộp: {s.date}</p>
              {s.status === "Đã chấm" ? (
                <>
                  <span className="badge success">Đã chấm</span>
                  <p className="score">Điểm: <strong>{s.score}/100</strong></p>
                </>
              ) : (
                <>
                  <span className="badge pending">Chờ chấm</span>
                  <button className="btn-grade">Chấm điểm</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
