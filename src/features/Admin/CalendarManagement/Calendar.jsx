import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { classService } from "@utils/classService";
import { courseService } from "@utils/courseService";
import { scheduleService } from "@utils/scheduleService";
import { periodService } from "@utils/periodService";
import { classCourseService } from "@utils/classCourseService";
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
import EditScheduleModal from "./components/EditScheduleModal";

export default function CalendarManagement() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const classId = searchParams.get("classId");

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [classCourses, setClassCourses] = useState([]);

  const subjects = useMemo(() => {
    if (!courses.length) return [];
    const classCourseMap = new Map();
    classCourses.forEach((cc) => {
      if (cc.courseId && cc.id) {
        classCourseMap.set(cc.courseId, cc.id);
      }
    });
    return courses.map((course) => ({
      courseId: course.id,
      courseName: course.title || course.name || course.courseName || "Môn học",
      classCourseId: classCourseMap.get(course.id) || null,
    }));
  }, [courses, classCourses]);

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
  const [schedule, setSchedule] = useState({});
  const [draggingSubject, setDraggingSubject] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [movingItem, setMovingItem] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState([]); // Array of changes to save
  const [refreshKey, setRefreshKey] = useState(0);
  const outletContext = useOutletContext();
  const toggleSidebar = outletContext?.toggleSidebar ?? (() => {});



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

        // Load class courses (assignments)
        try {
          const ccRes = await classCourseService.getClassCourses(classId);
          const ccData = ccRes.data?.data || ccRes.data || [];
          setClassCourses(ccData);

          // Filter courses list to only show assigned courses if needed?
          // The prompt implies we fetch "1 lớp + 1 khóa học" schedules.
          // Probably we still want all courses available in sidebar?
          // Or strictly those assigned? User said "Display Student Classes and Courses" in history but this is admin.
          // Let's keep all courses in sidebar for now, but maybe highlight assigned ones?
          // Actually, let's just store classCourses for schedule fetching.
        } catch (ccErr) {
          console.error("Load class courses error", ccErr);
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

      } catch (err) {
        console.error("Error loading data:", err);
        showNotification("Lỗi", "Không thể tải thông tin lớp học!", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [classId]);

  // Load Schedules when Reference Data (classCourses, selectedWeek) changes
  useEffect(() => {
    const fetchSchedules = async () => {
      // Clear schedule immediately when dependencies change
      if (!classId || !selectedWeek || classCourses.length === 0) {
        setSchedule({});  // IMPORTANT: Clear old schedule
        return;
      }

      try {
        const allSchedules = [];
        // Fetch schedule for each assigned ClassCourse
        await Promise.all(classCourses.map(async (cc) => {
          try {
            // cc.id is the classCourseId
            const res = await scheduleService.getByClassCourseId(cc.id);
            const data = res.data?.schedules || res.data?.data || res.data || [];
            // Attach courseId from cc if missing in data?
            // data items usually have courseId.
            allSchedules.push(...data);
          } catch (e) {
            console.error(`Error fetching schedule for ccId ${cc.id}`, e);
          }
        }));

        // Map to existing schedule structure: { [dayIndex]: { [periodId]: Item } }
        // dayIndex 0 = Monday of the selected week.
        const newSchedule = {};

        // Use YYYY-MM-DD string comparison to avoid timezone bugs
        const toDateStr = (d) => {
          if (d instanceof Date) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          }
          return String(d).substring(0, 10); // "2026-02-09" from ISO/LocalDate string
        };

        const weekStartStr = toDateStr(selectedWeek.startDate);
        const weekEndStr = toDateStr(selectedWeek.endDate);

        console.log("[TKB] Week range:", weekStartStr, "->", weekEndStr, "| Total items from API:", allSchedules.length);

        allSchedules.forEach(item => {
          const itemDateStr = toDateStr(item.date);

          // String comparison works for YYYY-MM-DD format (lexicographic = chronological)
          if (itemDateStr >= weekStartStr && itemDateStr <= weekEndStr) {
            // Calculate day index from dates (both normalized to local midnight)
            const itemD = new Date(itemDateStr + 'T00:00:00');
            const weekD = new Date(weekStartStr + 'T00:00:00');
            const diffDays = Math.round((itemD - weekD) / (1000 * 3600 * 24));

            if (diffDays >= 0 && diffDays <= 6) {
              if (!newSchedule[diffDays]) newSchedule[diffDays] = {};

              // Find course info
              const course = courses.find(c => c.id === item.courseId);

              newSchedule[diffDays][item.periodId] = {
                subjectId: item.courseId,
                subjectName: course ? (course.title || course.name) : "Môn học",
                periodId: item.periodId,
                classCourseId: item.classCourseId || classCourses.find(cc => cc.courseId === item.courseId)?.id,
                scheduleId: item.id,
                date: item.date
              };
            }
          }
        });

        console.log("[TKB] Filtered schedule for week:", weekStartStr, "| Days with items:", Object.keys(newSchedule).length);

        // Always set schedule (even if empty) to ensure UI updates
        setSchedule(newSchedule);

      } catch (error) {
        console.error("Error loading schedules", error);
        setSchedule({});  // Clear on error too
        showNotification("Lỗi", "Không thể tải lịch học", "error");
      }
    };

    fetchSchedules();
  }, [classId, selectedWeek, classCourses, courses, refreshKey]); // re-run when week changes or courses loaded

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
    // Schedule fetching is handled by useEffect now
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
    // If we are in moving mode (movingItem exists) and the dropped item matches
    if (movingItem && changeDetails?.subject?.scheduleId === movingItem.scheduleId) {
      const originalItem = movingItem;
      const dayIndex = changeDetails.dayIndex;

      // Calculate target date
      const currentWeekDays = getWeekDays(selectedWeek);
      const targetDateObj = currentWeekDays[dayIndex];
      const targetDate = targetDateObj.toISOString().split('T')[0];

      // Add to pending changes
      setPendingChanges(prev => [
        ...prev,
        {
          type: 'update',
          id: originalItem.scheduleId,
          payload: {
            date: targetDate,
            periodId: changeDetails.periodId,
            status: "SCHEDULED",
            classId: Number(classId)
          },
          originalSubject: originalItem.subjectName
        }
      ]);

      // Update local schedule VISUALLY
      setSchedule(newSchedule);

      setMovingItem(null); // Exit move mode
      return;
    }

    // Normal create/drop from sidebar
    setSchedule(newSchedule);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Process pending changes (Moves/Edits)
      for (const change of pendingChanges) {
        if (change.type === 'update') {
          await scheduleService.updateItem(change.id, change.payload);
        }
      }

      showNotification("Thành công", "Đã lưu các thay đổi", "success");
      setPendingChanges([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Save changes error", error);
      showNotification("Lỗi", "Không thể lưu thay đổi", "error");
    } finally {
      setSaving(false);
    }
  };


  const [saving, setSaving] = useState(false);

  // This is the "Pattern Save" for Create Mode - NOW SAVES ONLY CURRENT WEEK
  const handleSaveSchedulePattern = async () => {
    setSaving(true);
    try {
      if (!selectedWeek) {
        showNotification("Lỗi", "Vui lòng chọn tuần để lưu lịch", "error");
        setSaving(false);
        return;
      }

      // 1. Collect all schedule items for the current week
      const scheduleItems = [];
      const weekDays = getWeekDays(selectedWeek);

      Object.keys(schedule).forEach((dayIdx) => {
        const daySchedule = schedule[dayIdx];
        if (!daySchedule) return;

        const dayIndex = Number(dayIdx); // 0-6
        if (dayIndex < 0 || dayIndex > 6) return;

        const targetDate = weekDays[dayIndex];

        Object.values(daySchedule).forEach((item) => {
          scheduleItems.push({
            scheduleItemId: item.scheduleId || null, // null for new items
            dayIndex: dayIndex,
            periodId: item.periodId,
            date: targetDate.toISOString().split("T")[0], // YYYY-MM-DD
            classCourseId: item.classCourseId || null,
          });
        });
      });

      if (scheduleItems.length === 0) {
        showNotification("Thông báo", "Không có lịch để lưu cho tuần này", "info");
        setSaving(false);
        return;
      }

      const usedClassCourseIds = [
        ...new Set(
          scheduleItems
            .map((item) => item.classCourseId)
            .filter((id) => id !== null && id !== undefined)
        ),
      ];

      let payloadClassCourseId = usedClassCourseIds[0] || null;
      if (!payloadClassCourseId && classCourses.length === 1) {
        payloadClassCourseId = classCourses[0].id;
      }

      if (!payloadClassCourseId) {
        showNotification("Lỗi", "Chưa có khóa học nào được gán cho lớp hoặc không thể xác định lớp-khóa học", "error");
        setSaving(false);
        return;
      }

      if (usedClassCourseIds.length > 1) {
        showNotification("Lỗi", "Không thể lưu nhiều lớp-khóa học trong cùng một lệnh. Vui lòng tạo lịch riêng cho từng khóa học.", "error");
        setSaving(false);
        return;
      }

      // 3. Call the new week update API
      const weekUpdateRequest = {
        classCourseId: payloadClassCourseId,
        weekStartDate: selectedWeek.startDate.toISOString().split('T')[0],
        weekEndDate: selectedWeek.endDate.toISOString().split('T')[0],
        scheduleItems: scheduleItems
      };

      await scheduleService.updateWeekSchedule(weekUpdateRequest);

      showNotification("Thành công", `Đã lưu lịch cho tuần ${selectedWeek.weekNumber}`, "success");
      
      // Refresh the schedule data
      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error("Save week schedule error", error);
      const msg = error.response?.data?.data || error.response?.data?.message || "Có lỗi khi lưu lịch học";
      showNotification("Lỗi", msg, "error");
    } finally {
      setSaving(false);
    }
  };



  const handleScheduleClick = (item) => {
    // If we are ALREADY in move mode, maybe clicking another item switches selection?
    // Or do we stick to "Click edit means open modal"?
    // User request: "Click edit -> choose other weeks -> drag".
    // So "Edit" click should Enter Move Mode.
    setMovingItem(item);
    showNotification("Đang di chuyển", `Đã chọn ${item.subjectName}. Kéo vào ô trống, sau đó bấm nút 'Lưu thay đổi' ở góc dưới.`, "info");
  };

  const handleUpdateSchedule = async (updatedItem) => {
    try {
      const payload = {
        date: updatedItem.date,
        periodId: updatedItem.periodId,
        status: updatedItem.status || "SCHEDULED",
        classId: Number(classId),
      };

      await scheduleService.updateItem(updatedItem.scheduleId, payload);

      showNotification("Thành công", "Đã cập nhật buổi học", "success");
      setEditingItem(null);
      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error("Update schedule error", error);
      showNotification("Lỗi", "Không thể cập nhật: " + (error.response?.data?.message || "Lỗi server"), "error");
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
            } `}
          breadcrumb={[
            { label: "Dashboard", to: "/admin/dashboard" },
            { label: "Lớp học", to: "/admin/classes" },
            {
              label: "Thời khóa biểu",
              to: `/ admin / calendar ? classId = ${classId} `,
            },
          ]}
          onMenuToggle={toggleSidebar}
          onBack={() => navigate(-1)}
          actions={
            !isCreateMode ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className="triggerButton"
                  onClick={() => setShowWeekModal(true)}
                  title="Chọn tuần"
                  style={{ backgroundColor: "#007bff", color: "white", border: "none" }}
                >
                  📅 {selectedWeek ? `Tuần ${selectedWeek.weekNumber} ` : "Chọn tuần"}
                </button>

                <button
                  type="button"
                  className="triggerButton"
                  onClick={() => {
                    setIsCreateMode(true);
                    setShowSubjectSidebar(true);
                  }}
                  title="Tạo lịch học cho tuần hiện tại"
                  style={{ backgroundColor: "#6f42c1", color: "white", border: "none" }}
                >
                  ⚡ Tạo lịch (tuần này)
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
            ) : null
          }
        />
      </div>

      <div className="calendarBody">
        {!isCreateMode && selectedWeek && (
          <h2 style={{ marginBottom: '15px', color: '#333' }}>
            Tuần {selectedWeek.weekNumber} - {new Date(selectedWeek.startDate).getDate()}-{new Date(selectedWeek.startDate).getMonth() + 1} đến {new Date(selectedWeek.endDate).getDate()}-{new Date(selectedWeek.endDate).getMonth() + 1}
          </h2>
        )}


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


                <TimetableGrid
                  weekDays={weekDays}
                  periods={periods || []}
                  schedule={schedule}
                  onScheduleChange={handleScheduleChange}
                  onScheduleClick={handleScheduleClick}
                  movingItem={movingItem}
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

        {
          showPeriodModal && (
            <PeriodManagementModal
              onClose={() => setShowPeriodModal(false)}
              selectedPeriodIds={selectedPeriods.map(p => p.id)}
              onApply={handleApplyPeriods}
            />
          )
        }

        {
          showWeekModal && (
            <WeekSelectionModal
              weeks={weeks}
              selectedWeek={selectedWeek}
              onSelectWeek={handleWeekSelect}
              onClose={() => setShowWeekModal(false)}
            />
          )
        }

        <SubjectListSidebar
          subjects={subjects}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          draggingSubject={draggingSubject}
          isOpen={showSubjectSidebar}
          onClose={() => setShowSubjectSidebar(false)}
          onSave={handleSaveSchedulePattern}
          isSaving={saving}
          onExit={() => {
            setIsCreateMode(false);
            setShowSubjectSidebar(false);
          }}
        />

        {
          pendingChanges.length > 0 && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 5000,
              background: 'white',
              padding: '10px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <span>Có {pendingChanges.length} thay đổi chưa lưu</span>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                onClick={() => {
                  setPendingChanges([]);
                  setRefreshKey(prev => prev + 1); // Revert
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
            </div>
          )
        }

        {
          editingItem && (
            <EditScheduleModal
              scheduleItem={editingItem}
              periods={periods}
              onClose={() => setEditingItem(null)}
              onSave={handleUpdateSchedule}
            />
          )
        }

        {
          movingItem && (
            <div
              className="moving-item-card"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "text/plain",
                  JSON.stringify({ type: "schedule", item: movingItem })
                );
                e.dataTransfer.effectAllowed = "move";
              }}
              style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                zIndex: 10000,
                border: '1px solid #007bff',
                width: '250px',
                cursor: 'grab'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: '#007bff' }}>Đang di chuyển...</strong>
                <button onClick={() => setMovingItem(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>×</button>
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{movingItem.subjectName}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Kéo thẻ này vào ô trống mới</div>
            </div>
          )
        }



        <NotificationModal
          isOpen={notification.isOpen}
          onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      </div>
    </div>
  );
}
