import React, { useEffect, useState } from "react";
import "./QuestionBank.css";
import { useNavigate } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { questionService } from "@utils/questionService.js";

export default function QuestionBank() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const user = (() => { try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; } })();
  const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";

  useEffect(() => {
    let alive = true;
    setLoading(true);
    questionService
      .getAll()
      .then((res) => {
        const raw = res?.data;
        const arr = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.content)
          ? raw.content
          : [];
        const mapped = arr.map((q) => ({
          id: q?.id ?? q?.questionId ?? q?.id,
          question: q?.questionText ?? q?.title ?? "",
          course: q?.course ?? q?.category ?? "",
          type: Array.isArray(q?.options) && q.options.length > 0 ? "Trắc nghiệm" : "Tự luận",
          raw: q,
        }));
        if (alive) setQuestions(mapped);
      })
      .catch(() => { if (alive) setQuestions([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);


  // ================================
  // FILTER STATE
  // ================================
  const [filterType, setFilterType] = useState("Tất cả");

  const handleView = (q) => {
    navigate(`/admin/quiz/question/${q.id}`);
  };

  const handleDelete = async (q) => {
    if (!isAdmin) { showNotification("Không có quyền", "Chỉ ADMIN được phép xóa câu hỏi", "error"); return; }
    const ok = window.confirm(`Bạn có chắc muốn xóa câu hỏi này?`);
    if (!ok) return;
    try {
      await questionService.delete(q.id);
      setQuestions((prev) => prev.filter((x) => x.id !== q.id));
      showNotification("Thành công", "Đã xóa câu hỏi", "success");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Xóa câu hỏi thất bại";
      showNotification(`Lỗi ${status || ""}`, msg, "error");
    }
  };

  // ================================
  // FILTER APPLY
  // ================================
  const filteredQuestions = questions.filter((q) => {
    const matchType = filterType === "Tất cả" ? true : q.type === filterType;
    const s = searchText.trim().toLowerCase();
    const matchSearch = !s ? true : String(q.question || "").toLowerCase().includes(s);
    return matchType && matchSearch;
  });

  return (
    <div className="question-bank-container">
      <div className="question-bank-header">
        <div>
          <h2>📚 Ngân hàng câu hỏi</h2>
          <p>Quản lý danh sách câu hỏi dùng cho các quiz</p>
        </div>

        <button
          className="question-btn add"
          onClick={() => navigate("/admin/question-bank/create")}
        >
          + Thêm câu hỏi mới
        </button>
      </div>

      <div className="question-bank-table-section">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="🔍 Tìm kiếm câu hỏi..."
          className="question-search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* FILTER ROW */}
        <div className="filter-row">

          {/* FILTER BY TYPE */}
          <select
            className="question-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="Tất cả">Tất cả loại</option>
            <option value="Trắc nghiệm">Trắc nghiệm</option>
            <option value="Tự luận">Tự luận</option>
          </select>

          

        </div>

          {/* TABLE */}
          <table className="question-bank-table">
            <thead>
              <tr>
                <th>Câu hỏi</th>
                <th>Loại</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
            {loading ? (
              <tr><td colSpan={3}>Đang tải dữ liệu...</td></tr>
            ) : filteredQuestions.length === 0 ? (
              <tr><td colSpan={3}>Không có câu hỏi phù hợp</td></tr>
            ) : filteredQuestions.map((q) => (
              <tr key={q.id}>
                <td>{q.question}</td>
                <td>{q.type}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleView(q)}>
                    👁️
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => showNotification("Thông báo", `Sửa câu hỏi: ${q.question}`, "info")}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDelete(q)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
