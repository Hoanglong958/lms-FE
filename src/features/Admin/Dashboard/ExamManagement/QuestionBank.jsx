import React from "react";
import "./QuestionBank.css";
import { useNavigate } from "react-router-dom";

export default function QuestionBank() {
  const navigate = useNavigate();

  const questions = [
    { id: 1, question: "React là thư viện hay framework?", level: "Dễ", type: "Trắc nghiệm" },
    { id: 2, question: "Hook useEffect dùng để làm gì?", level: "Trung bình", type: "Tự luận" },
    { id: 3, question: "Props khác State như thế nào?", level: "Khó", type: "Trắc nghiệm" },
  ];

  return (
    <div className="question-bank-container">
      <div className="question-bank-header">
        <div>
          <h2>📚 Ngân hàng câu hỏi</h2>
          <p>Quản lý danh sách câu hỏi dùng cho các quiz</p>
        </div>

        <button
          className="question-btn add"
          onClick={() => navigate("/admin/question/create")}
        >
          + Thêm câu hỏi mới
        </button>
      </div>

      <div className="question-bank-table-section">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm câu hỏi..."
          className="question-search"
        />

        <table className="question-bank-table">
          <thead>
            <tr>
              <th>Câu hỏi</th>
              <th>Mức độ</th>
              <th>Loại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td>{q.question}</td>
                <td>{q.level}</td>
                <td>{q.type}</td>
                <td>
                  <button
                    className="btn-icon"
                    onClick={() => alert(`Xem câu hỏi: ${q.question}`)}
                  >
                    👁️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => alert(`Sửa câu hỏi: ${q.question}`)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() =>
                      window.confirm("Bạn có chắc muốn xóa câu hỏi này?")
                    }
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
