import React, { useMemo, useState, useEffect, useRef } from "react";
import { classService } from "@utils/classService";

export default function ClassManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewingClass, setViewingClass] = useState(null);
  const [classes, setClasses] = useState([]);
  // --- Load classes từ API khi component mount ---
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classService.getClasses({
        page: 0,
        size: 1000,
        keyword: searchQuery,
        status: statusFilter === "all" ? null : statusFilter,
      });

      // Xử lý nhiều cấu trúc response khác nhau
      let apiData = [];
      if (res.data.data && res.data.data.content) {
        apiData = res.data.data.content;
      } else if (res.data.content) {
        apiData = res.data.content;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        apiData = res.data.data;
      } else if (Array.isArray(res.data)) {
        apiData = res.data;
      }

      setClasses(Array.isArray(apiData) ? apiData : []);
    } catch (err) {
      alert("Không thể tải danh sách lớp học!");
    }
  };

  // --- Thêm lớp mới ---
  function handleAddClass(payload) {
    const nextId = Math.max(0, ...classes.map((c) => c.id)) + 1;
    const newClass = {
      id: nextId,
      name: payload.name.trim(),
      subtitle: payload.subtitle.trim(),
      code: payload.code.trim(),
      teacher: payload.teacher.trim(),
      students: parseInt(payload.students) || 0,
      active: parseInt(payload.active) || 0,
      progress: parseInt(payload.progress) || 0,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: payload.status || "upcoming",
      schedule: payload.schedule.trim(),
    };
    setClasses((prev) => [newClass, ...prev]);
    setIsAddOpen(false);
  }

  // --- Chỉnh sửa lớp ---
  function handleEditClass(id, payload) {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              name: payload.name.trim(),
              subtitle: payload.subtitle.trim(),
              code: payload.code.trim(),
              teacher: payload.teacher.trim(),
              students: parseInt(payload.students) || 0,
              active: parseInt(payload.active) || 0,
              progress: parseInt(payload.progress) || 0,
              startDate: payload.startDate,
              endDate: payload.endDate,
              status: payload.status || "upcoming",
              schedule: payload.schedule.trim(),
            }
          : c
      )
    );
    setEditingClass(null);
  }

  // --- Xóa lớp ---
  function handleRequestDelete(cls) {
    setConfirmDelete(cls);
  }

  function handleConfirmDelete() {
    if (!confirmDelete) return;
    setClasses((prev) => prev.filter((c) => c.id !== confirmDelete.id));
    setConfirmDelete(null);
  }

  // --- Thống kê ---
  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const activeClasses = classes.filter((c) => c.status === "active").length;
    const totalStudents = classes.reduce(
      (s, c) => s + (parseInt(c.students) || 0),
      0
    );
    const avgProgress =
      classes.length === 0
        ? 0
        : Math.round(
            classes.reduce((s, c) => s + (parseInt(c.progress) || 0), 0) /
              classes.length
          );
    return {
      totalClasses,
      totalActiveClasses: activeClasses,
      totalStudents,
      avgProgress,
    };
  }, [classes]);

  // --- Lọc và tìm kiếm ---
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = classes;
    if (q) {
      result = result.filter((c) => {
        return (
          c.name.toLowerCase().includes(q) ||
          c.teacher.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
        );
      });
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }
    return result;
  }, [classes, searchQuery, statusFilter]);

  return (
    <div style={styles.page}>
      <LocalStyles />
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Quản lý lớp học</h1>
          <p style={styles.subtitle}>
            Danh sách lớp học và theo dõi tiến độ học viên
          </p>
        </div>
        <button
          type="button"
          style={styles.primaryButton}
          onClick={() => setIsAddOpen(true)}
        >
          <span style={styles.plusIcon}>+</span> Tạo lớp học
        </button>
      </header>

      <section style={styles.kpis}>
        <StatCard
          icon={<IconClass />}
          label="Tổng lớp học"
          value={stats.totalClasses}
        />
        <StatCard
          icon={<IconCheckCircle />}
          label="Đang hoạt động"
          value={stats.totalActiveClasses}
        />
        <StatCard
          icon={<IconUserGroup />}
          label="Tổng học viên"
          value={stats.totalStudents}
        />
        <StatCard icon={<IconTrend />} label="Tiến độ TB" value={null} />
      </section>

      <section style={styles.toolbar} className="_cm-toolbar">
        <div style={styles.searchWrap} className="_cm-search">
          <span aria-hidden="true" style={styles.searchIcon}>
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm lớp học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <label style={styles.filterWrap}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="upcoming">Sắp bắt đầu</option>
            <option value="ended">Đã kết thúc</option>
          </select>
          <span style={styles.selectChevron} aria-hidden="true">
            ▾
          </span>
        </label>
      </section>

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 360 }}>Lớp học</th>
                <th style={{ ...styles.th, width: 140 }}>Mã lớp</th>
                <th style={{ ...styles.th, width: 160 }}>Giảng viên</th>
                <th style={{ ...styles.th, width: 110 }}>Học viên</th>
                <th style={{ ...styles.th, width: 120 }}>Hoạt động</th>
                <th style={{ ...styles.th, width: 180 }}>Tiến độ</th>
                <th style={{ ...styles.th, width: 210 }}>Thời gian</th>
                <th style={{ ...styles.th, width: 120 }}>Trạng thái</th>
                <th style={{ ...styles.th, width: 120 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ display: "grid", rowGap: 4 }}>
                      <button
                        type="button"
                        onClick={() => setViewingClass(c)}
                        style={{
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div style={styles.className}>{c.name}</div>
                      </button>
                      <div style={styles.classSubtitle}>{c.subtitle}</div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <BadgeCode text={c.code} />
                  </td>
                  <td style={styles.td}>{c.teacher}</td>
                  <td style={styles.td}>{c.students}</td>
                  <td style={styles.td}>
                    <span style={styles.activeWrap}>
                      <IconCheckSmall />
                      <span>{c.active}</span>
                    </span>
                  </td>
                  <td style={styles.td}>
                    <ProgressBar percent={c.progress} />
                  </td>
                  <td style={styles.td}>
                    {c.startDate} - {c.endDate}
                  </td>
                  <td style={styles.td}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={styles.td}>
                    <ActionCell
                      onView={() => setViewingClass(c)}
                      onEdit={() => setEditingClass(c)}
                      onDelete={() => handleRequestDelete(c)}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td style={styles.emptyCell} colSpan={9}>
                    Không tìm thấy lớp học phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isAddOpen && (
        <AddClassModal
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAddClass}
        />
      )}
      {editingClass && (
        <EditClassModal
          cls={editingClass}
          onClose={() => setEditingClass(null)}
          onSubmit={(payload) => handleEditClass(editingClass.id, payload)}
        />
      )}
      {viewingClass && (
        <ViewClassModal
          cls={viewingClass}
          onClose={() => setViewingClass(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Xóa lớp học"
          message={`Bạn có chắc muốn xóa '${confirmDelete.name}'?`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={{ display: "grid", rowGap: 4 }}>
        <div style={styles.statLabel}>{label}</div>
        <div style={styles.statValue}>{value}</div>
      </div>
    </div>
  );
}

function BadgeCode({ text }) {
  return <span style={styles.badgeCode}>{text}</span>;
}

function ProgressBar({ percent }) {
  const clamped = Math.max(0, Math.min(100, percent || 0));
  return (
    <div style={styles.progressOuter}>
      <div style={{ ...styles.progressInner, width: `${clamped}%` }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const mapping = {
    active: { label: "Đang học", style: badgeStyles.statusActive },
    upcoming: { label: "Sắp bắt đầu", style: badgeStyles.statusUpcoming },
    ended: { label: "Đã kết thúc", style: badgeStyles.statusEnded },
  };
  const { label, style } = mapping[status] ?? mapping.active;
  return <span style={{ ...badgeStyles.base, ...style }}>{label}</span>;
}

function ActionCell({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleGlobalPointerDown(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleGlobalPointerDown);
    document.addEventListener("touchstart", handleGlobalPointerDown, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handleGlobalPointerDown);
      document.removeEventListener("touchstart", handleGlobalPointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} style={styles.actionWrap}>
      <button
        type="button"
        aria-label="Xem lớp"
        onClick={() => onView && onView()}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#6b7280",
          marginRight: 8,
          padding: 6,
        }}
      >
        <IconEye />
      </button>
      <button
        type="button"
        aria-label="Thao tác"
        onClick={() => setOpen((v) => !v)}
        style={{ ...styles.iconButton, marginLeft: 6 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {open && (
        <ul style={styles.menu}>
          <li style={styles.menuItem}>
            <button
              type="button"
              style={styles.menuBtn}
              onClick={() => {
                setOpen(false);
                onEdit && onEdit();
              }}
            >
              Chỉnh sửa
            </button>
          </li>
          <li style={styles.menuItem}>
            <button
              type="button"
              style={styles.menuBtnDanger}
              onClick={() => {
                setOpen(false);
                onDelete && onDelete();
              }}
            >
              Xóa
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

function AddClassModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [code, setCode] = useState("");
  const [teacher, setTeacher] = useState("");
  const [students, setStudents] = useState("0");
  const [active, setActive] = useState("0");
  const [progress, setProgress] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [schedule, setSchedule] = useState("");
  const [errors, setErrors] = useState({});

  function validate() {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Vui lòng nhập tên lớp học";
    if (!code.trim()) nextErrors.code = "Vui lòng nhập mã khoá học";
    if (!teacher.trim()) nextErrors.teacher = "Vui lòng nhập tên giáo viên";
    if (!startDate) nextErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!endDate) nextErrors.endDate = "Vui lòng chọn ngày kết thúc";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name,
      subtitle,
      code,
      teacher,
      students,
      active,
      progress,
      startDate,
      endDate,
      status,
      schedule,
    });
  }

  return (
    <div style={modalStyles.backdrop} role="dialog" aria-modal="true">
      <div style={modalStyles.container} className="_add-class-modal">
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>Tạo lớp học mới</h3>
          <button
            type="button"
            onClick={onClose}
            style={styles.iconButton}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={modalStyles.body}>
            <label style={modalStyles.label}>
              Tên lớp học
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={modalStyles.input}
                placeholder="Ví dụ: Lớp React Advanced - Sáng"
              />
              {errors.name && (
                <div style={modalStyles.error}>{errors.name}</div>
              )}
            </label>
            <label style={modalStyles.label}>
              Mô tả ngắn
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                style={modalStyles.input}
                placeholder="Ví dụ: React Advanced"
              />
            </label>
            <label style={modalStyles.label}>
              Mã khoá học
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={modalStyles.input}
                placeholder="Ví dụ: REACT-ADV-01"
              />
              {errors.code && (
                <div style={modalStyles.error}>{errors.code}</div>
              )}
            </label>
            <label style={modalStyles.label}>
              Giáo viên
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                style={modalStyles.input}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
              {errors.teacher && (
                <div style={modalStyles.error}>{errors.teacher}</div>
              )}
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <label style={modalStyles.label}>
                Ngày bắt đầu
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={modalStyles.input}
                />
                {errors.startDate && (
                  <div style={modalStyles.error}>{errors.startDate}</div>
                )}
              </label>
              <label style={modalStyles.label}>
                Ngày kết thúc
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={modalStyles.input}
                />
                {errors.endDate && (
                  <div style={modalStyles.error}>{errors.endDate}</div>
                )}
              </label>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <label style={modalStyles.label}>
                Số học viên
                <input
                  type="number"
                  value={students}
                  onChange={(e) => setStudents(e.target.value)}
                  style={modalStyles.input}
                  min="0"
                />
              </label>
              <label style={modalStyles.label}>
                Hoạt động
                <input
                  type="number"
                  value={active}
                  onChange={(e) => setActive(e.target.value)}
                  style={modalStyles.input}
                  min="0"
                />
              </label>
              <label style={modalStyles.label}>
                Tiến độ (%)
                <input
                  type="number"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  style={modalStyles.input}
                  min="0"
                  max="100"
                />
              </label>
            </div>
            <label style={modalStyles.label}>
              Lịch học
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                style={modalStyles.input}
                placeholder="Ví dụ: Thứ 2,4,6"
              />
            </label>
            <label style={modalStyles.label}>
              Trạng thái
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ ...styles.select, width: "100%" }}
              >
                <option value="upcoming">Sắp bắt đầu</option>
                <option value="active">Đang hoạt động</option>
                <option value="ended">Đã kết thúc</option>
              </select>
            </label>
          </div>
          <div style={modalStyles.footer}>
            <button
              type="button"
              onClick={onClose}
              style={modalStyles.ghostBtn}
            >
              Hủy
            </button>
            <button type="submit" style={styles.primaryButton}>
              Tạo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditClassModal({ cls, onClose, onSubmit }) {
  const [name, setName] = useState(cls.name || "");
  const [subtitle, setSubtitle] = useState(cls.subtitle || "");
  const [code, setCode] = useState(cls.code || "");
  const [teacher, setTeacher] = useState(cls.teacher || "");
  const [students, setStudents] = useState(String(cls.students) || "0");
  const [active, setActive] = useState(String(cls.active) || "0");
  const [progress, setProgress] = useState(String(cls.progress) || "0");
  const [startDate, setStartDate] = useState(cls.startDate || "");
  const [endDate, setEndDate] = useState(cls.endDate || "");
  const [status, setStatus] = useState(cls.status || "upcoming");
  const [schedule, setSchedule] = useState(cls.schedule || "");
  const [errors, setErrors] = useState({});

  function validate() {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Vui lòng nhập tên lớp học";
    if (!code.trim()) nextErrors.code = "Vui lòng nhập mã khoá học";
    if (!teacher.trim()) nextErrors.teacher = "Vui lòng nhập tên giáo viên";
    if (!startDate) nextErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!endDate) nextErrors.endDate = "Vui lòng chọn ngày kết thúc";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name,
      subtitle,
      code,
      teacher,
      students,
      active,
      progress,
      startDate,
      endDate,
      status,
      schedule,
    });
  }

  return (
    <div style={modalStyles.backdrop} role="dialog" aria-modal="true">
      <div style={modalStyles.container} className="_edit-class-modal">
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>Chỉnh sửa lớp học</h3>
          <button
            type="button"
            onClick={onClose}
            style={styles.iconButton}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={modalStyles.body}>
            <label style={modalStyles.label}>
              Tên lớp học
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={modalStyles.input}
              />
              {errors.name && (
                <div style={modalStyles.error}>{errors.name}</div>
              )}
            </label>
            <label style={modalStyles.label}>
              Mô tả ngắn
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                style={modalStyles.input}
              />
            </label>
            <label style={modalStyles.label}>
              Mã khoá học
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={modalStyles.input}
              />
              {errors.code && (
                <div style={modalStyles.error}>{errors.code}</div>
              )}
            </label>
            <label style={modalStyles.label}>
              Giáo viên
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                style={modalStyles.input}
              />
              {errors.teacher && (
                <div style={modalStyles.error}>{errors.teacher}</div>
              )}
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <label style={modalStyles.label}>
                Ngày bắt đầu
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={modalStyles.input}
                />
                {errors.startDate && (
                  <div style={modalStyles.error}>{errors.startDate}</div>
                )}
              </label>
              <label style={modalStyles.label}>
                Ngày kết thúc
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={modalStyles.input}
                />
                {errors.endDate && (
                  <div style={modalStyles.error}>{errors.endDate}</div>
                )}
              </label>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <label style={modalStyles.label}>
                Số học viên
                <input
                  type="number"
                  value={students}
                  onChange={(e) => setStudents(e.target.value)}
                  style={modalStyles.input}
                  min="0"
                />
              </label>
              <label style={modalStyles.label}>
                Hoạt động
                <input
                  type="number"
                  value={active}
                  onChange={(e) => setActive(e.target.value)}
                  style={modalStyles.input}
                  min="0"
                />
              </label>
              <label style={modalStyles.label}>
                Tiến độ (%)
                <input
                  type="number"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  style={modalStyles.input}
                  min="0"
                  max="100"
                />
              </label>
            </div>
            <label style={modalStyles.label}>
              Lịch học
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                style={modalStyles.input}
              />
            </label>
            <label style={modalStyles.label}>
              Trạng thái
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ ...styles.select, width: "100%" }}
              >
                <option value="upcoming">Sắp bắt đầu</option>
                <option value="active">Đang hoạt động</option>
                <option value="ended">Đã kết thúc</option>
              </select>
            </label>
          </div>
          <div style={modalStyles.footer}>
            <button
              type="button"
              onClick={onClose}
              style={modalStyles.ghostBtn}
            >
              Hủy
            </button>
            <button type="submit" style={styles.primaryButton}>
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onCancel, onConfirm }) {
  return (
    <div style={modalStyles.backdrop} role="dialog" aria-modal="true">
      <div style={modalStyles.container}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>{title}</h3>
        </div>
        <div style={modalStyles.body}>
          <div style={{ color: "#374151", fontSize: 14 }}>{message}</div>
        </div>
        <div style={modalStyles.footer}>
          <button type="button" onClick={onCancel} style={modalStyles.ghostBtn}>
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{ ...styles.primaryButton, background: "#b91c1c" }}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewClassModal({ cls, onClose }) {
  if (!cls) return null;

  function parseDMY(str) {
    if (!str) return null;
    const parts = String(str).split("/");
    if (parts.length !== 3) return new Date(str);
    const [d, m, y] = parts.map((p) => parseInt(p, 10));
    if (Number.isNaN(d) || Number.isNaN(m) || Number.isNaN(y))
      return new Date(str);
    return new Date(y, m - 1, d);
  }

  const start = parseDMY(cls.startDate);
  const end = parseDMY(cls.endDate);
  let durationDays = null;
  if (
    start &&
    end &&
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime())
  ) {
    durationDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  }

  const enrollmentRate = cls.students
    ? Math.round((cls.active / cls.students) * 100)
    : 0;

  return (
    <div style={modalStyles.backdrop} role="dialog" aria-modal="true">
      <div style={modalStyles.container}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>{cls.name}</h3>
          <button
            type="button"
            onClick={onClose}
            style={styles.iconButton}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
        <div style={modalStyles.body}>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 14, color: "#6b7280" }}>{cls.subtitle}</div>

            {/* Key info grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: 12,
                  background: "#fff",
                  border: "1px solid #eef2f6",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                >
                  Mã lớp
                </div>
                <div style={{ fontWeight: 700 }}>{cls.code}</div>
              </div>
              <div
                style={{
                  padding: 12,
                  background: "#fff",
                  border: "1px solid #eef2f6",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                >
                  Giảng viên
                </div>
                <div style={{ fontWeight: 700 }}>{cls.teacher}</div>
              </div>

              <div
                style={{
                  padding: 12,
                  background: "#fff",
                  border: "1px solid #eef2f6",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                >
                  Sĩ số
                </div>
                <div style={{ fontWeight: 700 }}>{cls.students}</div>
              </div>
              <div
                style={{
                  padding: 12,
                  background: "#fff",
                  border: "1px solid #eef2f6",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                >
                  Hoạt động
                </div>
                <div style={{ fontWeight: 700 }}>{cls.active}</div>
              </div>

              <div
                style={{
                  padding: 12,
                  background: "#fff",
                  border: "1px solid #eef2f6",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                >
                  Tỉ lệ hoạt động
                </div>
                <div style={{ fontWeight: 700 }}>{enrollmentRate}%</div>
              </div>
              <div
                style={{
                  padding: 12,
                  background: "#fff",
                  border: "1px solid #eef2f6",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                >
                  Lịch học
                </div>
                <div style={{ fontWeight: 700 }}>{cls.schedule || "—"}</div>
              </div>

              <div
                style={{
                  padding: 12,
                  background: "#fff",
                  border: "1px solid #eef2f6",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                >
                  Thời gian
                </div>
                <div style={{ fontWeight: 700 }}>
                  {cls.startDate} — {cls.endDate}
                </div>
                {durationDays !== null && (
                  <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>
                    <strong>Thời lượng:</strong> {durationDays} ngày
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: 12,
                  background: "#fff",
                  border: "1px solid #eef2f6",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}
                >
                  Trạng thái
                </div>
                <div>
                  <StatusBadge status={cls.status} />
                </div>
              </div>
            </div>

            {/* Progress block */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <ProgressBar percent={cls.progress} />
                </div>
                <div
                  style={{ minWidth: 56, textAlign: "right", fontWeight: 700 }}
                >
                  {cls.progress}%
                </div>
              </div>
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
                Tỉ lệ hoàn thành trung bình của lớp
              </div>
            </div>
          </div>
        </div>
        <div style={modalStyles.footer}>
          <button type="button" onClick={onClose} style={modalStyles.ghostBtn}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function LocalStyles() {
  return (
    <style>{`
			@media (max-width: 860px) {
				._cm-toolbar {
					flex-direction: column;
					align-items: stretch;
					gap: 12px;
				}
				._cm-search {
					width: 100%;
				}
			}

			/* Modal input placeholder styling - lighter and thinner */
			._add-class-modal input::placeholder,
			._edit-class-modal input::placeholder {
				color: #d1d5db;
				opacity: 0.7;
				font-weight: 300;
			}
		`}</style>
  );
}

// Icons
function IconClass() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 4h18v14H3z" opacity="0.2" />
      <path
        d="M3 4h18M6 8h6M6 12h12M3 18h18"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  );
}
function IconCheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" opacity="0.15" />
      <path
        d="M8 12l3 3 5-6"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconUserGroup() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 20a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="10" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 20a5 5 0 0 1 8 0" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconTrend() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20h16M5 14l4-4 4 3 6-7"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconCheckSmall() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ marginRight: 6, color: "#22c55e" }}
    >
      <circle cx="12" cy="12" r="10" fill="#10b981" opacity="0.12" />
      <path
        d="M8 12l3 3 5-6"
        stroke="#16a34a"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

