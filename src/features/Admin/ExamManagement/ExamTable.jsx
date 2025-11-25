import React from "react";
import "./ExamTable.css";

export default function ExamTable({ exams = [], loading = false, onEdit, onDelete, onViewDetail }) {
  const columns = [
    "Tên kỳ thi",
    "Số câu hỏi",
    "Thời gian",
    "Điểm đạt",
    "Bắt đầu",
    "Kết thúc",
    "Trạng thái",
    "Thao tác",
  ];

  const formatDateTime = (val) => {
    try {
      return new Date(val).toLocaleString();
    } catch {
      return val;
    }
  };

  const formatDuration = (exam) => {
    const dm = exam.durationMinutes;
    if (typeof dm === "number" && !isNaN(dm)) return `${dm} phút`;
    const d = exam.duration;
    if (typeof d === "string") {
      // nếu chuỗi đã có "phút" thì giữ nguyên
      return /phút/i.test(d) ? d : `${d} phút`;
    }
    return "-";
  };

  const renderStatus = (status) => {
    const map = {
      UPCOMING: { text: "Sắp diễn ra", cls: "badge secondary" },
      ONGOING: { text: "Đang diễn ra", cls: "badge" },
      COMPLETED: { text: "Đã kết thúc", cls: "badge outline" },
      CANCELLED: { text: "Đã hủy", cls: "badge danger" },
    };
    const cfg = map[status] || { text: status || "", cls: "badge outline" };
    return <span className={cfg.cls}>{cfg.text}</span>;
  };

  return (
    <div className="examtbl-card">
      <table className="examtbl">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="examtbl-empty">Đang tải dữ liệu...</td>
            </tr>
          ) : exams.length === 0 ? (
            <tr>
              <td colSpan={8} className="examtbl-empty">Không có dữ liệu</td>
            </tr>
          ) : (
            exams.map((exam) => (
              <tr key={exam.id}>
                <td>
                  <div className="examtbl-title">
                    <div className="title-text">{exam.title || exam.name}</div>
                    {exam.description && (
                      <div className="title-desc" title={exam.description}>{exam.description}</div>
                    )}
                  </div>
                </td>
                <td>{exam.totalQuestions ?? exam.questions?.length ?? 0}</td>
                <td>{formatDuration(exam)}</td>
                <td>{exam.passingScore ? `${exam.passingScore}/${exam.maxScore}` : "N/A"}</td>
                <td>{formatDateTime(exam.startTime || exam.startAt)}</td>
                <td>{formatDateTime(exam.endTime || exam.endAt)}</td>
                <td>{renderStatus(exam.status)}</td>
                <td>
                  <div className="examtbl-actions">
                    <button className="btn-icon view" title="Xem chi tiết" onClick={() => onViewDetail && onViewDetail(exam.id)}>👁️</button>
                    <button className="btn-icon edit" title="Chỉnh sửa" onClick={() => onEdit && onEdit(exam)}>✏️</button>
                    <button className="btn-icon delete" title="Xóa" onClick={() => onDelete && onDelete(exam.id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
