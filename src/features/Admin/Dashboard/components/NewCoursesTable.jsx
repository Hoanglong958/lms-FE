// Đường dẫn: features/Admin/Dashboard/components/NewCoursesTable.jsx
// (ĐÃ SỬA LỖI)

import React from "react";
// Import file CSS của bạn
import "../Dashboard.css";

// SỬA 1: Đảm bảo bạn nhận vào prop là { courses }
const NewCoursesTable = ({ courses }) => {
  // Hàm helper map dữ liệu sang hiển thị
  const getDisplayInfo = (course) => {
    // Ưu tiên hiển thị Level nếu Status không có hoặc null
    const rawStatus = course.status || course.level;

    let label = rawStatus;
    let cssClass = "status-pending"; // Mặc định màu xám/vàng

    // Map giá trị sang Tiếng Việt và set màu
    switch (String(rawStatus).toUpperCase()) {
      case "PUBLISHED":
      case "ACTIVE":
      case "CÔNG KHAI":
        label = "Công khai";
        cssClass = "status-public"; // Xanh lá
        break;
      case "DRAFT":
      case "INACTIVE":
      case "NHÁP":
        label = "Nháp";
        cssClass = "status-pending"; // Xám/Vàng
        break;
      case "BEGINNER":
        label = "Cơ bản";
        cssClass = "status-public";
        break;
      case "INTERMEDIATE":
        label = "Trung cấp";
        cssClass = "status-pending";
        break;
      case "ADVANCED":
        label = "Nâng cao";
        cssClass = "status-pending"; // Hoặc màu đỏ/tím tùy css
        break;
      default:
        label = rawStatus || "N/A";
    }

    return { label, cssClass };
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead className="data-table-header">
          <tr>
            <th className="th-cell">ID</th>
            <th className="th-cell">Tiêu đề</th>
            {/* Đã bỏ cột Giảng viên */}
            <th className="th-cell">Trạng thái / Cấp độ</th>
          </tr>
        </thead>
        <tbody>
          {courses &&
            courses.map((course) => {
              const { label, cssClass } = getDisplayInfo(course);
              return (
                <tr key={course.id} className="data-table-row">
                  <td className="td-cell font-medium">{course.id}</td>
                  <td className="td-cell">
                    <div>{course.title}</div>
                    <div className="cell-subtitle">{course.description || course.category || "Không có mô tả"}</div>
                  </td>
                  {/* Đã bỏ cột Giảng viên */}
                  <td className="td-cell">
                    <span className={`status-badge ${cssClass}`}>
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default NewCoursesTable;
