import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { classService } from "@utils/classService";
import { courseService } from "@utils/courseService";
import { scheduleService } from "@utils/scheduleService";
import { periodService } from "@utils/periodService";
import AdminHeader from "@components/Admin/AdminHeader";
import { useOutletContext } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./css/Calendar.css";

// Components
import PeriodManagementModal from "./components/Period/PeriodManagementModal";
import CalendarPicker from "./components/CalendarPicker";
import WeekSelectionModal from "./components/WeekSelectionModal";
import SubjectListSidebar from "./components/SubjectListSidebar";
import TimetableGrid from "./components/TimetableGrid";

export default function CalendarManagement() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const classId = searchParams.get("classId");

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  // Period management
  const [periods, setPeriods] = useState([]);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  // UI State for Redesign
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showSubjectSidebar, setShowSubjectSidebar] = useState(false);

  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  // Calendar states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [draggingSubject, setDraggingSubject] = useState(null);

  // Get toggleSidebar from context
  let toggleSidebar = () => { };
  try {
    toggleSidebar = useOutletContext()?.toggleSidebar || (() => { });
  } catch { }

  // Load class info and courses
  useEffect(() => {
    const loadData = async () => {
      if (!classId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Load class info
        const classRes = await classService.getClassDetail(classId);
        const classData = classRes.data?.data || classRes.data;
        if (classData && classData.startDate && classData.endDate) {
          handleDateRangeSelect(classData.startDate, classData.endDate);
          setClassInfo(classData);
        }

        // Load periods
        try {
          const periodRes = await periodService.getAll();
          const pData = periodRes.data ?? [];
          const periodList = Array.isArray(pData) ? pData : (pData.data || pData.content || []);
          setPeriods(periodList);
          if (periodList.length > 0) {
            setSelectedPeriods(periodList);
          }
        } catch (perr) {
          console.error("Load periods error", perr);
        }

        // Load courses for subject selection
        const coursesRes = await courseService.getCourses();
        const coursesData = Array.isArray(coursesRes.data)
          ? coursesRes.data
          : Array.isArray(coursesRes.data?.data)
            ? coursesRes.data.data
            : Array.isArray(coursesRes.data?.content)
              ? coursesRes.data.content
              : [];
        setCourses(coursesData);

        if (coursesData.length > 0) {
          setSubjects(
            coursesData.map((course) => ({
              courseId: course.id,
              courseName: course.title || course.name,
            }))
          );
        }
      } catch (err) {
        console.error("Error loading data:", err);
        showNotification("Lỗi", "Không thể tải thông tin lớp học!", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [classId]);

  // Calculate weeks from date range
  const calculateWeeks = (start, end) => {
    if (!start || !end) return [];

    const endDateObj = new Date(end);
    if (isNaN(endDateObj.getTime())) return [];

    const weeks = [];
    const currentDate = new Date(start);
    if (isNaN(currentDate.getTime())) return [];

    let weekNumber = 1;
    let safeguard = 0;

    // Ensure we start from a Monday or the exact start date?
    // User logic in calculateWeeks seems to align to weeks.
    // Let's keep existing logic but just auto-call it.

    while (currentDate <= endDateObj && safeguard < 1000) {
      safeguard++;
      // Find Monday of current week
      const dayOfWeek = currentDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() + diff);

      // Find Sunday of current week
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      // Adjust if end date is before Sunday? 
      // Usually full weeks are better for grid.
      const weekEnd = sunday;
      const weekStart = monday;

      weeks.push({
        weekNumber,
        startDate: new Date(weekStart),
        endDate: new Date(weekEnd),
      });

      // Move to next week
      // Use sunday object to increment to ensure we move forward
      const nextDate = new Date(sunday);
      nextDate.setDate(sunday.getDate() + 1);

      // Update currentDate
      currentDate.setTime(nextDate.getTime());

      // Safety check: if currentDate didn't move forward (e.g. invalid date math), break
      if (currentDate.getTime() <= weekStart.getTime()) {
        console.error("Infinite loop detected in calculateWeeks");
        break;
      }

      weekNumber++;
    }

    return weeks;
  };

  // Handle date range selection
  const handleDateRangeSelect = (start, end) => {
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const calculatedWeeks = calculateWeeks(start, end);
      setWeeks(calculatedWeeks);
      if (calculatedWeeks.length > 0) {
        setSelectedWeek(calculatedWeeks[0]);
      }
    } else {
      setWeeks([]);
      setSelectedWeek(null);
    }
  };

  // Handle week selection
  const handleWeekSelect = (week) => {
    setSelectedWeek(week);
    // Reset schedule for new week
    setSchedule({});
  };

  // Get week days (Monday to Sunday)
  const getWeekDays = (week) => {
    if (!week) return [];

    const days = [];
    const start = new Date(week.startDate);

    // Find Monday
    const dayOfWeek = start.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(start);
    monday.setDate(start.getDate() + diff);

    // Generate 7 days from Monday to Sunday
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }

    return days;
  };

  // Handle drag start
  const handleDragStart = (subject) => {
    setDraggingSubject(subject);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingSubject(null);
  };

  // Handle schedule change
  const handleScheduleChange = (newSchedule, changeDetails) => {
    setSchedule(newSchedule);
  };

  const [saving, setSaving] = useState(false);

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      // 1. Group by Course -> List of { dayIndex, periodId }
      const courseMap = {};

      Object.keys(schedule).forEach((dayIdx) => {
        const daySchedule = schedule[dayIdx];
        if (!daySchedule) return;

        Object.values(daySchedule).forEach((item) => {
          const cId = item.subjectId;
          const pId = item.periodId;
          const dIdx = Number(dayIdx); // 0-6

          if (!courseMap[cId]) {
            courseMap[cId] = [];
          }
          courseMap[cId].push({ dayIndex: dIdx, periodId: pId });
        });
      });

      // 2. Create requests with 1-to-1 mapping (periodIds[i] <-> daysOfWeek[i])
      const requests = [];

      Object.keys(courseMap).forEach((courseId) => {
        const items = courseMap[courseId];
        // items is array of { dayIndex, periodId }

        const periodIds = [];
        const daysOfWeek = [];

        items.forEach(({ dayIndex, periodId }) => {
          if (periodId && (dayIndex >= 0 && dayIndex <= 6)) {
            periodIds.push(Number(periodId));
            daysOfWeek.push(dayIndex + 1); // 0->1 ... 6->7
          }
        });

        if (periodIds.length > 0) {
          requests.push({
            classId: Number(classId),
            courseId: Number(courseId),
            periodIds,
            daysOfWeek
          });
        }
      });

      if (requests.length === 0) {
        showNotification("Thông báo", "Không có lịch để lưu", "info");
        setSaving(false);
        return;
      }

      // 3. Execute sequentially
      for (const req of requests) {
        await scheduleService.createManual(req);
      }

      showNotification("Thành công", "Đã lưu cấu hình thời khóa biểu", "success");

    } catch (error) {
      console.error("Save schedule error", error);
      // Show detailed error if available from backend
      const msg = error.response?.data?.data || error.response?.data?.message || "Có lỗi khi lưu lịch học";
      showNotification("Lỗi", msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPeriods = (selectedIds, allPeriods = []) => {
    // Update local periods state in case new ones were added
    if (allPeriods.length > 0) {
      setPeriods(allPeriods);
    }
    const sourcePeriods = allPeriods.length > 0 ? allPeriods : periods;

    const selected = sourcePeriods.filter((p) => selectedIds.includes(p.id));

    // Sort periods by startTime
    const getTimeValue = (t) => {
      if (!t) return 0;
      if (typeof t === 'string') {
        // "HH:mm"
        return parseInt(t.replace(':', ''), 10);
      }
      if (Array.isArray(t)) {
        // [h, m]
        return (t[0] || 0) * 60 + (t[1] || 0);
      }
      if (typeof t === 'object') {
        return (t.hour || 0) * 60 + (t.minute || 0);
      }
      return 0;
    };

    selected.sort((a, b) => {
      return getTimeValue(a.startTime) - getTimeValue(b.startTime);
    });
    setSelectedPeriods(selected);
  };

  if (loading) {
    return (
      <div className="calendarPage">
        <div className="calendarLoading">Đang tải...</div>
      </div>
    );
  }

  if (!classId) {
    return (
      <div className="calendarPage">
        <div className="calendarError">
          <h2>Không tìm thấy lớp học</h2>
          <p>Vui lòng chọn lớp học từ trang quản lý lớp học.</p>
          <button
            onClick={() => navigate("/admin/classes")}
            className="calendarPrimaryButton"
          >
            Quay lại trang quản lý lớp học
          </button>
        </div>
      </div>
    );
  }

  const weekDays = selectedWeek ? getWeekDays(selectedWeek) : [];

  return (
    <div className="calendarPage">
      <div className="calendarHeaderContainer">
        <AdminHeader
          title={`Thời khóa biểu - ${classInfo?.className || classInfo?.name || "Lớp học"
            }`}
          breadcrumb={[
            { label: "Dashboard", to: "/admin/dashboard" },
            { label: "Lớp học", to: "/admin/classes" },
            {
              label: "Thời khóa biểu",
              to: `/admin/calendar?classId=${classId}`,
            },
          ]}
          onMenuToggle={toggleSidebar}
          onBack={() => navigate(-1)}
          actions={
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="triggerButton"
                onClick={() => setShowWeekModal(true)}
                title="Chọn tuần"
                style={{ backgroundColor: "#007bff", color: "white", border: "none" }}
              >
                📅 {selectedWeek ? `Tuần ${selectedWeek.weekNumber}` : "Chọn tuần"}
              </button>
              <button
                type="button"
                className="triggerButton"
                onClick={() => setShowSubjectSidebar(true)}
                title="Môn học"
                style={{ backgroundColor: "#17a2b8", color: "white", border: "none" }}
              >
                📚 Môn học
              </button>
              <button
                type="button"
                className="triggerButton"
                onClick={handleSaveSchedule}
                title="Lưu lịch học"
                disabled={saving}
                style={{ backgroundColor: "#28a745", color: "white", border: "none" }}
              >
                {saving ? "Đang lưu..." : "💾 Lưu lịch học"}
              </button>
              <button
                type="button"
                className="triggerButton managePeriodBtn"
                onClick={() => setShowPeriodModal(true)}
                title="Quản lý ca học"
              >
                ⏰ Quản lý ca học
              </button>
            </div>
          }
        />
      </div>

      <div className="calendarContent" style={{
        width: '100%',
        flex: 1,
        padding: '20px',
        marginLeft: showSubjectSidebar ? '1rem' : '0',
        position: 'relative',
        zIndex: showSubjectSidebar ? 3001 : 'auto',
        backgroundColor: showSubjectSidebar ? '#f7f8fa' : 'transparent',
        transition: 'all 0.3s ease'
      }}>
        {/* Main Content - Full Width */}
        <div className="calendarMainContent" >
          {selectedWeek ? (
            <>
              <div className="calendarWeekInfo">
                <h2 className="calendarWeekTitle">
                  Tuần {selectedWeek.weekNumber} -{" "}
                  {selectedWeek.startDate.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })}{" "}
                  đến{" "}
                  {selectedWeek.endDate.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </h2>
              </div>
              <TimetableGrid
                weekDays={weekDays}
                periods={selectedPeriods}
                schedule={schedule}
                onScheduleChange={handleScheduleChange}
                draggingSubject={draggingSubject}
              />
            </>
          ) : (
            <div className="calendarEmptyState">
              <div className="calendarEmptyIcon">📅</div>
              <h3 className="calendarEmptyTitle">Chưa chọn tuần học</h3>
              <p className="calendarEmptyText">
                Vui lòng chọn khoảng thời gian từ nút "Chọn tuần" ở trên để bắt
                đầu tạo thời khóa biểu.
              </p>
              <button
                onClick={() => setShowWeekModal(true)}
                className="calendarPrimaryButton"
                style={{ marginTop: '15px' }}
              >
                Chọn tuần ngay
              </button>
            </div>
          )}
        </div>
      </div>

      {showPeriodModal && (
        <PeriodManagementModal
          onClose={() => setShowPeriodModal(false)}
          selectedPeriodIds={selectedPeriods.map(p => p.id)}
          onApply={handleApplyPeriods}
        />
      )}

      {showWeekModal && (
        <WeekSelectionModal
          weeks={weeks}
          selectedWeek={selectedWeek}
          onSelectWeek={handleWeekSelect}
          onClose={() => setShowWeekModal(false)}
        />
      )}

      <SubjectListSidebar
        subjects={subjects}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        draggingSubject={draggingSubject}
        isOpen={showSubjectSidebar}
        onClose={() => setShowSubjectSidebar(false)}
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