// Styles
const styles = {
  page: {
    padding: "28px 24px",
    background: "#f7f8fa",
    minHeight: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: 14,
  },
  primaryButton: {
    background: "#ef6c00",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(239,108,0,0.25)",
  },
  plusIcon: {
    display: "inline-block",
    marginRight: 8,
    fontSize: 18,
    lineHeight: "18px",
    fontWeight: 700,
  },
  kpis: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 6px 24px rgba(17,24,39,0.06)",
  },
  statIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#f3f4f6",
    color: "#4b5563",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 600,
  },
  statValue: {
    color: "#111827",
    fontWeight: 700,
    fontSize: 18,
  },
  toolbar: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "0 12px",
    height: 42,
    minWidth: 360,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  searchIcon: {
    color: "#9ca3af",
    marginRight: 8,
    display: "flex",
    alignItems: "center",
  },
  searchInput: {
    border: "none",
    outline: "none",
    flex: 1,
    height: 38,
    fontSize: 14,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 6px 24px rgba(17,24,39,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  th: {
    textAlign: "left",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: "#6b7280",
    padding: "14px 16px",
    borderBottom: "1px solid #e5e7eb",
    background: "#fafafa",
  },
  tr: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "14px 16px",
    color: "#111827",
    fontSize: 14,
    verticalAlign: "middle",
    borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  },
  className: {
    fontWeight: 600,
    color: "#111827",
  },
  classSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  activeWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    color: "#16a34a",
    fontWeight: 600,
  },
  progressOuter: {
    position: "relative",
    height: 8,
    borderRadius: 999,
    background: "#fee2e2",
    width: 160,
    overflow: "hidden",
  },
  progressInner: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    background: "#f97316",
    borderRadius: 999,
  },
  progressText: {
    marginLeft: 8,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 700,
    display: "inline-block",
    position: "relative",
    top: -2,
    marginLeft: 12,
  },
  actionCell: {
    display: "inline-flex",
    alignItems: "center",
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#111827",
    fontWeight: 600,
    cursor: "pointer",
  },
  emptyCell: {
    padding: "36px 16px",
    textAlign: "center",
    color: "#6b7280",
  },
  actionWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  iconButton: {
    background: "transparent",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    cursor: "pointer",
    padding: 6,
    color: "#6b7280",
  },
  menu: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 6px)",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(17,24,39,0.12)",
    minWidth: 160,
    padding: 6,
    zIndex: 20,
  },
  menuItem: {
    listStyle: "none",
  },
  menuBtn: {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    padding: "10px 10px",
    borderRadius: 8,
    cursor: "pointer",
    color: "#111827",
    fontSize: 14,
  },
  menuBtnDanger: {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    padding: "10px 10px",
    borderRadius: 8,
    cursor: "pointer",
    color: "#b91c1c",
    fontSize: 14,
  },
  select: {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    height: 42,
    padding: "0 36px 0 12px",
    fontSize: 14,
    color: "#111827",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  selectChevron: {
    position: "absolute",
    right: 12,
    pointerEvents: "none",
    color: "#6b7280",
    fontSize: 14,
  },
  filterWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
};

const badgeStyles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },
  statusActive: {
    background: "rgba(16,185,129,0.12)",
    color: "#047857",
  },
  statusUpcoming: {
    background: "rgba(59,130,246,0.12)",
    color: "#1d4ed8",
  },
  statusEnded: {
    background: "rgba(107,114,128,0.12)",
    color: "#374151",
  },
};

const modalStyles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,24,39,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 600,
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    boxShadow: "0 24px 48px rgba(17,24,39,0.18)",
    overflow: "hidden",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid #f3f4f6",
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  body: {
    padding: 16,
    display: "grid",
    rowGap: 12,
  },
  label: {
    display: "grid",
    gap: 6,
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: 400,
  },
  input: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    height: 40,
    padding: "0 12px",
    fontSize: 14,
    color: "#374151",
  },
  error: {
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: 600,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    padding: 16,
    borderTop: "1px solid #f3f4f6",
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid #e5e7eb",
    color: "#111827",
    padding: "10px 16px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
};
