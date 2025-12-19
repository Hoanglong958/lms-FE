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

  // ================================
  // PAGINATION & FILTER STATE
  // ================================
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");

  const CATEGORIES = ["Java", "OOP", "HTTP", "Git", "React", "SQL", "Spring Boot"];

  const user = (() => { try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; } })();
  const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch Questions
  useEffect(() => {
    let alive = true;
    setLoading(true);

    const fetchQuestions = async () => {
      try {
        const res = await questionService.getPage({
          page: page - 1,
          size: limit,
          keyword: debouncedSearch,
          category: category === "Tất cả" ? "" : category,
          course: category === "Tất cả" ? "" : category,
          subject: category === "Tất cả" ? "" : category,
          courseName: category === "Tất cả" ? "" : category
        });

        if (!alive) return;

        const data = res.data;
        const content = data?.content || [];

        const mapped = content.map((q) => ({
          id: q?.id ?? q?.questionId,
          question: q?.questionText ?? q?.question_text ?? q?.title ?? "",
          course: q?.course ?? q?.category ?? "N/A",
          type: "N/A", // API might not return options length in list view, or we assume Tự luận if options empty
          raw: q,
        }));

        setQuestions(mapped);
        setTotalPages(data?.totalPages || 1);

      } catch (err) {
        if (alive) {
          console.error("Fetch questions error:", err);
          setQuestions([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchQuestions();

    return () => { alive = false; };
  }, [page, limit, debouncedSearch, category]);


  const handleView = (q) => {
    navigate(`/admin/quiz/question/${q.id}`);
  };

  const handleDelete = async (q) => {
    if (!isAdmin) { showNotification("Không có quyền", "Chỉ ADMIN được phép xóa câu hỏi", "error"); return; }
    const ok = window.confirm(`Bạn có chắc muốn xóa câu hỏi này?`);
    if (!ok) return;
    try {
      await questionService.delete(q.id);
      // Refresh current page
      const res = await questionService.getPage({
        page: page - 1,
        size: limit,
        keyword: debouncedSearch,
        category: category === "Tất cả" ? "" : category,
        course: category === "Tất cả" ? "" : category,
        subject: category === "Tất cả" ? "" : category,
        courseName: category === "Tất cả" ? "" : category
      });
      const data = res.data;
      const content = data?.content || [];
      const mapped = content.map((q) => ({
        id: q?.id ?? q?.questionId,
        question: q?.questionText ?? q?.question_text ?? q?.title ?? "",
        course: q?.course ?? q?.category ?? "N/A",
        type: "N/A",
        raw: q,
      }));
      setQuestions(mapped);
      setTotalPages(data?.totalPages || 1);

      showNotification("Thành công", "Đã xóa câu hỏi", "success");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Xóa câu hỏi thất bại";
      showNotification(`Lỗi ${status || ""}`, msg, "error");
    }
  };

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

          {/* FILTER BY CATEGORY */}
          <select
            className="question-filter"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả danh mục</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <table className="question-bank-table">
          <thead>
            <tr>
              <th>Câu hỏi</th>
              <th>Danh mục</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3}>Đang tải dữ liệu...</td></tr>
            ) : questions.length === 0 ? (
              <tr><td colSpan={3}>Không có câu hỏi phù hợp</td></tr>
            ) : questions.map((q) => (
              <tr key={q.id}>
                <td>{q.question}</td>
                <td>{q.course}</td>
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

        {/* PAGINATION */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "20px", gap: "10px" }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", background: page === 1 ? "#f5f5f5" : "white", cursor: page === 1 ? "default" : "pointer" }}
          >
            Trước
          </button>
          <span>Trang {page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", background: page >= totalPages ? "#f5f5f5" : "white", cursor: page >= totalPages ? "default" : "pointer" }}
          >
            Sau
          </button>
        </div>

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
