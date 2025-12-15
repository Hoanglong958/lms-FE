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

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

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

      const mapped = apiArr.map((e) => ({
        id: e.id,
        name: e.title,
        description: e.description,
        course: String(e.courseId ?? ""),
        students: e.students,
        avgScore: e.avgScore,
        passRate: e.passRate,
        totalQuestions: e.totalQuestions,
        maxScore: e.maxScore,
        passingScore: e.passingScore,
        durationMinutes: e.durationMinutes,
        duration: e.durationMinutes ? `${e.durationMinutes} phút` : "-",
        startTime: e.startTime || e.startAt,
        endTime: e.endTime || e.endAt,
        status: e.status || "Đang mở",
      }));
      setExams(mapped);
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

  const mapExam = (e) => ({
    id: e.id,
    name: e.title || e.name,
    description: e.description,
    course: String(e.courseId ?? e.course ?? ""),
    students: e.students,
    avgScore: e.avgScore,
    passRate: e.passRate,
    duration:
      e.duration || (e.durationMinutes ? `${e.durationMinutes} phút` : "-"),
    status: e.status || "Đang mở",
    totalQuestions: e.totalQuestions,
    maxScore: e.maxScore,
    passingScore: e.passingScore,
    startTime: e.startTime || e.startAt,
    endTime: e.endTime || e.endAt,
  });

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

  // ✅ Khi bấm nút "Ngân hàng câu hỏi"
  const handleQuestionBank = () => {
    navigate("/admin/question-bank");
  };

  const handleRefresh = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPage(1);
    loadExams();
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
            <button
              className="exam-btn refresh"
              onClick={handleRefresh}
              title="Làm mới danh sách"
              disabled={loading}
            >
              {loading ? "⟳ Đang làm mới..." : "⟳ Làm mới"}
            </button>
            <button className="exam-btn bank" onClick={handleQuestionBank}>
              📚 Ngân hàng câu hỏi
            </button>
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
            <h3>{exams.reduce((sum, e) => sum + (e.students || 0), 0)}</h3>
          </div>
          <div className="exam-card">
            <p className="exam-card-title">Điểm trung bình</p>
            <h3>
              {(() => {
                const total = exams.reduce(
                  (sum, e) => sum + (e.avgScore || 0),
                  0
                );
                const avg = exams.length > 0 ? total / exams.length : 0;
                return avg.toFixed(1);
              })()}
              %
            </h3>
          </div>
        </div>

        {/* --- THANH TÌM KIẾM --- */}
        <div className="exam-searchbar">
          <div className="exam-search-row">
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
          onSuccess={(created) => {
            loadExams();
          }}
        />
        <ExamEditDialog
          open={openEdit}
          onOpenChange={setOpenEdit}
          exam={editingExam}
          onSuccess={(updated) => {
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
