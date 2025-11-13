// Đường dẫn: features/Admin/Dashboard/components/RecentQuizzesTable.jsx
// (ĐÃ SỬA LỖI WHITESPACE)

import React from "react";
// Import file CSS của bạn
import "../Dashboard.css";

const RecentQuizzesTable = ({ quizzes }) => (
  <div className="table-container">
    {/* Đảm bảo không có khoảng trắng hay comment nào giữa <table> và <thead/tbody> */}
    <table className="data-table">
      <thead className="data-table-header">
        {/* Đảm bảo không có khoảng trắng hay comment nào giữa <tr> và <th> */}
        <tr>
          <th className="th-cell">Tên bài thi</th>
          <th className="th-cell">Số lượng tham gia</th>
          <th className="th-cell">Tỉ lệ đạt</th>
        </tr>
      </thead>
      {/* Đảm bảo không có khoảng trắng hay comment nào giữa <tbody> và <tr> */}
      <tbody>
        {/* Thêm 'quizzes &&' để kiểm tra an toàn */}
        {quizzes &&
          quizzes.map((quiz, index) => (
            <tr key={index} className="data-table-row">
              <td className="td-cell">
                <div>{quiz.name}</div>
                <div className="cell-subtitle">{quiz.course}</div>
              </td>
              <td className="td-cell">{quiz.participants}</td>
              <td className="td-cell">
                <span
                  className={`pass-rate ${
                    quiz.passRate > 80 ? "pass-rate-high" : "pass-rate-low"
                  }`}
                >
                  {quiz.passRate}%
                </span>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);

export default RecentQuizzesTable;
