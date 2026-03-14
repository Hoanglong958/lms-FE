import React, { useState } from "react";
import Pagination from "@components/common/Pagination";
// Import file CSS của bạn
import "../Dashboard.css";


// SỬA 1: Đảm bảo bạn nhận vào prop là { users }
const NewUsersTable = ({ users }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = Array.isArray(users) ? users : [];

  // Tính toán pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <div className="table-container">
        <table className="data-table">
          <thead className="data-table-header">
            <tr>
              <th className="th-cell">ID</th>
              <th className="th-cell">Tên</th>
              <th className="th-cell">Vai trò</th>
              <th className="th-cell">Ngày tham gia</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers && currentUsers.length > 0 ? (
              currentUsers.map((user) => (
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
              ))
            ) : (
              <tr>
                <td colSpan="4" className="td-cell" style={{ textAlign: "center", padding: "2rem" }}>
                  Không có người dùng mới trong tháng này
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default NewUsersTable;
