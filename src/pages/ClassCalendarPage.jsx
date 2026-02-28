import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { classService } from "@utils/classService";
import { periodService } from "@utils/periodService";
import { scheduleService } from "@utils/scheduleService";
import { classCourseService } from "@utils/classCourseService";
import { courseService } from "@utils/courseService";
import TimetableGrid from "@features/Admin/CalendarManagement/components/TimetableGrid";
import WeekSelectionModal from "@features/Admin/CalendarManagement/components/WeekSelectionModal";
import { FaChevronLeft, FaCalendarAlt } from "react-icons/fa";
import "./ClassCalendar.css";

export default function ClassCalendarPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { id } = useParams();
    const classId = id || searchParams.get("classId");

    const [classInfo, setClassInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [periods, setPeriods] = useState([]);
    const [courses, setCourses] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [showWeekModal, setShowWeekModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!classId) return;

            try {
                setLoading(true);
                // 1. Class Info
                const classRes = await classService.getClassDetail(classId);
                const classData = classRes.data?.data || classRes.data;
                if (classData) setClassInfo(classData);

                // 2. Periods
                try {
                    const periodRes = await periodService.getAll();
                    const pData = periodRes.data ?? [];
                    const periodList = Array.isArray(pData) ? pData : (pData.data || pData.content || []);
                    setPeriods(periodList);
                } catch (e) { console.error(e); }

                // 3. Weeks
                if (classData && classData.startDate && classData.endDate) {
                    const calculatedWeeks = calculateWeeks(classData.startDate, classData.endDate);
                    setWeeks(calculatedWeeks);
                    if (calculatedWeeks.length > 0) {
                        const now = new Date();
                        const currentWeek = calculatedWeeks.find(w => now >= w.startDate && now <= w.endDate);
                        setSelectedWeek(currentWeek || calculatedWeeks[0]);
                    }
                }

                // 4. Courses
                try {
                    const cRes = await courseService.getCourses();
                    const cData = Array.isArray(cRes.data)
                        ? cRes.data
                        : Array.isArray(cRes.data?.data)
                            ? cRes.data.data
                            : Array.isArray(cRes.data?.content)
                                ? cRes.data.content
                                : [];
                    setCourses(cData);
                } catch (e) { console.error("Error loading courses", e); }
            } catch (err) {
                console.error("Error loading calendar data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [classId]);

    useEffect(() => {
        if (!selectedWeek || !classId) return;

        const fetchWeekSchedule = async () => {
            try {
                // 1. Fetch Class Courses
                const ccRes = await classCourseService.getClassCourses(classId);
                const classCourses = ccRes.data?.data || ccRes.data || [];

                const allSchedules = [];

                // 2. Fetch Schedule for each ClassCourse
                await Promise.all(classCourses.map(async (cc) => {
                    try {
                        const res = await scheduleService.getByClassCourseId(cc.id);
                        const data = res.data?.schedules || res.data?.data || res.data || [];
                        allSchedules.push(...data);
                    } catch (e) {
                        console.error(`Error fetching schedule for ccId ${cc.id}`, e);
                    }
                }));

                const weekStart = new Date(selectedWeek.startDate).getTime();
                const weekEnd = new Date(selectedWeek.endDate).getTime();

                const toDateStr = (d) => {
                    if (d instanceof Date) {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${y}-${m}-${day}`;
                    }
                    return String(d).substring(0, 10);
                };

                const weekStartStr = toDateStr(selectedWeek.startDate);
                const weekEndStr = toDateStr(selectedWeek.endDate);

                const newSchedule = {};

                allSchedules.forEach(item => {
                    const itemDateStr = toDateStr(item.date);

                    if (itemDateStr >= weekStartStr && itemDateStr <= weekEndStr) {
                        const itemD = new Date(itemDateStr + 'T00:00:00');
                        const weekD = new Date(weekStartStr + 'T00:00:00');
                        const diffTime = itemD - weekD;
                        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays >= 0 && diffDays <= 6) {
                            if (!newSchedule[diffDays]) newSchedule[diffDays] = {};

                            // Lookup course name
                            let subjectName = item.subjectName || item.courseName;
                            if (!subjectName && courses.length > 0) {
                                const matchedCourse = courses.find(c => c.id === item.courseId);
                                if (matchedCourse) {
                                    subjectName = matchedCourse.title || matchedCourse.name;
                                }
                            }
                            // Fallback to class courses if still not found
                            if (!subjectName) {
                                const cc = classCourses.find(c => c.id === item.classCourseId) || classCourses.find(c => c.courseId === item.courseId);
                                if (cc) subjectName = cc.courseName || cc.subjectName;
                            }

                            newSchedule[diffDays][item.periodId] = {
                                subjectId: item.courseId,
                                subjectName: subjectName || "Lịch học",
                                periodId: item.periodId,
                                backgroundColor: "#e0f2fe",
                                color: "#0369a1",
                                border: "1px solid #bae6fd"
                            };
                        }
                    }
                });
                setSchedule(newSchedule);
            } catch (e) { console.error(e); }
        };
        fetchWeekSchedule();
    }, [selectedWeek, classId, courses]);

    const calculateWeeks = (start, end) => {
        if (!start || !end) return [];
        const endDateObj = new Date(end);
        const weeks = [];
        const currentDate = new Date(start);
        let weekNumber = 1;
        let safeguard = 0;

        while (currentDate <= endDateObj && safeguard < 1000) {
            safeguard++;
            const dayOfWeek = currentDate.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(currentDate);
            monday.setDate(currentDate.getDate() + diff);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            weeks.push({
                weekNumber,
                startDate: new Date(monday),
                endDate: new Date(sunday),
            });

            const nextDate = new Date(sunday);
            nextDate.setDate(sunday.getDate() + 1);
            currentDate.setTime(nextDate.getTime());
            if (currentDate.getTime() <= monday.getTime()) break;
            weekNumber++;
        }
        return weeks;
    };

    const getWeekDays = (week) => {
        if (!week) return [];
        const days = [];
        const start = new Date(week.startDate);
        const dayOfWeek = start.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(start);
        monday.setDate(start.getDate() + diff); // Monday

        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = selectedWeek ? getWeekDays(selectedWeek) : [];

    if (loading) return (
        <div className="cc-page cc-loading">
            <p>Đang chuẩn bị dữ liệu lịch học...</p>
        </div>
    );

    return (
        <div className="cc-page">
            <div className="cc-header">
                <div className="cc-header-content">
                    <div className="cc-header-action-left">
                        <button onClick={() => navigate(`/classes/${classId}`)} className="cc-back-btn">
                            <FaChevronLeft className="cc-back-icon" /> <span>Quay lại lớp học</span>
                        </button>
                    </div>

                    <div className="cc-header-title-block cc-centered">
                        <h1 className="cc-page-title">Thời khóa biểu - {classInfo?.className}</h1>
                        <p className="cc-page-subtitle">Lịch học chi tiết hàng tuần dành cho học viên</p>
                    </div>

                    <div className="cc-header-action-right">
                        {/* Week selection moved to the main card as per user request */}
                    </div>
                </div>
            </div>

            <div className="cc-main-wrapper">
                {selectedWeek ? (
                    <>
                        <div
                            className="cc-week-info-card clickable"
                            onClick={() => setShowWeekModal(true)}
                            title="Nhấn để đổi tuần"
                        >
                            <h2 className="cc-week-info-title">
                                Tuần {selectedWeek.weekNumber}
                                <span className="cc-week-date-range">
                                    ({selectedWeek.startDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} - {selectedWeek.endDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })})
                                </span>
                            </h2>
                            <FaCalendarAlt className="cc-week-icon-large" style={{ marginLeft: 'auto', opacity: 0.5 }} />
                        </div>

                        <div className="cc-calendar-grid-card">
                            <div style={{ pointerEvents: 'auto' }}>
                                <TimetableGrid
                                    weekDays={weekDays}
                                    periods={periods}
                                    schedule={schedule}
                                    onScheduleChange={() => { }}
                                    draggingSubject={null}
                                    readOnly={true}
                                // You might want to ensure TimetableGrid also doesn't have conflicting styles, but it's a shared component.
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="cc-empty-state" onClick={() => setShowWeekModal(true)} style={{ cursor: 'pointer' }}>
                        <span className="cc-empty-icon">📅</span>
                        <h3>Vui lòng chọn tuần để xem lịch học</h3>
                    </div>
                )}
            </div>

            {
                showWeekModal && (
                    <WeekSelectionModal
                        weeks={weeks}
                        selectedWeek={selectedWeek}
                        onSelectWeek={(w) => { setSelectedWeek(w); setShowWeekModal(false); }}
                        onClose={() => setShowWeekModal(false)}
                    />
                )
            }
        </div >
    );
}
