// Đường dẫn: features/Admin/Dashboard/components/RecentQuizzesTable.jsx
import React, { useEffect, useState } from "react";
import "../Dashboard.css";
import Pagination from "@components/common/Pagination";

const RecentQuizzesTable = ({ quizzes }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const normalizedQuizzes = Array.isArray(quizzes) ? quizzes : [];
  const totalPages = Math.ceil(normalizedQuizzes.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentQuizzes = normalizedQuizzes.slice(startIdx, startIdx + itemsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => setCurrentPage(page);

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
    <>
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
            {currentQuizzes && currentQuizzes.length > 0 ? (
              currentQuizzes.map((quiz, index) => {
                const pr = calcPassRate(quiz);
                const participants = participantsOf(quiz);
                return (
                  <tr key={`${quiz.id || quiz.title}-${index}`} className="data-table-row">
                    <td className="td-cell">
                      <div>{quiz.title}</div>
                      {quiz.lessonTitle ? (
                        <div className="cell-subtitle">{quiz.lessonTitle}</div>
                      ) : (
                        <div className="cell-subtitle" style={{ visibility: "hidden" }}>
                          Không có bài học
                        </div>
                      )}
                    </td>
                    <td className="td-cell">{participants}</td>
                    <td className="td-cell">
                      <span className={`pass-rate ${pr > 80 ? "pass-rate-high" : "pass-rate-low"}`}>
                        {pr}%
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="td-cell" style={{ textAlign: "center", padding: "2rem" }}>
                  Chưa có bài kiểm tra gần đây
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </>
  );
};

export default RecentQuizzesTable;