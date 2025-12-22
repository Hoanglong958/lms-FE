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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");

  const CATEGORIES = ["Java", "OOP", "HTTP", "Git", "React", "SQL", "Spring Boot"];

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
        type: Array.isArray(q?.options) && q.options.length > 0 ? "Trắc nghiệm" : "Tự luận",
        raw: q,
      }));
      setQuestions(mapped);
      setTotalPages(data?.totalPages || 1);
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
  const [openBulk, setOpenBulk] = useState(false);
  const [bulkJSON, setBulkJSON] = useState(
    '[{"category":"Java","questionText":"Ví dụ câu hỏi?","options":["A","B","C","D"],"correctAnswer":"A","explanation":"Giải thích"}]'
  );

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

  const submitBulk = async () => {
    if (!isAdmin) {
      showNotification("Không có quyền", "Chỉ ADMIN được phép tạo hàng loạt", "error");
      return;
    }
    let arr;
    try {
      arr = JSON.parse(bulkJSON);
      if (!Array.isArray(arr)) throw new Error("invalid");
    } catch {
      showNotification("Lỗi", "Dữ liệu không hợp lệ (JSON)", "error");
      return;
    }
    try {
      await questionService.bulkCreate(arr);
      setOpenBulk(false);
      showNotification("Thành công", "Đã tạo nhiều câu hỏi", "success");
      setPage(1);
      setDebouncedSearch("");
      setCategory("");
      await refreshList();
    } catch {
      showNotification("Lỗi", "Tạo hàng loạt thất bại", "error");
    }
  };

  return (
    <div className="question-bank-container">
      <div className="question-bank-header">
        <div>
          <h2>📚 Ngân hàng câu hỏi</h2>
          <p>Quản lý danh sách câu hỏi dùng cho các quiz</p>
        </div>

        <div className="question-actions">
          <button
            className="question-btn add"
            onClick={() => navigate("/admin/question-bank/add")}
          >
            + Thêm câu hỏi mới
          </button>
          <button className="question-btn add" onClick={() => navigate("/admin/question-bank/bulk")}>
            + Tạo nhiều câu hỏi
          </button>
        </div>
      </div>

      <div className="question-bank-table-section">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm câu hỏi..."
          className="question-search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="filter-row">
          <select
            className="question-filter"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả danh mục</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

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
                <td colSpan={3}>Đang tải dữ liệu...</td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={3}>Không có câu hỏi phù hợp</td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.question}</td>
                  <td>{q.course}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleView(q)}>
                      👁️
                    </button>
                    <button className="btn-icon" onClick={() => handleEditOpen(q)}>
                      ✏️
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(q)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: page === 1 ? "#f5f5f5" : "white",
              cursor: page === 1 ? "default" : "pointer",
            }}
          >
            Trước
          </button>
          <span>
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: page >= totalPages ? "#f5f5f5" : "white",
              cursor: page >= totalPages ? "default" : "pointer",
            }}
          >
            Sau
          </button>
        </div>
      </div>

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
                <b>Danh mục:</b> {detailData?.category || ""}
              </div>
              <div style={{ marginBottom: 12 }}>
                <b>Câu hỏi:</b> {detailData?.questionText || ""}
              </div>
              {Array.isArray(detailData?.options) && detailData.options.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Lựa chọn</div>
                  <ul>
                    {detailData.options.map((op, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        {op} {detailData.correctAnswer === op ? "✅" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detailData?.explanation && <div><b>Giải thích:</b> {detailData.explanation}</div>}
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
              <input
                className="qb-input"
                value={editForm.questionText}
                onChange={(e) => changeEditField("questionText", e.target.value)}
              />
              <label className="qb-label">Các lựa chọn</label>
              {Array.isArray(editForm.options) &&
                editForm.options.map((op, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      className="qb-input"
                      value={op}
                      onChange={(e) => changeEditOption(idx, e.target.value)}
                    />
                    <button type="button" className="qb-btn small" onClick={() => removeEditOption(idx)}>
                      −
                    </button>
                  </div>
                ))}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button type="button" className="qb-btn submit" onClick={addEditOption}>
                  Thêm đáp án
                </button>
              </div>
              <label className="qb-label">Đáp án đúng</label>
              <select
                className="qb-input"
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
                {savingEdit ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openBulk && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <h3>Tạo nhiều câu hỏi</h3>
              <button className="btn-icon" onClick={() => setOpenBulk(false)}>
                ✖
              </button>
            </div>
            <div className="modal-body">
              <textarea
                className="qb-textarea"
                rows={14}
                value={bulkJSON}
                onChange={(e) => setBulkJSON(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="qb-btn cancel" onClick={() => setOpenBulk(false)}>
                Hủy
              </button>
              <button className="qb-btn submit" onClick={submitBulk}>
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

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

