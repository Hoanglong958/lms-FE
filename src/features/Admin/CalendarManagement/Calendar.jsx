import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { classService } from "@utils/classService";
import { courseService } from "@utils/courseService";
import AdminHeader from "@components/Admin/AdminHeader";
import { useOutletContext } from "react-router-dom";
import "./css/Calendar.css";

// Components
import PeriodManagementModal from "./components/Period/PeriodManagementModal";
import CalendarPicker from "./components/CalendarPicker";
import WeekSelector from "./components/WeekSelector";
import SubjectList from "./components/SubjectList";
import TimetableGrid from "./components/TimetableGrid";

export default function CalendarManagement() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const classId = searchParams.get("classId");

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  const [showPeriodModal, setShowPeriodModal] = useState(false);

  // Calendar states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [draggingSubject, setDraggingSubject] = useState(null);

  // Get toggleSidebar from context
  let toggleSidebar = () => {};
  try {
    toggleSidebar = useOutletContext()?.toggleSidebar || (() => {});
  } catch {}

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
        setClassInfo(classData);

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

        // Initialize subjects with courses
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
        alert("Không thể tải thông tin lớp học!");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [classId]);

  // Calculate weeks from date range
  const calculateWeeks = (start, end) => {
    if (!start || !end) return [];

    const weeks = [];
    const currentDate = new Date(start);
    let weekNumber = 1;

    while (currentDate <= end) {
      // Find Monday of current week
      const dayOfWeek = currentDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() + diff);

      // Find Sunday of current week
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      // Adjust if end date is before Sunday
      const weekEnd = sunday > end ? end : sunday;
      const weekStart = monday < start ? start : monday;

      weeks.push({
        weekNumber,
        startDate: new Date(weekStart),
        endDate: new Date(weekEnd),
      });

      // Move to next week
      currentDate.setDate(sunday.getDate() + 1);
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
    const end = new Date(week.endDate);

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
  const handleScheduleChange = (newSchedule) => {
    setSchedule(newSchedule);
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
          title={`Thời khóa biểu - ${
            classInfo?.className || classInfo?.name || "Lớp học"
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
          actions={
            <CalendarPicker
              onDateRangeSelect={handleDateRangeSelect}
              initialStartDate={startDate}
              initialEndDate={endDate}
              onOpenPeriodModal={() => setShowPeriodModal(true)} // 👈 THIS
            />
          }
        />
      </div>

      <div className="calendarContent">
        {/* Left Sidebar - Week Selector and Subject List */}
        <div className="calendarSidebar">
          {weeks.length > 0 && (
            <WeekSelector
              weeks={weeks}
              selectedWeek={selectedWeek}
              onSelectWeek={handleWeekSelect}
            />
          )}

          <SubjectList
            subjects={subjects}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            draggingSubject={draggingSubject}
          />
        </div>

        {/* Main Content - Timetable Grid */}
        <div className="calendarMainContent">
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
                startHour={7}
                endHour={18}
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
                Vui lòng chọn khoảng thời gian từ lịch ở góc phải trên để bắt
                đầu tạo thời khóa biểu.
              </p>
            </div>
          )}
        </div>
      </div>
      {showPeriodModal && (
        <PeriodManagementModal onClose={() => setShowPeriodModal(false)} />
      )}
    </div>
  );
}
