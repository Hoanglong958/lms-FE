import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileQuestion, Book, CheckSquare, PenSquare, Search, Activity, ChevronDown } from "lucide-react";
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
  const [totalElements, setTotalElements] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");

  const [categoryList, setCategoryList] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await questionService.getCategories({ size: 100 });
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : (data?.content || []);
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
      const res = await questionService.getAll();
      const data = res?.data ?? res;
      const content = data?.content || [];

      let mcCount = 0;
      let essayCount = 0;
      const uniqueCats = new Set();

      content.forEach(q => {
        const isMC = Array.isArray(q?.options) && q.options.length > 0;
        if (isMC) mcCount++;
        else essayCount++;

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
  }, [questions]);

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

  return (
    <div style={{
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: "#f5f5f5",
      minHeight: "100vh",
      padding: "28px 24px"
    }}>
      {/* Breadcrumbs */}
      <div style={{
        fontSize: 13,
        marginBottom: 16,
        fontWeight: 500
      }}>
        
      </div>

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
          <div style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
            flexShrink: 0
          }}>
            <FileQuestion size={24} />
          </div>
          <div>
            <h1 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 4px 0',
              lineHeight: 1.2
            }}>Ngân hàng câu hỏi</h1>
            <p style={{
              fontSize: 14,
              color: '#6b7280',
              margin: 0,
              fontWeight: 500
            }}>
              Quản lý danh sách câu hỏi sẵn sàng cho các quiz
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate("/admin/question-bank/add")}
            style={{
              background: 'white',
              color: '#f97316',
              border: '1px solid #e5e7eb',
              padding: '10px 20px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff7ed';
              e.currentTarget.style.borderColor = '#fdba74';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            ⚡ Tạo nhanh câu hỏi
          </button>
          <button
            onClick={() => navigate("/admin/question-bank/bulk")}
            style={{
              background: '#f97316',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ea580c';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f97316';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.2)';
            }}
          >
            + Thêm câu hỏi mới
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 20,
        marginBottom: 32
      }}>
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s'
        }}>
          <div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: 13,
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>Tổng câu hỏi</h3>
            <p style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1
            }}>{stats.total}</p>
          </div>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff7ed',
            color: '#f97316'
          }}>
            <FileQuestion size={20} />
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s'
        }}>
          <div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: 13,
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>Danh mục</h3>
            <p style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1
            }}>{stats.categories}</p>
          </div>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#eff6ff',
            color: '#2563eb'
          }}>
            <Book size={20} />
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s'
        }}>
          <div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: 13,
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>Trắc nghiệm</h3>
            <p style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1
            }}>{stats.multipleChoice}</p>
          </div>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0fdf4',
            color: '#16a34a'
          }}>
            <CheckSquare size={20} />
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s'
        }}>
          <div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: 13,
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>Tự luận</h3>
            <p style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1
            }}>{stats.essay}</p>
          </div>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#faf5ff',
            color: '#9333ea'
          }}>
            <PenSquare size={20} />
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section style={{
        background: 'white',
        borderRadius: 12,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            pointerEvents: 'none'
          }} size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 14,
              color: '#374151',
              background: '#fafafa',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#f97316';
              e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.background = '#fafafa';
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <Activity style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            pointerEvents: 'none'
          }} size={18} />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '10px 40px 10px 42px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              background: '#fafafa',
              color: '#374151',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              appearance: 'none',
              minWidth: 180,
              outline: 'none'
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
          <ChevronDown style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            pointerEvents: 'none'
          }} size={16} />
        </div>

        <span style={{
          fontSize: 14,
          color: '#6b7280',
          whiteSpace: 'nowrap',
          fontWeight: 500,
          padding: '0 8px'
        }}>
          {totalElements} kết quả
        </span>
      </section>

      {/* Table */}
      <section style={{
        background: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{
                padding: '14px 24px',
                textAlign: 'left',
                fontSize: 13,
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                borderBottom: '1px solid #e5e7eb'
              }}>Câu hỏi</th>
              <th style={{
                padding: '14px 24px',
                textAlign: 'left',
                fontSize: 13,
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                borderBottom: '1px solid #e5e7eb'
              }}>Danh mục</th>
              <th style={{
                padding: '14px 24px',
                textAlign: 'left',
                fontSize: 13,
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                borderBottom: '1px solid #e5e7eb'
              }}>Loại</th>
              <th style={{
                padding: '14px 24px',
                textAlign: 'right',
                fontSize: 13,
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                borderBottom: '1px solid #e5e7eb'
              }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: '#6b7280' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: '#6b7280' }}>Không có câu hỏi phù hợp</td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px', color: '#374151', fontSize: 14 }}>{q.question}</td>
                  <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: 14 }}>{q.course}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: q.type === 'Trắc nghiệm' ? '#E0F2FE' : '#FEF3C7',
                      color: q.type === 'Trắc nghiệm' ? '#0284C7' : '#D97706',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {q.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleView(q)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: '#f1f5f9',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Xem"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleEditOpen(q)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: '#f1f5f9',
                        border: 'none',
                        cursor: 'pointer',
                        marginRight: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Sửa"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(q)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: '#fee2e2',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '16px 24px',
          gap: 10,
          borderTop: '1px solid #f1f5f9'
        }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: 'white',
              color: page === 1 ? '#9ca3af' : '#374151',
              fontSize: 14,
              fontWeight: 500,
              cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ‹ Trước
          </button>
          <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
            Trang {page}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: 'white',
              color: page >= totalPages ? '#9ca3af' : '#374151',
              fontSize: 14,
              fontWeight: 500,
              cursor: page >= totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Sau ›
          </button>
        </div>
      </section>

      {/* Detail Modal */}
      {openDetail && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            width: 'min(600px, 92vw)',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: 20, color: '#1e293b' }}>Chi tiết câu hỏi</h3>
              <button
                onClick={() => setOpenDetail(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >✖</button>
            </div>
            <div style={{ padding: 32 }}>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Danh mục</span>
                <div style={{ color: '#6b7280', marginTop: 4 }}>{detailData?.category || "N/A"}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Câu hỏi</span>
                <div style={{ color: '#374151', marginTop: 4 }}>{detailData?.questionText || ""}</div>
              </div>
              {Array.isArray(detailData?.options) && detailData.options.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Lựa chọn</span>
                  <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                    {detailData.options.map((op, i) => (
                      <li key={i} style={{ marginBottom: 4, color: '#374151' }}>
                        {op} {detailData.correctAnswer === op ? "✅ (Đúng)" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detailData?.explanation && (
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Giải thích</span>
                  <div style={{ color: '#6b7280', marginTop: 4 }}>{detailData.explanation}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {openEdit && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            width: 'min(700px, 92vw)',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: 20, color: '#1e293b' }}>Chỉnh sửa câu hỏi</h3>
              <button
                onClick={() => setOpenEdit(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >✖</button>
            </div>
            <div style={{ padding: 32 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Danh mục</label>
              <input
                value={editForm.category}
                onChange={(e) => changeEditField("category", e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  marginBottom: 20,
                  outline: 'none',
                  background: '#f8fafc'
                }}
              />
              <label style={{ fontSize: 14, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Câu hỏi</label>
              <textarea
                rows={3}
                value={editForm.questionText}
                onChange={(e) => changeEditField("questionText", e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  marginBottom: 20,
                  outline: 'none',
                  background: '#f8fafc',
                  resize: 'vertical'
                }}
              />
              <label style={{ fontSize: 14, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Các lựa chọn (Để trống nếu là tự luận)</label>
              {Array.isArray(editForm.options) &&
                editForm.options.map((op, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      value={op}
                      onChange={(e) => changeEditOption(idx, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none',
                        background: '#f8fafc'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeEditOption(idx)}
                      style={{
                        padding: '8px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >−</button>
                  </div>
                ))}
              <button
                type="button"
                onClick={addEditOption}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #f97316',
                  borderRadius: 8,
                  background: 'white',
                  color: '#f97316',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginBottom: 20
                }}
              >+ Thêm đáp án</button>

              {editForm.options.length > 0 && (
                <>
                  <label style={{ fontSize: 14, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Đáp án đúng</label>
                  <select
                    value={editForm.correctAnswer}
                    onChange={(e) => changeEditField("correctAnswer", e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: 15,
                      marginBottom: 20,
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                  >
                    <option value="">-- Chọn --</option>
                    {editForm.options
                      .filter((x) => x && x.trim())
                      .map((op, i) => (
                        <option key={i} value={op}>{op}</option>
                      ))}
                  </select>
                </>
              )}

              <label style={{ fontSize: 14, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Giải thích</label>
              <textarea
                value={editForm.explanation}
                onChange={(e) => changeEditField("explanation", e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  marginBottom: 20,
                  outline: 'none',
                  background: '#f8fafc',
                  resize: 'vertical',
                  minHeight: 80
                }}
              />
            </div>
            <div style={{
              padding: '24px 32px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20
            }}>
              <button
                onClick={() => setOpenEdit(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >Hủy</button>
              <button
                disabled={savingEdit}
                onClick={saveEdit}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: savingEdit ? 'not-allowed' : 'pointer',
                  opacity: savingEdit ? 0.7 : 1
                }}
              >{savingEdit ? "Đang lưu..." : "Lưu thay đổi"}</button>
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
