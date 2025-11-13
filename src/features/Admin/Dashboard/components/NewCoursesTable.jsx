// Đường dẫn: features/Admin/Dashboard/components/NewCoursesTable.jsx
// (ĐÃ SỬA LỖI)

import React from "react";
// Import file CSS của bạn
import "../Dashboard.css";

// SỬA 1: Đảm bảo bạn nhận vào prop là { courses }
const NewCoursesTable = ({ courses }) => {
  // Hàm helper để lấy class CSS dựa trên trạng thái
  const getStatusClass = (status) => {
    if (status === "Công khai") {
      return "status-public";
    }
    return "status-pending";
  };

  return (
    <div className="table-container">
      <table className="data-table">
        {/* SỬA 2: Xóa khoảng trắng thừa */}
        <thead className="data-table-header">
          <tr>
            <th className="th-cell">ID</th>
            <th className="th-cell">Tiêu đề</th>
            <th className="th-cell">Giảng viên</th>
            <th className="th-cell">Trạng thái</th>
          </tr>
        </thead>
        {/* SỬA 2: Xóa khoảng trắng thừa */}
        <tbody>
          {/* SỬA 3: Thêm kiểm tra "courses &&" */}
          {courses &&
            courses.map((course) => (
              <tr key={course.id} className="data-table-row">
                <td className="td-cell font-medium">{course.id}</td>
                <td className="td-cell">
                  <div>{course.title}</div>
                  <div className="cell-subtitle">{course.category}</div>
                </td>
                <td className="td-cell">{course.instructor}</td>
                <td className="td-cell">
                  <span
                    className={`status-badge ${getStatusClass(course.status)}`}
                  >
                    {course.status}
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default NewCoursesTable;
