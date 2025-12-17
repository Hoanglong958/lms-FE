import React, { useEffect, useState } from "react";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./ExamManagement.css";
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminHeader from "@components/Admin/AdminHeader";
import { examService } from "@utils/examService.js";
import ExamCreateDialog from "./ExamCreateDialog";
import ExamEditDialog from "./ExamEditDialog";
import ExamTable from "./ExamTable";

export default function ExamManagement() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem("loggedInUser") || "{}"); } catch { return {}; } })();
  const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";

  // ✅ Thêm state để chứa danh sách bài kiểm tra
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

  const loadExams = async () => {
    try {
      setLoading(true);
      const res = await examService.getExams();
      // Chuẩn hoá các kiểu trả về thường gặp
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

  // ✅ Khi bấm nút "Tạo bài kiểm tra"
  const handleAddExam = () => {
    setOpenCreate(true);
  };

  



  const handleEdit = (exam) => {
    setEditingExam(exam);
    setOpenEdit(true);
  };

  const handleDelete = (exam) => {
    (async () => {
      if (!isAdmin) {
        alert("Bạn không có quyền xóa kỳ thi. Vui lòng đăng nhập tài khoản ADMIN.");
        return;
      }
      const ok = window.confirm(`Bạn có chắc muốn xóa "${exam.name}" không?`);
      if (!ok) return;
      try {
        await examService.deleteExam(exam.id);
        await loadExams();
      } catch (err) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || err?.message || "Xóa kỳ thi thất bại";
        if (status === 401 || status === 403) {
          alert("Bạn không có quyền xóa kỳ thi. Vui lòng đăng nhập tài khoản ADMIN.");
        } else {
          alert(msg);
        }
      }
    })();
  };

  const handleDeleteById = (id) => {
    const ex = exams.find((e) => e.id === id);
    if (ex) handleDelete(ex);
  };

  const { toggleSidebar } = useOutletContext() || {};

  return (
    <div className="exam-management-container">
      {/* --- HEADER --- */}
      <AdminHeader
        title="Quản lý bài kiểm tra"
        breadcrumb={[
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "Bài kiểm tra", to: "/admin/exams" },
        ]}
        onMenuToggle={toggleSidebar}
        actions={
          <div className="exam-header-buttons">
            <button className="exam-btn add" onClick={handleAddExam}>
              + Tạo bài kiểm tra
            </button>
          </div>
        }
      />

      {/* --- THỐNG KÊ --- */}
      <div className="exam-content-page">
        <div className="exam-stats">
          <div className="exam-card">
            <p className="exam-card-title">Tổng kỳ thi</p>
            <h3>{exams.length}</h3>
          </div>
          <div className="exam-card">
            <p className="exam-card-title">Số thí sinh</p>
            <h3>{studentsTotal}</h3>
          </div>
          <div className="exam-card">
            <p className="exam-card-title">Điểm trung bình</p>
            <h3>
              {avgScoreGlobal.toFixed(1)}
            </h3>
          </div>
        </div>

        {/* --- THANH TÌM KIẾM --- */}
        <div className="exam-searchbar">
          <div className="exam-search-row">
            <div className="exam-search-input-wrap">
              <div className="exam-search-icon-wrap">
                <svg className="exam-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm bài kiểm tra..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="exam-search-input"
                aria-label="Tìm kiếm bài kiểm tra"
              />
            </div>
            <select
              className="exam-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Lọc theo trạng thái"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="UPCOMING">Sắp diễn ra</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="COMPLETED">Đã kết thúc</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* --- BẢNG DANH SÁCH (component) --- */}
        {(() => {
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
            <>
              <ExamTable
                exams={pageItems}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDeleteById}
                canDelete={isAdmin}
                onViewDetail={(id) => {
                  navigate(`/admin/exam/${id}/detail`);
                }}
              />
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
            </>
          );
        })()}
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
