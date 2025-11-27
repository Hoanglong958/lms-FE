// Đường dẫn: features/Admin/Dashboard/components/RecentQuizzesTable.jsx

import React from "react";
import "../Dashboard.css";

const RecentQuizzesTable = ({ quizzes }) => (
  <div className="table-container">
    <table className="data-table">
      <thead className="data-table-header">
        <tr>
          <th className="th-cell">Tên bài thi</th>
          <th className="th-cell">Số lượng tham gia</th>
          <th className="th-cell">Tỉ lệ đạt</th>
        </tr>
      </thead>

      <tbody>
        {quizzes &&
          quizzes.map((quiz, index) => {
            // Tính passRate từ API
            const passRate = Math.round(
              (quiz.passingScore / quiz.maxScore) * 100
            );

            return (
              <tr key={index} className="data-table-row">
                <td className="td-cell">
                  <div>{quiz.title}</div>
                  <div className="cell-subtitle">{quiz.lessonTitle}</div>
                </td>

                {/* API KHÔNG TRẢ participants → tạm dùng questionCount */}
                <td className="td-cell">{quiz.questionCount}</td>

                <td className="td-cell">
                  <span
                    className={`pass-rate ${
                      passRate > 80 ? "pass-rate-high" : "pass-rate-low"
                    }`}
                  >
                    {passRate}%
                  </span>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  </div>
);

export default RecentQuizzesTable;
