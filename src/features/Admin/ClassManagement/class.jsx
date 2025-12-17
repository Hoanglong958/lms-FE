import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { classService } from "@utils/classService";
import { userService } from "@utils/userService";
import { classTeacherService } from "@utils/classTeacherService";
import { classStudentService } from "@utils/classStudentService";
import { courseService } from "@utils/courseService";
import { classCourseService } from "@utils/classCourseService";
import ClassDetail from "./ClassDetail";
import ClassDetailModal from "./ClassDetailModal";
import "./class.css";


const calculateStatus = (startDate, endDate) => {
  if (!startDate || !endDate || startDate === 'N/A' || endDate === 'N/A') return "upcoming";
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
};

export default function ClassManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [classes, setClasses] = useState([]);
  const [assigningClass, setAssigningClass] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  // --- Load classes từ API khi component mount ---
  const fetchClasses = useCallback(async () => {
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

      // Map API response to expected structure
      const mappedClasses = apiData.map((item) => {
        // Calculate end date if not provided (3 months after start date)
        let endDate = item.endDate || item.end_date || "N/A";
        if (endDate === "N/A" && item.startDate) {
          try {
            const start = new Date(item.startDate);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 3);
            endDate = end.toISOString().split("T")[0];
          } catch (_e) {
            endDate = "N/A";
            void _e;
          }
        }

        return {
          id: item.id,
          name: item.className || item.name || item.class_name || "Chưa có tên",
          subtitle: item.description || item.subtitle || item.sub_title || "",
          code:
            item.classCode ||
            item.code ||
            item.class_code ||
            `CLASS-${item.id}`,
          teacher:
            item.instructorName ||
            item.teacher ||
            item.instructor ||
            item.teacherName ||
            "Chưa phân công",
          students: item.maxStudents || item.students || item.max_students || 0,
          active:
            item.activeStudents || item.active || item.active_students || 0,
          progress: item.progress || item.completion || 0,
          startDate: item.startDate || item.start_date || "N/A",
          endDate: endDate,
          status: calculateStatus(item.startDate || item.start_date, endDate),
          schedule: item.schedule || "Chưa có lịch",
        };
      });



      // Fetch teachers and students for each class
      const classesWithDetails = await Promise.all(mappedClasses.map(async (cls) => {
        if (!cls.id) return cls;

        let updatedCls = { ...cls };

        // 1. Fetch Teachers
        try {
          // If we already have a teacher name from the main API, skip unless we want to verify
          // But user might want relational data prioritised? Currently code prioritizes relational if main API missed it?
          // Actually existing code prioritised main API if it existed.
          // Let's stick to existing logic: if teacher is missing or placeholder, try fetching.
          // Or just fetch to be safe if 'Chưa phân công'.

          if (updatedCls.teacher === "Chưa phân công") {
            const tRes = await classTeacherService.getClassTeachers(cls.id);
            let teachers = [];
            if (tRes.data?.data && Array.isArray(tRes.data.data)) teachers = tRes.data.data;
            else if (Array.isArray(tRes.data)) teachers = tRes.data;

            if (teachers.length > 0) {
              const instructor = teachers.find(t => t.role === "INSTRUCTOR") || teachers[0];
              if (instructor && instructor.teacherName) {
                updatedCls.teacher = instructor.teacherName;
              }
            }
          }
        } catch (e) {
          // console.warn(`Failed to fetch teacher for class ${cls.id}`, e);
        }

        // 2. Fetch Students (To sync count with Detail View)
        try {
          const sRes = await classStudentService.getClassStudents(cls.id);
          let studentsData = [];
          if (sRes.data?.data && Array.isArray(sRes.data.data)) studentsData = sRes.data.data;
          else if (Array.isArray(sRes.data)) studentsData = sRes.data;

          // Update count
          updatedCls.students = studentsData.length;

          // Optional: Update active count if needed
          // updatedCls.active = studentsData.filter(s => s.status === 'ACTIVE').length;
        } catch (e) {
          // console.warn(`Failed to fetch students for class ${cls.id}`, e);
        }

        return updatedCls;
      }));

      setClasses(classesWithDetails);
    } catch (err) {
      console.error("Failed to fetch classes", err);
      alert("Không thể tải danh sách lớp học!");
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // --- Thêm lớp mới ---
  // --- Thêm lớp mới ---
  async function handleAddClass(payload) {
    // Check for duplicate class code
    const isDuplicate = classes.some(
      (c) => c.code.toLowerCase() === payload.code.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert("Mã lớp đã tồn tại. Vui lòng chọn mã lớp khác.");
      return;
    }

    try {
      const statusMapping = {
        'active': 'ONGOING',
        'upcoming': 'UPCOMING',
        'ended': 'COMPLETED'
      };

      const calculatedStatus = calculateStatus(payload.startDate, payload.endDate);

      const apiPayload = {
        className: payload.name.trim(),
        classCode: payload.code.trim(),
        description: payload.subtitle.trim(),
        instructorName: payload.teacher.trim(),
        maxStudents: parseInt(payload.students) || 0,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: statusMapping[calculatedStatus] || calculatedStatus.toUpperCase(),
        schedule: payload.schedule.trim(),
      };

      // 2. Call API to add class
      const res = await classService.createClass(apiPayload);

      const newClassId = res.data?.data?.id || res.data?.id;

      // 3. Assign teacher if selected
      if (payload.teacherId && newClassId) {
        try {
          await classTeacherService.assignTeacherToClass({
            classId: newClassId,
            teacherId: payload.teacherId,
            role: "INSTRUCTOR",
            note: `Assigned at creation`
          });
        } catch (teacherErr) {
          console.error("Failed to assign teacher:", teacherErr);
          alert("Lớp đã tạo nhưng lỗi khi gán giảng viên: " + teacherErr.message);
        }
      }

      // 4. Assign course if selected
      if (payload.courseId && newClassId) {
        try {
          await classCourseService.assignCourseToClass({
            classId: parseInt(newClassId),
            courseId: parseInt(payload.courseId)
          });
        } catch (courseErr) {
          console.error("Failed to assign course:", courseErr);
          // Only alert if it's a critical error, but for now we log it.
        }
      }

      await fetchClasses(); // Reload list from API
      setIsAddOpen(false);
      alert("Tạo lớp học thành công!");
    } catch (error) {
      console.error("Create class error:", error);
      alert("Lỗi khi tạo lớp học: " + (error.response?.data?.message || error.message));
    }
  }

  // --- Chỉnh sửa lớp ---
  // --- Chỉnh sửa lớp ---
  async function handleEditClass(id, payload) {
    // Check for duplicate class code
    const isDuplicate = classes.some(
      (c) => c.code.toLowerCase() === payload.code.trim().toLowerCase() && c.id !== id
    );

    if (isDuplicate) {
      alert("Mã lớp đã tồn tại. Vui lòng chọn mã lớp khác.");
      return;
    }

    try {
      const statusMapping = {
        'active': 'ONGOING',
        'upcoming': 'UPCOMING',
        'ended': 'COMPLETED'
      };

      const calculatedStatus = calculateStatus(payload.startDate, payload.endDate);

      const apiPayload = {
        className: payload.name.trim(),
        classCode: payload.code.trim(),
        description: payload.subtitle.trim(),
        instructorName: payload.teacher.trim(),
        maxStudents: parseInt(payload.students) || 0,
        activeStudents: parseInt(payload.active) || 0,
        progress: parseInt(payload.progress) || 0,
        startDate: payload.startDate,
        endDate: payload.endDate,
        status: statusMapping[calculatedStatus] || calculatedStatus.toUpperCase(),
        schedule: payload.schedule.trim(),
      };

      // 2. Call API to update
      await classService.updateClass(id, apiPayload);

      // 3. Assign teacher via relational API if teacherId is present
      // Note: We might want to remove old teacher first? Or just assign (API adds). 
      // Assuming 'assign' adds/updates the role.
      if (payload.teacherId) {
        try {
          const assignPayload = {
            classId: parseInt(id),
            teacherId: parseInt(payload.teacherId),
            role: "INSTRUCTOR",
            note: "Updated from Class Management"
          };
          console.log("Assigning teacher:", assignPayload);
          await classTeacherService.assignTeacherToClass(assignPayload);
        } catch (teacherErr) {
          console.error("Failed to assign teacher. Payload:", payload, "Error:", teacherErr);
          const msg = teacherErr.response?.data?.message || teacherErr.message;
          alert("Lớp đã cập nhật, nhưng lỗi khi phân công giảng viên Relational: " + msg);
        }
      }

      // 4. Update Course Assignment
      if (payload.courseId) {
        try {
          const coursesRes = await classCourseService.getClassCourses(id);
          const currentCourses = coursesRes.data?.data || coursesRes.data;

          let oldCourseId = null;
          if (Array.isArray(currentCourses) && currentCourses.length > 0) {
            oldCourseId = currentCourses[0].courseId;
          }

          if (String(oldCourseId) !== String(payload.courseId)) {
            if (oldCourseId) {
              try {
                await classCourseService.removeCourseFromClass(id, oldCourseId);
              } catch (e) { console.warn("Failed to remove old course", e); }
            }
            await classCourseService.assignCourseToClass({
              classId: parseInt(id),
              courseId: parseInt(payload.courseId)
            });
          }
        } catch (courseErr) {
          console.error("Failed to update course assignment:", courseErr);
        }
      }

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
              status: calculatedStatus,
              schedule: payload.schedule.trim(),
            }
            : c
        )
      );
      setEditingClass(null);
      alert("Cập nhật lớp học thành công!");
    } catch (error) {
      console.error("Failed to update class:", error);
      alert("Lỗi khi cập nhật lớp học: " + (error.response?.data?.message || error.message));
    }
  }

  // --- Xóa lớp ---
  function handleRequestDelete(cls) {
    setConfirmDelete(cls);
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    try {
      await classService.deleteClass(confirmDelete.id);
      setClasses((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      alert("Xóa lớp học thành công!");
    } catch (error) {
      console.error("Failed to delete class:", error);
      alert("Lỗi khi xóa lớp học: " + (error.response?.data?.message || error.message));
    } finally {
      setConfirmDelete(null);
    }
  }



  // --- Statistics ---
  const [totalPlatformStudents, setTotalPlatformStudents] = useState(0);

  useEffect(() => {
    // Fetch total students (ROLE_USER + ROLE_STUDENT if applicable)
    // trying both common roles for students
    const fetchStudentCount = async () => {
      try {
        // Try fetching ROLE_USER first as requested by user
        const res = await userService.getAllUsers({ role: "ROLE_USER", size: 1, page: 0 });
        let count = 0;

        // Handle different response structures to find totalElements
        if (res.data?.data?.totalElements !== undefined) count = res.data.data.totalElements;
        else if (res.data?.totalElements !== undefined) count = res.data.totalElements;
        else if (res.data?.data && Array.isArray(res.data.data)) count = res.data.data.length;
        else if (Array.isArray(res.data)) count = res.data.length;

        // If count is suspiciously low (e.g. 0) maybe they are ROLE_STUDENT? 
        // But user explicitly asked for ROLE_USER in creation tool.
        // Let's stick to ROLE_USER or maybe add ROLE_STUDENT if ROLE_USER is 0?
        // logic: if res returns list, use list length (if size=1000 passed, but we passed 1).
        // Actually best to assume totalElements is available if it's paginated.
        // If not paginated, we might have to fetch all? user.jsx fetches size=1000.

        // Let's try fetching with size 1 just for count, assuming API returns totalElements.
        // If the API is simple list, this might return 1 item.
        // Safest approach without knowing API details: Fetch a large size users like user.jsx does, 
        // filter by role, and count. It matches user.jsx logic.

        const resAll = await userService.getAllUsers({ role: "ROLE_USER", size: 2000, page: 0 });
        let allUsers = [];
        if (resAll.data?.data?.content) allUsers = resAll.data.data.content;
        else if (resAll.data?.content) allUsers = resAll.data.content;
        else if (resAll.data?.data && Array.isArray(resAll.data.data)) allUsers = resAll.data.data;
        else if (Array.isArray(resAll.data)) allUsers = resAll.data;

        // Also fetch ROLE_STUDENT just in case
        // But for now let's trust user request used ROLE_USER.

        setTotalPlatformStudents(allUsers.length);
      } catch (e) {
        console.error("Failed to fetch student count", e);
      }
    };

    fetchStudentCount();
  }, []); // Run once on mount

  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const activeClasses = classes.filter((c) => c.status === "active" || c.status === "ongoing").length;

    // Calculate enrolled students (sum of class.students)
    // const totalEnrolledStudents = classes.reduce((s, c) => s + (parseInt(c.students) || 0), 0);

    // User wants "New Student Number" -> Total Platform Students
    // If totalPlatformStudents is 0 (API fail or clean DB), fallback to enrolled count logic?
    // Or just show totalPlatformStudents.

    // NOTE: If the user just created 100 students, totalPlatformStudents should be >= 100.

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
      totalStudents: totalPlatformStudents, // Use the fetched count
      avgProgress,
    };
  }, [classes, totalPlatformStudents]);

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

  const [selectedClassId, setSelectedClassId] = useState("");

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


        {/* Select class to send id to calendar */}
        {/* Select class to send id to calendar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => setIsAddOpen(true)}
          >
            <span style={styles.plusIcon}>+ Tạo lớp học</span>
          </button>
        </div>
      </header>

      <section style={styles.kpis}>
        <StatCard
          icon={<IconClass />}
          label="Tổng lớp học"
          value={stats.totalClasses}
        />
        <StatCard
          icon={<IconCheckCircle />}
          label="Đang học"
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
            <option value="active">Đang học</option>
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
                        onClick={() => navigate(`/admin/classes/${c.id}`, { state: { classData: c } })}
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
                    <span className="cm-badge cm-badge-code">
                      {c.code}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      type="button"
                      onClick={() => setModalState({
                        isOpen: true,
                        type: "teacher",
                        data: {
                          ...c,
                          onAssignTeachers: () => {
                            setAssigningClass(c);
                          }
                        }
                      })}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      <span className="cm-badge cm-badge-teacher">
                        {c.teacher}
                      </span>
                    </button>
                  </td>
                  <td style={styles.td}>
                    <div className="cm-enrollment-cell">
                      <span className="cm-badge cm-badge-enrollment">
                        {c.students}
                      </span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    {c.startDate} - {c.endDate}
                  </td>
                  <td style={styles.td}>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={styles.td}>
                    <ActionCell
                      onView={() => navigate(`/admin/classes/${c.id}`, { state: { classData: c } })}
                      onEdit={() => setEditingClass(c)}
                      onDelete={() => handleRequestDelete(c)}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td style={styles.emptyCell} colSpan={7}>
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
      )
      }
      {
        editingClass && (
          <EditClassModal
            cls={editingClass}
            onClose={() => setEditingClass(null)}
            onSubmit={(payload) => handleEditClass(editingClass.id, payload)}
          />
        )
      }

      {
        confirmDelete && (
          <ConfirmModal
            title="Xóa lớp học"
            message={`Bạn có chắc muốn xóa '${confirmDelete.name}'?`}
            onCancel={() => setConfirmDelete(null)}
            onConfirm={handleConfirmDelete}
          />
        )
      }

      {assigningClass && (
        <AssignTeachersModal
          classData={assigningClass}
          onClose={() => setAssigningClass(null)}
          onSubmit={async (selectedTeacherIds) => {
            try {
              // Assign all selected teachers to the class
              const promises = selectedTeacherIds.map(async (teacherId) => {
                try {
                  await classTeacherService.assignTeacherToClass({
                    classId: assigningClass.id,
                    teacherId: teacherId,
                    role: "INSTRUCTOR",
                    note: `Assigned from class management`
                  });
                } catch (err) {
                  if (err.response && err.response.status === 400) {
                    console.warn(`Teacher ${teacherId} already assigned (400 ignored).`);
                    return;
                  }
                  throw err;
                }
              });

              await Promise.all(promises);

              alert("Phân công giảng viên thành công!");
              await fetchClasses(); // Reload list
              setAssigningClass(null);
            } catch (error) {
              console.error("Failed to assign teachers:", error);
              alert("Lỗi khi phân công giảng viên: " + (error.response?.data?.message || error.message));
            }
          }}
        />
      )}

      <ClassDetailModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        data={modalState.data}
        onAttendance={(classData) => {
          navigate(`/admin/classes/${classData.id}`, { state: { classData } });
          setModalState({ isOpen: false, type: null, data: null });
        }}
      />
    </div >
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
  const [teacherId, setTeacherId] = useState(""); // Store ID
  const [students, setStudents] = useState("0");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [errors, setErrors] = useState({});
  const [teachers, setTeachers] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    userService
      .getAllUsers({ role: "ROLE_TEACHER", size: 100 })
      .then((res) => {
        let data = [];
        if (res.data.data && res.data.data.content) {
          data = res.data.data.content;
        } else if (res.data.content) {
          data = res.data.content;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        }
        // Filter client-side to be absolutely sure
        const validTeachers = data.filter(u => u.role === "ROLE_TEACHER");
        setTeachers(validTeachers);
      })
      .catch((err) => console.error("Failed to load teachers", err));

    courseService.getCourses()
      .then((res) => {
        let data = [];
        if (res.data?.data) data = res.data.data;
        else if (Array.isArray(res.data)) data = res.data;
        setCourses(data);
      })
      .catch(err => console.error("Failed to load courses", err));
  }, []);

  function validate() {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Vui lòng nhập tên lớp học";
    if (!code.trim()) nextErrors.code = "Vui lòng nhập mã lớp học";
    if (!teacher.trim()) nextErrors.teacher = "Vui lòng chọn giảng viên";
    if (!startDate) nextErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!endDate) nextErrors.endDate = "Vui lòng chọn ngày kết thúc";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      nextErrors.endDate = "Ngày kết thúc không được nhỏ hơn ngày bắt đầu";
    }
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
      teacherId,  // Add teacherId to payload
      students,
      active: 0,
      progress: 0,
      startDate,
      endDate,
      status,
      schedule: "",
      courseId,
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={modalStyles.label}>
                Mã lớp học
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
                Giảng viên
                <div style={{ position: "relative" }}>
                  <select
                    value={teacherId}
                    onChange={(e) => {
                      setTeacherId(e.target.value);
                      const selected = teachers.find(t => String(t.id) === String(e.target.value));
                      setTeacher(selected ? selected.fullName : "");
                    }}
                    style={{ ...styles.select, width: "100%", height: 40 }}
                  >
                    <option value="">-- Chọn giảng viên --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                  <span
                    style={{ ...styles.selectChevron, top: 12 }}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </div>
                {errors.teacher && (
                  <div style={modalStyles.error}>{errors.teacher}</div>
                )}
              </label>
            </div>

            <label style={modalStyles.label}>
              Khóa học
              <div style={{ position: "relative" }}>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  style={{ ...styles.select, width: "100%", height: 40 }}
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName || c.name || c.title}
                    </option>
                  ))}
                </select>
                <span
                  style={{ ...styles.selectChevron, top: 12 }}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </div>
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
                  min={today}
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
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={modalStyles.input}
                />
                {errors.endDate && (
                  <div style={modalStyles.error}>{errors.endDate}</div>
                )}
              </label>
            </div>


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
  const [teacherId, setTeacherId] = useState(""); // New state for ID
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState(String(cls.students) || "0");
  const [active, setActive] = useState(String(cls.active) || "0");
  const [progress, setProgress] = useState(String(cls.progress) || "0");
  const [startDate, setStartDate] = useState(cls.startDate || "");
  const [endDate, setEndDate] = useState(cls.endDate || "");
  const [status, setStatus] = useState(cls.status || "upcoming");
  const [schedule, setSchedule] = useState(cls.schedule || "");
  const [errors, setErrors] = useState({});
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    userService
      .getAllUsers({ role: "ROLE_TEACHER", size: 100 })
      .then((res) => {
        let data = [];
        if (res.data.data && res.data.data.content) {
          data = res.data.data.content;
        } else if (res.data.content) {
          data = res.data.content;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        }
        const validTeachers = data.filter(u => u.role === "ROLE_TEACHER");
        setTeachers(validTeachers);

        // Attempt to find initial teacher ID from name match if not provided
        if (cls.teacher) {
          const found = validTeachers.find(t => t.fullName === cls.teacher);
          if (found) {
            setTeacherId(found.id);
            // Ensure 'teacher' name state is consistent just in case
            setTeacher(found.fullName);
          }
        }
      })
      .catch((err) => console.error("Failed to load teachers", err));
  }, [cls.teacher]); // Updated dependency to re-run if class changes

  useEffect(() => {
    // Load courses
    courseService.getCourses()
      .then((res) => {
        let data = [];
        if (res.data?.data) data = res.data.data;
        else if (Array.isArray(res.data)) data = res.data;
        setCourses(data);
      })
      .catch(err => console.error("Failed to load courses", err));

    // Load existing assigned course
    if (cls.id) {
      classCourseService.getClassCourses(cls.id)
        .then(res => {
          const assigned = res.data?.data || res.data;
          if (Array.isArray(assigned) && assigned.length > 0) {
            setCourseId(assigned[0].courseId);
          }
        })
        .catch(err => console.warn("Failed to load assigned course", err));
    }
  }, [cls.id]);

  function validate() {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Vui lòng nhập tên lớp học";
    if (!code.trim()) nextErrors.code = "Vui lòng nhập mã lớp học";
    if (!teacher.trim()) nextErrors.teacher = "Vui lòng chọn giảng viên";
    if (!startDate) nextErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!endDate) nextErrors.endDate = "Vui lòng chọn ngày kết thúc";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      nextErrors.endDate = "Ngày kết thúc không được nhỏ hơn ngày bắt đầu";
    }
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
      teacherId,
      students,
      active,
      progress,
      startDate,
      endDate,
      status,
      schedule,
      courseId,
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={modalStyles.label}>
                Mã lớp học
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
                Giảng viên
                <div style={{ position: "relative" }}>
                  <select
                    value={teacherId}
                    onChange={(e) => {
                      setTeacherId(e.target.value);
                      const selected = teachers.find(t => String(t.id) === String(e.target.value));
                      setTeacher(selected ? selected.fullName : "");
                    }}
                    style={{ ...styles.select, width: "100%", height: 40 }}
                  >
                    <option value="">-- Chọn giảng viên --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                  <span
                    style={{ ...styles.selectChevron, top: 12 }}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </div>
                {errors.teacher && (
                  <div style={modalStyles.error}>{errors.teacher}</div>
                )}
              </label>
            </div>

            <label style={modalStyles.label}>
              Khóa học
              <div style={{ position: "relative" }}>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  style={{ ...styles.select, width: "100%", height: 40 }}
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName || c.name || c.title}
                    </option>
                  ))}
                </select>
                <span
                  style={{ ...styles.selectChevron, top: 12 }}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </div>
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
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={modalStyles.input}
                />
                {errors.endDate && (
                  <div style={modalStyles.error}>{errors.endDate}</div>
                )}
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

function AssignTeachersModal({ classData, onClose, onSubmit }) {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [existingTeachers, setExistingTeachers] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Load all teachers
        const res = await userService.getAllUsers({ role: "ROLE_TEACHER", size: 100 });
        let data = [];
        if (res.data.data && res.data.data.content) {
          data = res.data.data.content;
        } else if (res.data.content) {
          data = res.data.content;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        }
        const validTeachers = data.filter(u => u.role === "ROLE_TEACHER");
        setTeachers(validTeachers);

        // Load existing teachers for this class
        try {
          const tRes = await classTeacherService.getClassTeachers(classData.id);
          let existing = [];
          if (tRes.data?.data && Array.isArray(tRes.data.data)) {
            existing = tRes.data.data;
          } else if (Array.isArray(tRes.data)) {
            existing = tRes.data;
          }
          const existingIds = existing.map(t => t.teacherId);
          setExistingTeachers(existingIds);
          setSelectedTeachers(existingIds);
        } catch (e) {
          console.warn("Could not load existing teachers:", e);
        }
      } catch (error) {
        console.error("Failed to load teachers:", error);
        alert("Lỗi khi tải danh sách giảng viên!");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [classData.id]);

  const sortedTeachers = useMemo(() => {
    const unassigned = [];
    const assigned = [];
    teachers.forEach(t => {
      if (existingTeachers.includes(t.id)) {
        assigned.push(t);
      } else {
        unassigned.push(t);
      }
    });
    return [...unassigned, ...assigned];
  }, [teachers, existingTeachers]);

  const handleToggle = (teacherId) => {
    setSelectedTeachers(prev => {
      if (prev.includes(teacherId)) {
        return prev.filter(id => id !== teacherId);
      } else {
        return [...prev, teacherId];
      }
    });
  };

  const handleSubmit = () => {
    onSubmit(selectedTeachers);
  };

  return (
    <div style={modalStyles.backdrop} role="dialog" aria-modal="true">
      <div style={{ ...modalStyles.container, maxWidth: 700 }}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>
            🧑‍🏫 Phân công giảng viên - {classData.name}
          </h3>
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
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
              Đang tải danh sách giảng viên...
            </div>
          ) : teachers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
              Không có giảng viên nào trong hệ thống
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16, color: "#6b7280", fontSize: 14 }}>
                Chọn giảng viên để phân công cho lớp học này. Bạn có thể chọn nhiều giảng viên.
              </div>
              <div style={{
                maxHeight: 400,
                overflow: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
              }}>
                {sortedTeachers.map((teacher) => (
                  <label
                    key={teacher.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 10px",
                      borderBottom: "1px solid #f3f4f6",
                      cursor: existingTeachers.includes(teacher.id) ? "not-allowed" : "pointer",
                      transition: "background 0.2s",
                      opacity: existingTeachers.includes(teacher.id) ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => !existingTeachers.includes(teacher.id) && (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher.id)}
                      onChange={() => !existingTeachers.includes(teacher.id) && handleToggle(teacher.id)}
                      disabled={existingTeachers.includes(teacher.id)}
                      style={{
                        width: 18,
                        height: 18,
                        marginRight: 12,
                        cursor: existingTeachers.includes(teacher.id) ? "not-allowed" : "pointer",
                        accentColor: "#f97316",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
                        {teacher.fullName}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                        {teacher.email}
                      </div>
                    </div>
                    {existingTeachers.includes(teacher.id) && (
                      <span style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        background: "#dbeafe",
                        color: "#1e40af",
                        borderRadius: 12,
                        fontWeight: 600,
                      }}>
                        Đã phân công
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <div style={{
                marginTop: 12,
                padding: 10,
                background: "#f0fdf4",
                borderRadius: 8,
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontSize: 13,
              }}>
                ✓ Đã chọn: <strong>{selectedTeachers.length}</strong> giảng viên
              </div>
            </>
          )}
        </div>
        <div style={modalStyles.footer}>
          <button
            type="button"
            onClick={onClose}
            style={modalStyles.ghostBtn}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              ...styles.primaryButton,
              background: "#059669",
            }}
            disabled={selectedTeachers.length === 0}
          >
            Phân công ({selectedTeachers.length})
          </button>
        </div>
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
