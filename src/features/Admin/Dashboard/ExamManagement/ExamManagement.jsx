import React from "react";
import "./ExamManagement.css";
import { useNavigate } from "react-router-dom";

export default function ExamManagement() {
  const navigate = useNavigate();

  // 🧩 Dữ liệu mẫu (mock data)
  const exams = [
    {
      id: 1,
      name: "Thi giữa kỳ môn React",
      course: "React Advanced",
      students: 80,
      avgScore: 78,
      passRate: 85,
      duration: "60 phút",
      status: "Đang mở",
    },
    {
      id: 2,
      name: "Thi cuối kỳ JavaScript",
      course: "JavaScript Mastery",
      students: 120,
      avgScore: 70,
      passRate: 68,
      duration: "90 phút",
      status: "Đã kết thúc",
    },
    {
      id: 3,
      name: "Thi tổng hợp HTML/CSS",
      course: "Frontend Cơ bản",
      students: 95,
      avgScore: 82,
      passRate: 90,
      duration: "45 phút",
      status: "Đang mở",
    },
  ];

  // 🟢 Các hàm xử lý hành động
  const handleReport = (exam) => {
    alert(`📄 Xem báo cáo kỳ thi: ${exam.name}`);
    // navigate(`/admin/exams/report/${exam.id}`);
  };

  const handleView = (exam) => {
    alert(`👁️ Xem chi tiết kỳ thi: ${exam.name}`);
    // navigate(`/admin/exams/${exam.id}`);
  };

  const handleEdit = (exam) => {
    alert(`✏️ Chỉnh sửa kỳ thi: ${exam.name}`);
    // navigate(`/admin/exams/edit/${exam.id}`);
  };

  const handleDelete = (exam) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${exam.name}" không?`)) {
      alert(`🗑️ Đã xóa kỳ thi: ${exam.name}`);
      // TODO: Gọi API xóa tại đây
    }
  };

  return (
    <div className="exam-management-container">
      <div className="exam-header">
        <h2>Quản lý kỳ thi</h2>
        <p>Danh sách các kỳ thi và thống kê chi tiết</p>
      </div>

      {/* Thống kê tổng quan */}
      <div className="exam-stats">
        <div className="exam-card">
          <p className="exam-card-title">Tổng kỳ thi</p>
          <h3>{exams.length}</h3>
        </div>
        <div className="exam-card">
          <p className="exam-card-title">Số thí sinh</p>
          <h3>{exams.reduce((sum, e) => sum + e.students, 0)}</h3>
        </div>
        <div className="exam-card">
          <p className="exam-card-title">Điểm trung bình</p>
          <h3>
            {(
              exams.reduce((sum, e) => sum + e.avgScore, 0) / exams.length
            ).toFixed(1)}
            %
          </h3>
        </div>
      </div>

      {/* Bảng danh sách kỳ thi */}
      <div className="exam-table-section">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm kỳ thi..."
          className="exam-search"
        />

        <table className="exam-table">
          <thead>
            <tr>
              <th>Tên kỳ thi</th>
              <th>Khóa học</th>
              <th>Thí sinh</th>
              <th>Điểm TB</th>
              <th>Tỉ lệ đạt</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.name}</td>
                <td>
                  <span className="exam-course-tag">{exam.course}</span>
                </td>
                <td>{exam.students}</td>
                <td
                  className={exam.avgScore >= 80 ? "text-green" : "text-red"}
                >
                  {exam.avgScore}%
                </td>
                <td
                  className={exam.passRate >= 80 ? "text-green" : "text-orange"}
                >
                  {exam.passRate}%
                </td>
                <td>{exam.duration}</td>
                <td>
                  <span
                    className={
                      exam.status === "Đang mở"
                        ? "status-active"
                        : "status-paused"
                    }
                  >
                    {exam.status}
                  </span>
                </td>
                <td className="exam-actions">
                  <button className="btn-icon" onClick={() => handleReport(exam)}>
                    📄
                  </button>
                  <button className="btn-icon" onClick={() => handleView(exam)}>
                    👁️
                  </button>
                  <button className="btn-icon" onClick={() => handleEdit(exam)}>
                    ✏️
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDelete(exam)}
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
