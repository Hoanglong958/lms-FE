import React from "react";
import "./ExamReport.css";
import { useNavigate } from "react-router-dom";

export default function ExamReport() {
  const navigate = useNavigate();

  const exam = {
    title: "React Basics Quiz",
    totalStudents: 5,
    submitted: 4,
    graded: 2,
    avgScore: 40,
    maxScore: 50,
    percentAvg: 80,
    statusSummary: {
      onTime: 2,
      late: 2,
      missing: 1,
    },
  };

  const submissions = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      submitTime: "15/11/2024 10:30",
      duration: "85 phút",
      status: "Đúng hạn",
      score: "45/50",
      graded: true,
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      submitTime: "15/11/2024 14:20",
      duration: "110 phút",
      status: "Nộp muộn",
      score: "35/50",
      graded: true,
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      submitTime: "15/11/2024 11:45",
      duration: "95 phút",
      status: "Đúng hạn",
      score: "Chưa chấm",
      graded: false,
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      submitTime: "-",
      duration: "-",
      status: "Chưa nộp",
      score: "-",
      graded: false,
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      email: "hoangvane@email.com",
      submitTime: "16/11/2024 09:00",
      duration: "120 phút",
      status: "Nộp muộn",
      score: "Chưa chấm",
      graded: false,
    },
  ];

  const handleBack = () => navigate("/admin/exam");
  const handleExport = () => alert("📄 Đang xuất báo cáo...");

  return (
    <div className="exam-report-container">
      {/* Header */}
      <div className="exam-report-header">
        <button className="btn-back" onClick={handleBack}>
          ← Quay lại danh sách bài kiểm tra
        </button>
        <h2>{exam.title}</h2>
        <p>Thống kê kết quả và bài nộp của học viên</p>
      </div>

      {/* Thẻ thống kê */}
      <div className="exam-summary">
        <div className="summary-card blue">
          <p>Tổng học viên</p>
          <h3>{exam.totalStudents}</h3>
        </div>
        <div className="summary-card green">
          <p>Đã nộp</p>
          <h3>
            {exam.submitted}/{exam.totalStudents}
          </h3>
        </div>
        <div className="summary-card orange">
          <p>Đã chấm</p>
          <h3>
            {exam.graded}/{exam.submitted}
          </h3>
        </div>
        <div className="summary-card purple">
          <p>Điểm trung bình</p>
          <h3>
            {exam.avgScore}/{exam.maxScore} ({exam.percentAvg}%)
          </h3>
        </div>
      </div>

      {/* Biểu đồ trạng thái */}
      <div className="exam-status">
        <h4>Tổng quan trạng thái</h4>
        <div className="status-bar">
          <div className="bar ontime" style={{ width: "40%" }}>
            Nộp đúng hạn ({exam.statusSummary.onTime})
          </div>
          <div className="bar late" style={{ width: "40%" }}>
            Nộp muộn ({exam.statusSummary.late})
          </div>
          <div className="bar missing" style={{ width: "20%" }}>
            Chưa nộp ({exam.statusSummary.missing})
          </div>
        </div>
      </div>

      {/* Danh sách bài nộp */}
      <div className="exam-submissions">
        <div className="submissions-header">
          <h4>Danh sách bài nộp</h4>
          <div className="actions">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm học viên..."
              className="exam-search"
            />
            <button className="btn-export" onClick={handleExport}>
              ⬇️ Xuất báo cáo
            </button>
          </div>
        </div>

        <table className="exam-table">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Email</th>
              <th>Thời gian nộp</th>
              <th>Thời gian làm</th>
              <th>Trạng thái</th>
              <th>Điểm số</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id}>
                <td>👤 {s.name}</td>
                <td>{s.email}</td>
                <td>{s.submitTime}</td>
                <td>{s.duration}</td>
                <td>
                  <span
                    className={`status-tag ${
                      s.status === "Đúng hạn"
                        ? "ontime"
                        : s.status === "Nộp muộn"
                        ? "late"
                        : "missing"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td>
                  <span
                    className={`${
                      s.score.includes("Chưa")
                        ? "text-gray"
                        : "text-green bold"
                    }`}
                  >
                    {s.score}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() =>
                      alert(
                        s.graded
                          ? `📖 Xem bài nộp của ${s.name}`
                          : `✏️ Chấm điểm cho ${s.name}`
                      )
                    }
                  >
                    {s.graded ? "Xem bài" : "Chấm điểm"}
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
