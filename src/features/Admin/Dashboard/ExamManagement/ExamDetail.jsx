// features/Admin/Dashboard/ExamManagement/ExamDetail.jsx
import React from "react";
import "./ExamDetail.css";
import { useNavigate } from "react-router-dom";

export default function ExamDetail() {
  const navigate = useNavigate();

  return (
    <div className="exam-detail-container">
      <button className="exam-export-btn" onClick={() => navigate("/admin/exam")}>
        ← Quay lại danh sách bài kiểm tra
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

      {/* Progress overview */}
      <div className="exam-progress-overview">
        <h3>Tiến độ bài kiểm tra</h3>
        <div className="exam-progress-bar">
          <div className="bar-dunghan"></div>
          <div className="bar-nopmuon"></div>
          <div className="bar-chuanop"></div>
        </div>
        <div className="exam-progress-labels">
          <span>Đúng hạn</span>
          <span>Nộp muộn</span>
          <span>Chưa nộp</span>
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
            <tr>
              <td>Nguyễn Văn A</td>
              <td>nguyenvana@email.com</td>
              <td>15/11/2024 10:30</td>
              <td>85 phút</td>
              <td><span className="badge badge-success">Đúng hạn</span></td>
              <td>45/50</td>
              <td>
                <button className="exam-action-btn">
                  <i className="fa fa-eye"></i> Xem bài
                </button>
              </td>
            </tr>

            <tr>
              <td>Trần Thị B</td>
              <td>tranthib@email.com</td>
              <td>15/11/2024 14:20</td>
              <td>110 phút</td>
              <td><span className="badge badge-warning">Nộp muộn</span></td>
              <td>35/50</td>
              <td>
                <button className="exam-action-btn">
                  <i className="fa fa-eye"></i> Xem bài
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
