import React, { useEffect, useState } from "react";
import { FileText, Clock, TrendingUp, CheckCircle2, Search, Activity, ChevronDown } from "lucide-react";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./ExamManagement.css";
import { useNavigate, useOutletContext } from "react-router-dom";
import { examService } from "@utils/examService.js";
import { courseService } from "@utils/courseService";
import { classService } from "@utils/classService";
import ExamCreateDialog from "./ExamCreateDialog";
import ExamEditDialog from "./ExamEditDialog";
import ExamTable from "./ExamTable";

export default function ExamManagement() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; } })();
  const userRole = String(user?.role || "").toUpperCase();
  const canManage = userRole === "ROLE_ADMIN" || userRole === "ROLE_TEACHER";
  const isAdmin = userRole === "ROLE_ADMIN"; // Keep for specific admin-only checks if any

  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [avgScoreGlobal, setAvgScoreGlobal] = useState(0);

  const [allCourses, setAllCourses] = useState([]);
  const [allClasses, setAllClasses] = useState([]);

  const loadExams = async () => {
    try {
      setLoading(true);

      // Fetch metadata first
      const [courseRes, classRes] = await Promise.all([
        courseService.getCourses(),
        classService.getClasses()
      ]);
      const cList = Array.isArray(courseRes.data) ? courseRes.data : (courseRes.data?.data || []);
      const lList = Array.isArray(classRes.data) ? classRes.data : (classRes.data?.data || []);
      setAllCourses(cList);
      setAllClasses(lList);

      const res = await examService.getExams();
      const raw = res?.data ?? {};
      const apiArr = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(raw.content)
            ? raw.content
            : Array.isArray(raw.items)
              ? raw.items
              : Array.isArray(raw.data?.content)
                ? raw.data.content
                : Array.isArray(raw.data?.items)
                  ? raw.data.items
                  : [];

      const toNumber = (val) => {
        if (val === undefined || val === null) return 0;
        if (typeof val === "number" && Number.isFinite(val)) return val;
        if (typeof val === "string") {
          const num = Number(val.replace(/[\s,]/g, ""));
          return Number.isFinite(num) ? num : 0;
        }
        if (Array.isArray(val)) return val.length;
        if (typeof val === "object") {
          const candidates = [val.value, val.count, val.total, val.number];
          for (const c of candidates) {
            const n = toNumber(c);
            if (Number.isFinite(n) && n !== 0) return n;
          }
        }
        return 0;
      };

      const mapped = apiArr.map((e) => ({
        id: e.id,
        name: e.title || e.name,
        description: e.description,
        course: String(e.courseId ?? e.course ?? ""),
        students:
          toNumber(
            e.students ??
            e.participants ??
            e.participantCount ??
            e.attempts ??
            e.totalAttempts ??
            e.submissions
          ),
        avgScore: toNumber(
          e.avgScore ?? e.averageScore ?? e.avg ?? e.meanScore ?? e.scoreAvg ?? e?.stats?.avgScore
        ),
        passRate: toNumber(
          e.passRate ?? e.passRatio ?? e.passPercentage ?? e.passPercent ?? e?.stats?.passRate
        ),
        totalQuestions: toNumber(
          e.totalQuestions ?? e.questionCount ?? e.questions
        ),
        maxScore: toNumber(e.maxScore),
        passingScore: toNumber(e.passingScore),
        durationMinutes: toNumber(e.durationMinutes ?? e.duration),
        duration: (e.durationMinutes ?? e.duration)
          ? `${toNumber(e.durationMinutes ?? e.duration)} phút`
          : "-",
        startTime: e.startTime || e.startAt,
        endTime: e.endTime || e.endAt,
        status: e.status || "Đang mở",
        courseId: e.courseId,
        classId: e.classId,
        courseName: cList.find(c => c.id === e.courseId)?.title || "",
        className: lList.find(l => l.id === e.classId)?.className || "",
      }));
      setExams(mapped);
      const sumFromList = mapped.reduce((s, e) => s + (Number(e.students) || 0), 0);
      const avgFromList = (() => {
        const total = mapped.reduce((s, e) => s + (Number(e.avgScore) || 0), 0);
        const count = mapped.length;
        return count > 0 ? total / count : 0;
      })();
      setStudentsTotal(sumFromList);
      setAvgScoreGlobal(avgFromList);
      const needFetch = sumFromList === 0 || avgFromList === 0;
      if (needFetch) {
        const limited = mapped.slice(0, 10);
        Promise.all(
          limited.map((ex) =>
            examService
              .listAttempts(Number(ex.id))
              .then((res) => {
                const arr = Array.isArray(res?.data) ? res.data : [];
                const count = arr.length;
                const avg = arr.length > 0
                  ? arr.reduce((s, a) => s + (Number(a?.score) || 0), 0) / arr.length
                  : 0;
                return { id: ex.id, count, avg };
              })
              .catch(() => ({ id: ex.id, count: 0, avg: 0 }))
          )
        ).then((stats) => {
          const totalCount = stats.reduce((s, x) => s + x.count, 0);
          const avgAll = (() => {
            const totalAvg = stats.reduce((s, x) => s + x.avg, 0);
            const n = stats.length;
            return n > 0 ? totalAvg / n : 0;
          })();
          setStudentsTotal(totalCount);
          setAvgScoreGlobal(avgAll);
        });
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Không thể tải danh sách kỳ thi";
      if (status === 400) {
        alert(`Lỗi 400: ${msg}`);
      }
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  const handleAddExam = () => {
    setOpenCreate(true);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setOpenEdit(true);
  };

  const handleDelete = (exam) => {
    (async () => {
      if (!canManage) {
        alert("Bạn không có quyền xóa kỳ thi.");
        return;
      }
      const ok = window.confirm(`Bạn có chắc muốn xóa "${exam.name}" không?`);
      if (!ok) return;
      try {
        await examService.deleteExam(exam.id);
        await loadExams();
      } catch (err) {
        const status = err?.response?.status;
        const backend = err?.response?.data;
        const msg = backend?.message || backend?.data || err?.message || "Xóa kỳ thi thất bại";
        if (status === 401 || status === 403) {
          alert("Bạn không có quyền xóa kỳ thi. Vui lòng đăng nhập tài khoản ADMIN.");
        } else {
          alert(`${status || ""} ${msg}`.trim());
        }
      }
    })();
  };

  const handleDeleteById = (id) => {
    const ex = exams.find((e) => e.id === id);
    if (ex) handleDelete(ex);
  };

  const { toggleSidebar } = useOutletContext() || {};

  // Calculate stats
  const stats = {
    total: exams.length,
    upcoming: exams.filter(e => e.status === 'UPCOMING' || e.status === 'Sắp diễn ra').length,
    ongoing: exams.filter(e => e.status === 'ONGOING' || e.status === 'Đang mở').length,
    completed: exams.filter(e => e.status === 'COMPLETED' || e.status === 'Hoàn thành').length
  };

  // Filter exams
  const q = search.trim().toLowerCase();
  const filtered = exams.filter((e) => {
    const matchText = q
      ? String(e.title || e.name || "")
        .toLowerCase()
        .includes(q) ||
      String(e.description || "")
        .toLowerCase()
        .includes(q)
      : true;
    const matchStatus =
      statusFilter === "ALL" ? true : String(e.status) === statusFilter;
    return matchText && matchStatus;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const curPage = Math.min(page, totalPages);
  const start = (curPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

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
            <FileText size={24} />
          </div>
          <div>
            <h1 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 4px 0',
              lineHeight: 1.2
            }}>Quản lý bài kiểm tra</h1>
            <p style={{
              fontSize: 14,
              color: '#6b7280',
              margin: 0,
              fontWeight: 500
            }}>
              Tạo và quản lý các bài kiểm tra trong hệ thống
            </p>
          </div>
        </div>

        <button
          onClick={handleAddExam}
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
          + Tạo bài kiểm tra
        </button>
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
            }}>Tổng bài thi</h3>
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
            <FileText size={20} />
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
            }}>Sắp diễn ra</h3>
            <p style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1
            }}>{stats.upcoming}</p>
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
            <Clock size={20} />
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
            }}>Đang diễn ra</h3>
            <p style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1
            }}>{stats.ongoing}</p>
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
            <TrendingUp size={20} />
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
            }}>Hoàn thành</h3>
            <p style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1
            }}>{stats.completed}</p>
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
            <CheckCircle2 size={20} />
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
            placeholder="Tìm kiếm bài kiểm tra..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
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
            <option value="ALL">Tất cả trạng thái</option>
            <option value="UPCOMING">Sắp diễn ra</option>
            <option value="ONGOING">Đang diễn ra</option>
            <option value="COMPLETED">Đã kết thúc</option>
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
          {filtered.length} kết quả
        </span>
      </section>

      {/* Table */}
      <ExamTable
        exams={pageItems}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteById}
        canDelete={canManage}
        onViewDetail={(id) => {
          const basePath = isAdmin ? "/admin" : "/teacher";
          navigate(`${basePath}/exam/${id}/detail`);
        }}
      />

      {/* Pagination */}
      <div className="exam-pagination">
        <button
          className="page-btn"
          disabled={curPage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ‹ Trước
        </button>
        <span className="page-info">
          Trang {curPage}/{totalPages}
        </span>
        <button
          className="page-btn"
          disabled={curPage >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Sau ›
        </button>
      </div>

      <ExamCreateDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSuccess={() => {
          loadExams();
        }}
      />
      <ExamEditDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        exam={editingExam}
        onSuccess={() => {
          loadExams();
        }}
      />

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
