import React, { useEffect, useState } from "react";
import "./QuestionBank.css";
import { useNavigate } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { questionService } from "@utils/questionService.js";
import { FileText, Book, CheckSquare, FileEdit, Sparkles } from "lucide-react";

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");

  const [categoryList, setCategoryList] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await questionService.getCategories({ size: 100 }); // Get plenty
      const data = res?.data ?? res;
      // Assuming API returns array of strings or objects with name?
      // User prompt says: "Trả về danh sách các category duy nhất hiện có". 
      // Typical backend might return ["Java", "OOP"] or [{id:1, name:"Java"}]. 
      // Let's assume array of strings based on context "danh sách các category duy nhất".
      // If data.content exists (pagination), use that.
      const list = Array.isArray(data) ? data : (data?.content || []);
      // Filter out any non-string or empty if necessary, but usually backend handles unique list
      setCategoryList(list);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    } catch {
      return {};
    }
  })();
  const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchText]);

  const refreshList = async () => {
    setLoading(true);
    let alive = true;
    try {
      const res = await questionService.getPage({
        page: page - 1,
        size: limit,
        keyword: debouncedSearch,
        category: category || "",
      });
      if (!alive) return;
      const data = res?.data ?? res;
      const content = data?.content || [];
      const mapped = content.map((q) => ({
        id: q?.id ?? q?.questionId,
        question: q?.questionText ?? q?.question_text ?? q?.title ?? "",
        course: q?.course ?? q?.category ?? "N/A",
        // Logic: Options exist -> Trắc nghiệm, else Tự luận. Ensure no "Đúng/Sai" text is manually added.
        type: Array.isArray(q?.options) && q.options.length > 0 ? "Trắc nghiệm" : "Tự luận",
        raw: q,
      }));
      setQuestions(mapped);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || mapped.length);
    } catch {
      setQuestions([]);
    } finally {
      if (alive) setLoading(false);
    }
    return () => {
      alive = false;
    };
  };

  useEffect(() => {
    refreshList();
  }, [page, limit, debouncedSearch, category]);

  const [stats, setStats] = useState({
    total: 0,
    categories: 0,
    multipleChoice: 0,
    essay: 0,
  });

  const fetchStats = async () => {
    try {
      // Fetch all questions to calculate stats
      const res = await questionService.getAll();
      const data = res?.data ?? res;
      const content = data?.content || [];

      let mcCount = 0;
      let essayCount = 0;
      const uniqueCats = new Set();

      content.forEach(q => {
        // Determine type
        const isMC = Array.isArray(q?.options) && q.options.length > 0;
        if (isMC) mcCount++;
        else essayCount++;

        // Collect categories
        const cat = q?.course || q?.category;
        if (cat) uniqueCats.add(cat);
      });

      setStats({
        total: data?.totalElements || content.length,
        categories: uniqueCats.size,
        multipleChoice: mcCount,
        essay: essayCount
      });

    } catch (e) {
      console.error("Failed to fetch stats", e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [questions]); // Re-fetch stats when list updates (e.g. after delete/add)

  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    category: "",
    questionText: "",
    options: ["", ""],
    correctAnswer: "",
    explanation: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [openBulk, setOpenBulk] = useState(false); // Can remove if unused, but button action changed
  // Cleanup unnecessary local bulk state if moving everything to page

  // Import logic moved to QuestionBankBulk.jsx


  const handleView = async (q) => {
    try {
      const res = await questionService.getById(q.id);
      const data = res?.data ?? res;
      const d = data?.data || data?.item || data?.content || data;
      setDetailData({
        id: d?.id || q.id,
        category: d?.category || "",
        questionText: d?.questionText || d?.title || "",
        options: Array.isArray(d?.options) ? d.options : [],
        correctAnswer: d?.correctAnswer || "",
        explanation: d?.explanation || "",
      });
      setOpenDetail(true);
    } catch {
      showNotification("Lỗi", "Không tải được chi tiết câu hỏi", "error");
    }
  };

  const handleEditOpen = async (q) => {
    try {
      const res = await questionService.getById(q.id);
      const data = res?.data ?? res;
      const d = data?.data || data?.item || data?.content || data;
      const opts = Array.isArray(d?.options) ? d.options : [];
      setEditForm({
        id: d?.id || q.id,
        category: d?.category || "",
        questionText: d?.questionText || d?.title || "",
        options: opts.length ? opts : ["", ""],
        correctAnswer: d?.correctAnswer || (opts[0] || ""),
        explanation: d?.explanation || "",
      });
      setOpenEdit(true);
    } catch {
      showNotification("Lỗi", "Không thể mở form chỉnh sửa", "error");
    }
  };

  const changeEditField = (name, value) => {
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const changeEditOption = (index, value) => {
    setEditForm((prev) => {
      const next = [...prev.options];
      next[index] = value;
      let ca = prev.correctAnswer;
      if (ca && !next.includes(ca)) {
        const first = next.find((x) => x && x.trim());
        ca = first || "";
      }
      return { ...prev, options: next, correctAnswer: ca };
    });
  };
  const addEditOption = () => {
    setEditForm((prev) => ({ ...prev, options: [...prev.options, ""] }));
  };
  const removeEditOption = (idx) => {
    setEditForm((prev) => {
      const next = prev.options.filter((_, i) => i !== idx);
      let ca = prev.correctAnswer;
      if (ca && !next.includes(ca)) {
        const first = next.find((x) => x && x.trim());
        ca = first || "";
      }
      return { ...prev, options: next.length ? next : [""], correctAnswer: ca };
    });
  };
  const saveEdit = async () => {
    if (!isAdmin) {
      showNotification("Không có quyền", "Chỉ ADMIN được phép sửa", "error");
      return;
    }
    if (!editForm.questionText.trim()) return;
    const cleaned = Array.isArray(editForm.options) ? editForm.options.filter((x) => x && x.trim()) : [];
    const payload = {
      category: editForm.category || "",
      questionText: editForm.questionText,
      options: cleaned,
      correctAnswer: cleaned.length
        ? cleaned.includes(editForm.correctAnswer)
          ? editForm.correctAnswer
          : cleaned[0]
        : "",
      explanation: editForm.explanation || "",
    };
    try {
      setSavingEdit(true);
      await questionService.update(editForm.id, payload);
      setOpenEdit(false);
      setSavingEdit(false);
      showNotification("Thành công", "Đã cập nhật câu hỏi", "success");
      await refreshList();
    } catch {
      setSavingEdit(false);
      showNotification("Lỗi", "Cập nhật thất bại", "error");
    }
  };

  const handleDelete = async (q) => {
    if (!isAdmin) {
      showNotification("Không có quyền", "Chỉ ADMIN được phép xóa câu hỏi", "error");
      return;
    }
    const ok = window.confirm(`Bạn có chắc muốn xóa câu hỏi này?`);
    if (!ok) return;
    try {
      await questionService.delete(q.id);
      await refreshList();
      showNotification("Thành công", "Đã xóa câu hỏi", "success");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Xóa câu hỏi thất bại";
      showNotification(`Lỗi ${status || ""}`, msg, "error");
    }
  };

  // Submit bulk logic moved to QuestionBankBulk.jsx


  return (
    <div className="question-bank-container">
      {/* Breadcrumb */}
      <div className="qb-breadcrumb">
        <span>Ngân hàng câu hỏi</span> / <span>Dashboard</span> / <span className="active">Tất cả câu hỏi</span>
      </div>

      {/* Header */}
      <div className="question-bank-header">
        <div className="qb-title-section">
          <div className="qb-icon-box">
            <i className="fa fa-question">?</i>
          </div>
          <div className="qb-title-text">
            <h2>Ngân hàng câu hỏi</h2>
            <p>Quản lý danh sách câu hỏi sẵn sàng cho các quiz</p>
          </div>
        </div>

        <div className="question-actions">
          {/* Logic Swap: "Tạo nhanh câu hỏi" -> Add Single */}
          <button
            className="qb-btn-action outline"
            onClick={() => navigate("/admin/question-bank/add")}
          >
            ⚡ Tạo nhanh câu hỏi
          </button>

          {/* Logic Swap: "Thêm câu hỏi mới" -> Bulk Create Page */}
          <button className="qb-btn-action primary" onClick={() => navigate("/admin/question-bank/bulk")}>
            + Thêm câu hỏi mới
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, marginBottom: 32 }}>
        {[
          { label: "Tổng câu hỏi", value: stats.total, icon: <FileText size={24} />, color: "#f97316", bg: "#fff7ed" },
          { label: "Danh mục", value: stats.categories, icon: <Book size={24} />, color: "#3b82f6", bg: "#eff6ff" }
        ].map((stat, index) => (
          <div key={index} style={{
            borderRadius: 16,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minHeight: 140,
            justifyContent: "space-between",
            backgroundColor: stat.bg,
            border: "none"
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              backgroundColor: stat.color,
              color: "#fff"
            }}>
              {stat.icon}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: "1", marginBottom: 8 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 14, color: "#4b5563", fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
            <div style={{ position: "absolute", top: 24, right: 24 }}>
              <Sparkles size={20} color={stat.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-container">
        <div className="filter-left">
          <div className="search-wrapper">
            <span>🔍</span>
            <input
              type="text"
              placeholder=" Tìm kiếm câu hỏi..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginLeft: 8 }}
            />
          </div>

          <div className="filter-dropdown">
            <span>Y</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả danh mục</option>
              {categoryList.map((cat, index) => {
                const val = cat?.name || cat;
                return (
                  <option key={index} value={val}>
                    {val} {cat?.count ? `(${cat.count})` : ''}
                  </option>
                );
              })}
            </select>
          </div>


        </div>

        <div className="filter-right">
          Tìm thấy: <span className="filter-count">{totalElements}</span> câu hỏi
        </div>
      </div>

      {/* Table Section */}
      <div className="question-bank-table-section">
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
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>Đang tải dữ liệu...</td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>Không có câu hỏi phù hợp</td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.question}</td>
                  <td>{q.course}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleView(q)} title="Xem">
                      👁️
                    </button>
                    <button className="btn-icon" onClick={() => handleEditOpen(q)} title="Sửa">
                      ✏️
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(q)} title="Xóa">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: "20px",
            gap: "10px",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="qb-btn cancel"
            style={{ padding: "6px 12px" }}
          >
            Trước
          </button>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="qb-btn cancel"
            style={{ padding: "6px 12px" }}
          >
            Sau
          </button>
        </div>
      </div>

      {/* Modals */}
      {openDetail && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Chi tiết câu hỏi</h3>
              <button className="btn-icon" onClick={() => setOpenDetail(false)}>
                ✖
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 8 }}>
                <span className="qb-label">Danh mục</span>
                <div>{detailData?.category || "N/A"}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span className="qb-label">Câu hỏi</span>
                <div>{detailData?.questionText || ""}</div>
              </div>
              {Array.isArray(detailData?.options) && detailData.options.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <span className="qb-label">Lựa chọn</span>
                  <ul style={{ paddingLeft: 20 }}>
                    {detailData.options.map((op, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        {op} {detailData.correctAnswer === op ? "✅ (Đúng)" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detailData?.explanation && (
                <div>
                  <span className="qb-label">Giải thích</span>
                  <div>{detailData.explanation}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {openEdit && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Chỉnh sửa câu hỏi</h3>
              <button className="btn-icon" onClick={() => setOpenEdit(false)}>
                ✖
              </button>
            </div>
            <div className="modal-body">
              <label className="qb-label">Danh mục</label>
              <input
                className="qb-input"
                value={editForm.category}
                onChange={(e) => changeEditField("category", e.target.value)}
              />
              <label className="qb-label">Câu hỏi</label>
              <textarea
                className="qb-textarea"
                rows={3}
                value={editForm.questionText}
                onChange={(e) => changeEditField("questionText", e.target.value)}
              />
              <label className="qb-label">Các lựa chọn (Để trống nếu là tự luận)</label>
              {Array.isArray(editForm.options) &&
                editForm.options.map((op, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      className="qb-input"
                      value={op}
                      onChange={(e) => changeEditOption(idx, e.target.value)}
                      style={{ marginBottom: 0 }}
                    />
                    <button type="button" className="qb-btn small" onClick={() => removeEditOption(idx)}>
                      −
                    </button>
                  </div>
                ))}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button type="button" className="qb-btn outline" onClick={addEditOption} style={{ fontSize: '12px' }}>
                  + Thêm đáp án
                </button>
              </div>

              {editForm.options.length > 0 && (
                <>
                  <label className="qb-label">Đáp án đúng</label>
                  <select
                    className="qb-select"
                    value={editForm.correctAnswer}
                    onChange={(e) => changeEditField("correctAnswer", e.target.value)}
                  >
                    <option value="">-- Chọn --</option>
                    {editForm.options
                      .filter((x) => x && x.trim())
                      .map((op, i) => (
                        <option key={i} value={op}>
                          {op}
                        </option>
                      ))}
                  </select>
                </>
              )}

              <label className="qb-label">Giải thích</label>
              <textarea
                className="qb-textarea"
                value={editForm.explanation}
                onChange={(e) => changeEditField("explanation", e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="qb-btn cancel" onClick={() => setOpenEdit(false)}>
                Hủy
              </button>
              <button className="qb-btn submit" disabled={savingEdit} onClick={saveEdit}>
                {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk/Import Modal removed - moved to separate page QuestionBankBulk.jsx */}


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
