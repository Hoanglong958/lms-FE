// Đường dẫn: features/Admin/Dashboard/components/NewUsersTable.jsx
// (ĐÃ SỬA LỖI)

import React from "react";
// Import file CSS của bạn
import "../Dashboard.css";

// SỬA 1: Đảm bảo bạn nhận vào prop là { users }
const NewUsersTable = ({ users }) => (
  <div className="table-container">
    <table className="data-table">
      {/* SỬA 2: Xóa khoảng trắng thừa */}
      <thead className="data-table-header">
        <tr>
          <th className="th-cell">ID</th>
          <th className="th-cell">Tên</th>
          <th className="th-cell">Vai trò</th>
          <th className="th-cell">Ngày tham gia</th>
        </tr>
      </thead>
      {/* SỬA 2: Xóa khoảng trắng thừa */}
      <tbody>
        {/* SỬA 3: Thêm kiểm tra "users &&" để tránh lỗi nếu data chưa kịp tải */}
        {users &&
          users.map((user) => (
            <tr key={user.id} className="data-table-row">
              <td className="td-cell font-medium">{user.id}</td>
              <td className="td-cell">
                <div>{user.name}</div>
                <div className="cell-subtitle">{user.email}</div>
              </td>
              <td className="td-cell">
                <span className="status-badge status-role">{user.role}</span>
              </td>
              <td className="td-cell">{user.date}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);

export default NewUsersTable;
