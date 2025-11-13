import React, { useEffect, useState } from "react";
import "./ExamManagement.css";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminHeader from "@components/Admin/AdminHeader";

export default function ExamManagement() {
  const navigate = useNavigate();

  // ✅ Thêm state để chứa danh sách bài kiểm tra
  const [exams, setExams] = useState([]);

  // ✅ Lấy dữ liệu từ localStorage (và thêm 3 bài mặc định bạn có sẵn)
  useEffect(() => {
    const storedExams = JSON.parse(localStorage.getItem("exams")) || [];
    const defaultExams = [
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

    // ✅ Nếu localStorage trống thì dùng mặc định, còn không thì gộp lại
    const allExams = [...defaultExams, ...storedExams];
    setExams(allExams);
  }, []);

  // ✅ Khi bấm nút "Tạo bài kiểm tra"
  const handleAddExam = () => {
    navigate("/admin/exam/create");
  };

  // ✅ Khi bấm nút "Ngân hàng câu hỏi"
  const handleQuestionBank = () => {
    navigate("/admin/question-bank");
  };

  // ✅ Khi bấm 📄 => sang trang chi tiết bài kiểm tra
  const handleReport = (exam) => {
    navigate(`/admin/exam/${exam.id}/detail`);
  };

  const handleView = (exam) => {
    navigate(`/admin/exam/${exam.id}/preview`);
  };

  const handleEdit = (exam) => {
    alert(`✏️ Chỉnh sửa kỳ thi: ${exam.name}`);
  };

  const handleDelete = (exam) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${exam.name}" không?`)) {
      alert(`🗑️ Đã xóa kỳ thi: ${exam.name}`);
      const updated = exams.filter((e) => e.id !== exam.id);
      setExams(updated);
      localStorage.setItem("exams", JSON.stringify(updated));
    }
  };

  const { toggleSidebar } = useOutletContext() || {};

  return (
    <div className="exam-management-container">
      {/* --- HEADER --- */}
      <AdminHeader
        title="Quản lý bài kiểm tra"
        onMenuToggle={toggleSidebar}
        actions={
          <div className="exam-header-buttons">
          <button className="exam-btn bank" onClick={handleQuestionBank}>
            📚 Ngân hàng câu hỏi
          </button>
          <button className="exam-btn add" onClick={handleAddExam}>
            + Tạo bài kiểm tra
          </button>
        </div>
        }
      />
      

      {/* --- THỐNG KÊ --- */}
      <div className="exam-content-page">
      <div className="exam-stats">
        <div className="exam-card">
          <p className="exam-card-title">Tổng kỳ thi</p>
          <h3>{exams.length}</h3>
        </div>
        <div className="exam-card">
          <p className="exam-card-title">Số thí sinh</p>
          <h3>{exams.reduce((sum, e) => sum + (e.students || 0), 0)}</h3>
        </div>
        <div className="exam-card">
          <p className="exam-card-title">Điểm trung bình</p>
          <h3>
            {(
              exams.reduce((sum, e) => sum + (e.avgScore || 0), 0) /
              exams.length
            ).toFixed(1)}
            %
          </h3>

        </div>
      </div>

      {/* --- BẢNG DANH SÁCH --- */}
      <div className="exam-table-section">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm bài kiểm tra..."
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
                <td>{exam.students || "-"}</td>
                <td
                  className={
                    exam.avgScore >= 80 ? "text-green" : "text-red"
                  }
                >
                  {exam.avgScore ? `${exam.avgScore}%` : "-"}
                </td>
                <td
                  className={
                    exam.passRate >= 80 ? "text-green" : "text-orange"
                  }
                >
                  {exam.passRate ? `${exam.passRate}%` : "-"}
                </td>
                <td>{exam.duration || "-"}</td>
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
                  <button
                    className="btn-icon"
                    onClick={() => handleReport(exam)}
                  >
                    📄
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleView(exam)}
                  >
                    👁️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(exam)}
                  >
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
    </div>
  );
}
