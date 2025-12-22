// Đường dẫn: features/Admin/Dashboard/components/RecentQuizzesTable.jsx
import React from "react";
import "../Dashboard.css";

const RecentQuizzesTable = ({ quizzes }) => {
  const calcPassRate = (q) => {
    if (typeof q?.passRate === "number") return Math.round(q.passRate);
    const ps = Number(q?.passingScore) || 0;
    const ms = Number(q?.maxScore) || 0;
    if (ms > 0) return Math.round((ps / ms) * 100);
    return 0;
  };

  const participantsOf = (q) =>
    typeof q?.attempts === "number" && !Number.isNaN(q.attempts)
      ? q.attempts
      : 0;

  return (
    <div className="table-container">
      <table className="data-table">
        <thead className="data-table-header">
          <tr>
            <th className="th-cell">Tên bài thi</th>
            <th className="th-cell">Số lượng tham gia</th>
            <th className="th-cell">Điểm đạt</th>
          </tr>
        </thead>
        <tbody>
          {quizzes &&
            quizzes.map((quiz, index) => {
              const pr = calcPassRate(quiz);
              const participants = participantsOf(quiz);
              return (
                <tr key={index} className="data-table-row">
                  <td className="td-cell">
                    <div>{quiz.title}</div>
                    {quiz.lessonTitle ? (
                      <div className="cell-subtitle">{quiz.lessonTitle}</div>
                    ) : null}
                  </td>
                  <td className="td-cell">{participants}</td>
                  <td className="td-cell">
                    <span
                      className={`pass-rate ${
                        pr > 80 ? "pass-rate-high" : "pass-rate-low"
                      }`}
                    >
                      {pr}%
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

export default RecentQuizzesTable;
