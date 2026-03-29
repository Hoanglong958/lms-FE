import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { School, Info, Hash, User, BookOpen, Calendar, Sparkles, X, ChevronDown, FilePenLine, Clock, TrendingUp, CheckCircle2, Users, Search, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { classService } from "@utils/classService";
import { userService } from "@utils/userService";
import { classTeacherService } from "@utils/classTeacherService";
import { classStudentService } from "@utils/classStudentService";
import { courseService } from "@utils/courseService";
import { classCourseService } from "@utils/classCourseService";
import AdminPagination from "@shared/components/Admin/AdminPagination";
import ClassDetail from "./ClassDetail";
import ClassDetailModal from "./ClassDetailModal";
import NotificationModal from "@components/NotificationModal/NotificationModal";
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
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [classes, setClasses] = useState([]);
  const [assigningClass, setAssigningClass] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  // Pagination states
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  // --- Load classes từ API khi component mount ---
  const fetchClasses = useCallback(async () => {
    try {
      const res = await classService.getClassesPaging({
        page: page,
        size: pageSize,
        q: searchQuery,
        status: statusFilter === "all" ? null : statusFilter,
      });

      let apiData = [];
      let paging = { totalElements: 0, totalPages: 0 };

      // Handle paginated response
      if (res.data) {
        apiData = res.data.content || res.data.data?.content || res.data.data || [];
        paging = {
          totalElements: res.data.totalElements || res.data.data?.totalElements || 0,
          totalPages: res.data.totalPages || res.data.data?.totalPages || 0
        };
      }

      // Map API response to expected structure
      const mappedClasses = apiData.map((item) => {
        let endDate = item.endDate || item.end_date || "N/A";
        if (endDate === "N/A" && item.startDate) {
          try {
            const start = new Date(item.startDate);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 3);
            endDate = end.toISOString().split("T")[0];
          } catch (_e) {
            endDate = "N/A";
          }
        }

        return {
          id: item.id,
          name: item.className || item.name || item.class_name || "Chưa có tên",
          subtitle: item.description || item.subtitle || item.sub_title || "",
          code: item.classCode || item.code || item.class_code || `CLASS-${item.id}`,
          teacher: item.instructorName || item.teacher || item.instructor || item.teacherName || "Chưa phân công",
          isActive: item.isActive !== undefined ? item.isActive : true,
          students: item.maxStudents || item.students || item.max_students || 0,
          active: item.activeStudents || item.active || item.active_students || 0,
          progress: item.progress || item.completion || 0,
          startDate: item.startDate || item.start_date || "N/A",
          endDate: endDate,
          status: calculateStatus(item.startDate || item.start_date, endDate),
          schedule: item.schedule || "Chưa có lịch",
        };
      });

      // Fetch additional details if needed (existing logic)
      const classesWithDetails = await Promise.all(mappedClasses.map(async (cls) => {
        if (!cls.id) return cls;
        let updatedCls = { ...cls };
        // 1. Fetch Teachers
        try {
          if (updatedCls.teacher === "Chưa phân công") {
            const tRes = await classTeacherService.getClassTeachers(cls.id);
            let teachers = Array.isArray(tRes.data?.data) ? tRes.data.data : (Array.isArray(tRes.data) ? tRes.data : []);
            if (teachers.length > 0) {
              const instructor = teachers.find(t => t.role === "INSTRUCTOR") || teachers[0];
              if (instructor?.teacherName) updatedCls.teacher = instructor.teacherName;
            }
          }
        } catch (e) {}

        // 2. Fetch Students
        try {
          const sRes = await classStudentService.getClassStudents(cls.id);
          let studentsData = Array.isArray(sRes.data?.data) ? sRes.data.data : (Array.isArray(sRes.data) ? sRes.data : []);
          updatedCls.students = studentsData.length;
        } catch (e) {}

        return updatedCls;
      }));

      setClasses(classesWithDetails);
      setTotalElements(paging.totalElements);
      setTotalPages(paging.totalPages);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    }
  }, [page, pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Reset to page 0 when filtering
  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);

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
          const normalizedTeacherId = parseInt(payload.teacherId);
          if (Number.isNaN(normalizedTeacherId)) {
            console.warn("Skip assign teacher: invalid teacherId", payload.teacherId);
            throw new Error("invalid-teacher-id");
          }

          let alreadyAssigned = false;
          try {
            const existingRes = await classTeacherService.getClassTeachers(id);
            let existing = [];
            if (existingRes.data?.data && Array.isArray(existingRes.data.data)) existing = existingRes.data.data;
            else if (Array.isArray(existingRes.data)) existing = existingRes.data;
            alreadyAssigned = existing.some(t => String(t.teacherId) === String(normalizedTeacherId));
          } catch (checkErr) {
            console.warn("Failed to check existing teachers before assign", checkErr);
          }

          if (alreadyAssigned) {
            console.log("Teacher already assigned, skip re-assign:", normalizedTeacherId);
            throw new Error("already-assigned");
          }

          const assignPayload = {
            classId: parseInt(id),
            teacherId: normalizedTeacherId,
            role: "INSTRUCTOR",
            note: "Updated from Class Management"
          };
          console.log("Assigning teacher:", assignPayload);
          await classTeacherService.assignTeacherToClass(assignPayload);
        } catch (teacherErr) {
          if (teacherErr?.message === "already-assigned" || teacherErr?.message === "invalid-teacher-id") {
            // Skip noisy alerts for non-critical cases
          } else {
            console.error("Failed to assign teacher. Payload:", payload, "Error:", teacherErr);
            const msg = teacherErr.response?.data?.message || teacherErr.message;
            alert("Lớp đã cập nhật, nhưng lỗi khi phân công giảng viên Relational: " + msg);
          }
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
              teacher: payload.teacher.trim(), // Optimistic update
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

  // --- Ẩn/Hiện lớp ---
  function handleRequestToggle(cls) {
    setConfirmToggle(cls);
  }

  async function handleConfirmToggle() {
    if (!confirmToggle) return;
    try {
      await classService.toggleClassActive(confirmToggle.id);
      await fetchClasses();
      alert(confirmToggle.isActive ? "Đã ẩn lớp học!" : "Đã hiện lớp học!");
    } catch (error) {
      console.error("Failed to toggle class:", error);
      alert("Lỗi khi thay đổi trạng thái lớp học: " + (error.response?.data?.message || error.message));
    } finally {
      setConfirmToggle(null);
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
    return Array.isArray(classes) ? classes : [];
  }, [classes]);

  const [selectedClassId, setSelectedClassId] = useState("");

  return (
    <div style={styles.page}>
      <LocalStyles />

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
            <School size={24} />
          </div>
          <div>
            <h1 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 4px 0',
              lineHeight: 1.2
            }}>Quản lý lớp học</h1>
            <p style={{
              fontSize: 14,
              color: '#6b7280',
              margin: 0,
              fontWeight: 500
            }}>
              Quản lý danh sách lớp học và theo dõi học viên
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
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
            onClick={() => setIsAddOpen(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ea580c';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f97316';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.2)';
            }}
          >
            + Tạo lớp học mới
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
            }}>Tổng lớp học</h3>
            <p style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1
            }}>{stats.totalClasses}</p>
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
            <School size={20} />
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
            }}>{classes.filter(c => c.status === 'upcoming').length}</p>
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
            }}>Đang học</h3>
            <p style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1
            }}>{stats.totalActiveClasses}</p>
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
            }}>{classes.filter(c => c.status === 'ended').length}</p>
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
            placeholder="Tìm kiếm theo tên lớp học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang học</option>
            <option value="upcoming">Sắp bắt đầu</option>
            <option value="ended">Đã kết thúc</option>
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

      <div style={styles.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 440 }}>Lớp học</th>
                {/* <th style={{ ...styles.th, width: 140 }}>Mã lớp</th> Removed */}
                <th style={{ ...styles.th, width: 220 }}>Giảng viên</th>
                <th style={{ ...styles.th, width: 120 }}>Học viên</th>
                <th style={{ ...styles.th, width: 240 }}>Thời gian</th>
                <th style={{ ...styles.th, width: 140 }}>Trạng thái</th>
                <th style={{ ...styles.th, width: 120 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  style={{ ...styles.tr, cursor: "pointer", opacity: c.isActive ? 1 : 0.55 }}
                  onClick={() => navigate(`/admin/classes/${c.id}`, { state: { classData: c } })}
                >
                  <td style={styles.td}>
                    <div style={{ display: "grid", rowGap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#111827",
                          }}
                        >
                          {c.name}
                        </div>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            background: c.isActive ? "#dcfce7" : "#f1f5f9",
                            color: c.isActive ? "#166534" : "#475569",
                            border: c.isActive ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                          }}
                        >
                          {c.isActive ? "Đang hiện" : "Đã ẩn"}
                        </span>
                      </div>
                      <div style={styles.classSubtitle}>{c.subtitle}</div>
                    </div>
                  </td>
                  {/* Code column removed
                  <td style={styles.td}>
                    <span className="cm-badge cm-badge-code">
                      {c.code}
                    </span>
                  </td>
                  */}
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
                  <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                    <div className="cm-actions">
                      <button
                        className="btn-icon edit"
                        title="Chỉnh sửa"
                        onClick={() => setEditingClass(c)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon toggle"
                        title={c.isActive ? "Ẩn lớp học" : "Hiện lớp học"}
                        onClick={() => handleRequestToggle(c)}
                      >
                        {c.isActive ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              }
              {
                filtered.length === 0 && (
                  <tr>
                    <td style={styles.emptyCell} colSpan={6}>
                      Không tìm thấy lớp học phù hợp
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>

        {/* Unified Admin Pagination */}
        <AdminPagination
          currentPage={page + 1}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p - 1)}
        />
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
        confirmToggle && (
          <ConfirmModal
            title={confirmToggle.isActive ? "Ẩn lớp học" : "Hiện lớp học"}
            message={
              confirmToggle.isActive
                ? `Bạn có chắc muốn ẩn '${confirmToggle.name}'?`
                : `Bạn có chắc muốn hiện '${confirmToggle.name}'?`
            }
            confirmText={confirmToggle.isActive ? "Ẩn" : "Hiện"}
            onCancel={() => setConfirmToggle(null)}
            onConfirm={handleConfirmToggle}
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
        title="Chỉnh sửa"
        onClick={(e) => {
          e.stopPropagation();
          onEdit && onEdit();
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button
        type="button"
        title="Xóa"
        onClick={(e) => {
          e.stopPropagation();
          onDelete && onDelete();
        }}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#ef4444",
          padding: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}

function AddClassModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  // const [code, setCode] = useState(""); // Removed code input
  const [teacher, setTeacher] = useState("");
  const [teacherId, setTeacherId] = useState(""); // Store ID
  const [students, setStudents] = useState("0");
  // const [courseId, setCourseId] = useState(""); // Removed course input
  // const [courses, setCourses] = useState([]); // Removed course fetching
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
  }, []);

  function validate() {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Vui lòng nhập tên lớp học";
    // if (!code.trim()) nextErrors.code = "Vui lòng nhập mã lớp học"; // Logic removed
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

    // Auto-generate code
    const generatedCode = `CLS-${Date.now()}`;

    onSubmit({
      name,
      subtitle,
      code: generatedCode,
      teacher,
      teacherId,  // Add teacherId to payload
      students,
      active: 0,
      progress: 0,
      startDate,
      endDate,
      status,
      schedule: "",
      courseId: null, // No course
    });
  }

  return (
    <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
      <div className="modal-container-custom">
        {/* Blue Header */}
        <div className="modal-blue-header">
          <button type="button" onClick={onClose} className="close-btn-abs">
            <X size={20} />
          </button>
          <div className="header-content">
            <div className="header-icon-box">
              <School size={32} color="white" />
              <div className="sparkle-badge"><Sparkles size={12} fill="white" /></div>
            </div>
            <div className="header-texts">
              <h3>Tạo lớp học mới</h3>
              <p>Điền thông tin để tạo lớp học mới cho hệ thống</p>
            </div>
          </div>

        </div>

        {/* Body */}
        <div className="modal-form-body">
          <form onSubmit={handleSubmit} className="form-card">
            {/* Tên lớp học */}
            <div className="form-group-mb">
              <label className="custom-label">
                <div className="label-icon icon-blue"><School size={16} color="white" /></div>
                Tên lớp học <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="custom-input"
                placeholder="VD: Lớp React Advanced - Sáng"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
            </div>

            {/* Mô tả ngắn */}
            <div className="form-group-mb">
              <label className="custom-label">
                <div className="label-icon icon-pink"><BookOpen size={16} color="white" /></div>
                Mô tả ngắn
              </label>
              <input
                type="text"
                className="custom-input"
                placeholder="VD: React Advanced"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            {/* Row: Giang vien only (Code removed) */}
            <div className="form-group-mb">
              <label className="custom-label">
                <div className="label-icon icon-green"><User size={16} color="white" /></div>
                Giảng viên
              </label>
              <div className="select-wrapper">
                <select
                  className="custom-select"
                  value={teacherId}
                  onChange={(e) => {
                    setTeacherId(e.target.value);
                    const selected = teachers.find(t => String(t.id) === String(e.target.value));
                    setTeacher(selected ? selected.fullName : "");
                  }}
                >
                  <option value="">-- Chọn giảng viên --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
                <div className="select-icon">▼</div>
              </div>
              {errors.teacher && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.teacher}</div>}
            </div>

            {/* Course Removed */}

            {/* Dates */}
            <div className="field-grid-2 form-group-mb">
              <div>
                <label className="custom-label">
                  <div className="label-icon icon-blue"><Calendar size={16} color="white" /></div>
                  Ngày bắt đầu <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  className="custom-input"
                  value={startDate}
                  min={today}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.startDate && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.startDate}</div>}
              </div>
              <div>
                <label className="custom-label">
                  <div className="label-icon icon-purple"><Calendar size={16} color="white" /></div>
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  className="custom-input"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                {errors.endDate && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.endDate}</div>}
              </div>
            </div>

            {/* Footer */}
            <div className="footer-actions">
              <button type="button" onClick={onClose} className="btn-white">Hủy</button>
              <button type="submit" className="btn-orange">
                <Sparkles size={16} fill="white" /> Tạo ngay
              </button>
            </div>
          </form>
        </div>
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
  const [initialTeacherId, setInitialTeacherId] = useState("");
  const [initialCourseId, setInitialCourseId] = useState("");

  // Sync state with cls prop when it changes
  useEffect(() => {
    if (cls) {
      setName(cls.name || "");
      setSubtitle(cls.subtitle || "");
      setCode(cls.code || "");
      setTeacher(cls.teacher || "");
      setStudents(String(cls.students || 0));
      setActive(String(cls.active || 0));
      setProgress(String(cls.progress || 0));
      setStartDate(cls.startDate ? cls.startDate.substring(0, 10) : "");
      setEndDate(cls.endDate ? cls.endDate.substring(0, 10) : "");
      setStatus(cls.status || "upcoming");
      setSchedule(cls.schedule || "");
    }
  }, [cls]);

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
            setInitialTeacherId(found.id);
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
            setInitialCourseId(assigned[0].courseId);
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

  const isChanged = useMemo(() => {
    if (!cls) return false;
    const iStart = cls.startDate ? cls.startDate.substring(0, 10) : "";
    const iEnd = cls.endDate ? cls.endDate.substring(0, 10) : "";

    return (
      name !== (cls.name || "") ||
      subtitle !== (cls.subtitle || "") ||
      code !== (cls.code || "") ||
      String(teacherId) !== String(initialTeacherId) ||
      String(courseId) !== String(initialCourseId) ||
      startDate !== iStart ||
      (endDate || "") !== iEnd ||
      status !== (cls.status || "upcoming")
    );
  }, [cls, name, subtitle, code, teacherId, initialTeacherId, courseId, initialCourseId, startDate, endDate, status]);

  return (
    <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
      <div className="modal-container-custom">
        {/* Blue Header */}
        <div className="modal-blue-header">
          <button type="button" onClick={onClose} className="close-btn-abs">
            <X size={20} />
          </button>
          <div className="header-content">
            <div className="header-icon-box">
              <FilePenLine size={32} color="white" />
              <div className="sparkle-badge"><Sparkles size={12} fill="white" /></div>
            </div>
            <div className="header-texts">
              <h3>Cập nhật lớp học</h3>
              <p>Cập nhật thông tin lớp học</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-form-body">
          <form onSubmit={handleSubmit} className="form-card">
            {/* Tên lớp học */}
            <div className="form-group-mb">
              <label className="custom-label">
                <div className="label-icon icon-blue"><School size={16} color="white" /></div>
                Tên lớp học <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="custom-input"
                placeholder="VD: Lớp React Advanced - Sáng"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
            </div>

            {/* Mô tả ngắn */}
            <div className="form-group-mb">
              <label className="custom-label">
                <div className="label-icon icon-pink"><BookOpen size={16} color="white" /></div>
                Mô tả ngắn
              </label>
              <input
                type="text"
                className="custom-input"
                placeholder="VD: React Advanced"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            {/* Row 2 cols */}
            <div className="field-grid-2 form-group-mb">
              <div>
                <label className="custom-label">
                  <div className="label-icon icon-orange"><Hash size={16} color="white" /></div>
                  Mã lớp học
                </label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="VD: REACT-ADV"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                {errors.code && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.code}</div>}
              </div>
              <div>
                <label className="custom-label">
                  <div className="label-icon icon-green"><User size={16} color="white" /></div>
                  Giảng viên
                </label>
                <div className="select-wrapper">
                  <select
                    className="custom-select"
                    value={teacherId}
                    onChange={(e) => {
                      setTeacherId(e.target.value);
                      const selected = teachers.find(t => String(t.id) === String(e.target.value));
                      setTeacher(selected ? selected.fullName : "");
                    }}
                  >
                    <option value="">-- Chọn giảng viên --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                  </select>
                  <div className="select-icon">▼</div>
                </div>
                {errors.teacher && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.teacher}</div>}
              </div>
            </div>

            {/* Khóa học */}
            <div className="form-group-mb">
              <label className="custom-label">
                <div className="label-icon icon-pink"><BookOpen size={16} color="white" /></div>
                Khóa học
              </label>
              <div className="select-wrapper">
                <select
                  className="custom-select"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.courseName || c.name || c.title}</option>
                  ))}
                </select>
                <div className="select-icon">▼</div>
              </div>
            </div>

            {/* Dates */}
            <div className="field-grid-2 form-group-mb">
              <div>
                <label className="custom-label">
                  <div className="label-icon icon-blue"><Calendar size={16} color="white" /></div>
                  Ngày bắt đầu <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  className="custom-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.startDate && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.startDate}</div>}
              </div>
              <div>
                <label className="custom-label">
                  <div className="label-icon icon-purple"><Calendar size={16} color="white" /></div>
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  className="custom-input"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                {errors.endDate && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.endDate}</div>}
              </div>
            </div>

            {/* Footer */}
            <div className="footer-actions">
              <button type="button" onClick={onClose} className="btn-white">Hủy bỏ</button>
              <button type="submit" className="btn-orange" disabled={!isChanged}>
                <Sparkles size={16} fill="white" /> Cập nhật
              </button>
            </div>
          </form>
        </div>
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

function ConfirmModal({ title, message, onCancel, onConfirm, confirmText = "Xóa" }) {
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
            {confirmText}
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
    background: "#f5f5f5",
    minHeight: "100%",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
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
    padding: "24px 32px",
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "white",
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "white",
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
