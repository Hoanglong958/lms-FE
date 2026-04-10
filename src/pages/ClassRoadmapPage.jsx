import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { classService } from '@utils/classService';
import { classCourseService } from '@utils/classCourseService';
import { sessionService } from '@utils/sessionService';
import { lessonService } from '@utils/lessonService';
import { roadmapService } from '@utils/roadmapService';
import { scheduleService } from '@utils/scheduleService';
import { periodService } from '@utils/periodService';
import TimetableGrid from '@features/Admin/CalendarManagement/components/TimetableGrid';
import { FaChevronLeft, FaBook } from 'react-icons/fa';
import './ClassRoadmap.css';

export default function ClassRoadmapPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { id } = useParams();
    const classId = id || searchParams.get('classId');

    // Data States
    const [classInfo, setClassInfo] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [lessonsMap, setLessonsMap] = useState({});

    // Schedule States
    const [scheduleItems, setScheduleItems] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

    // Assignment State
    const [slotAssignments, setSlotAssignments] = useState({});

    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    const [loading, setLoading] = useState(true);

    // Helper for date string
    const getLocalYYYYMMDD = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 1. Initial Load
    useEffect(() => {
        if (!classId) return;

        const loadInitialData = async () => {
            try {
                setLoading(true);

                // 1. Class Info
                const classRes = await classService.getClassDetail(classId);
                const classData = classRes.data?.data || classRes.data;
                setClassInfo(classData);

                // 2. Periods
                const periodRes = await periodService.getAll();
                const periodList = Array.isArray(periodRes.data) ? periodRes.data : (periodRes.data?.data || periodRes.data?.content || []);
                setPeriods(periodList);

                // 3. Class Schedule
                let items = [];
                try {
                    const schedRes = await scheduleService.getByClass(classId);
                    items = schedRes.data?.data || schedRes.data || [];
                    items.sort((a, b) => {
                        const dateA = new Date(a.date || a.day);
                        const dateB = new Date(b.date || b.day);
                        if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();
                        return (a.periodId || 0) - (b.periodId || 0);
                    });
                    setScheduleItems(items);
                } catch (e) { }

                // Generate Weeks
                generateWeeks(items, classData?.startDate, classData?.endDate);

                // 4. Assigned Courses
                const coursesRes = await classCourseService.getClassCourses(classId);
                const assignedCourses = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.data || []);
                setAvailableCourses(assignedCourses);

                if (assignedCourses.length > 0 && !selectedCourseId) {
                    setSelectedCourseId(assignedCourses[0].courseId);
                }

            } catch (err) {
                console.error("Error loading initial data", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [classId]);

    // Helper: Generate Weeks
    const generateWeeks = (items, classStart, classEnd) => {
        if (classStart && classEnd) {
            const weeksArr = [];
            const startDate = new Date(classStart);
            const endDate = new Date(classEnd);
            let currentDate = new Date(startDate);
            let weekNumber = 1;
            let safeguard = 0;
            while (currentDate <= endDate && safeguard < 1000) {
                safeguard++;
                const day = currentDate.getDay();
                const diff = day === 0 ? -6 : 1 - day;
                const monday = new Date(currentDate);
                monday.setDate(currentDate.getDate() + diff);
                monday.setHours(0, 0, 0, 0);
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);

                weeksArr.push({
                    index: weekNumber - 1,
                    startDate: monday,
                    endDate: sunday,
                    label: `Tuần ${weekNumber}`
                });
                currentDate.setDate(currentDate.getDate() + 7);
                weekNumber++;
            }
            setWeeks(weeksArr);
            return;
        }

        // Fallback
        const weekSet = new Set();
        const weeksArrFallback = [];
        items.forEach(item => {
            if (!item.date) return;
            const d = new Date(item.date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(d.setDate(diff));
            monday.setHours(0, 0, 0, 0);
            const key = monday.getTime();
            if (!weekSet.has(key)) {
                weekSet.add(key);
                weeksArrFallback.push(monday);
            }
        });
        if (weeksArrFallback.length === 0) {
            const now = new Date();
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(now.setDate(diff));
            monday.setHours(0, 0, 0, 0);
            weeksArrFallback.push(monday);
        }
        weeksArrFallback.sort((a, b) => a.getTime() - b.getTime());
        setWeeks(weeksArrFallback.map((start, idx) => ({
            index: idx,
            startDate: start,
            endDate: new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000),
            label: `Tuần ${idx + 1}`
        })));
    };

    // 2. Load Course Data
    useEffect(() => {
        if (!selectedCourseId) return;

        const loadCourseData = async () => {
            setLoading(true);
            try {
                const chaptersRes = await sessionService.getSessionsByCourse(selectedCourseId);
                const chaptersData = chaptersRes.data?.data || chaptersRes.data || [];
                setChapters(chaptersData);

                const lessonsObj = {};
                await Promise.all(chaptersData.map(async (chap) => {
                    try {
                        const lessonsRes = await lessonService.getLessonsBySession(chap.id);
                        lessonsObj[chap.id] = lessonsRes.data?.data || lessonsRes.data || [];
                    } catch (e) { }
                }));
                setLessonsMap(lessonsObj);

                const roadmapRes = await roadmapService.getRoadmap(classId, selectedCourseId);
                const roadmapData = roadmapRes.data?.data || roadmapRes.data || {};
                const roadmapItems = roadmapData.items || [];

                const newAssignments = {};
                const sortedSchedule = [...scheduleItems];

                roadmapItems.forEach(rItem => {
                    const orderIdx = rItem.orderIndex;
                    if (orderIdx - 1 < sortedSchedule.length) {
                        const sItem = sortedSchedule[orderIdx - 1];
                        if (sItem) {
                            const dateStr = getLocalYYYYMMDD(new Date(sItem.date));
                            const key = `${dateStr}_${sItem.periodId}`;
                            newAssignments[key] = {
                                chapterId: rItem.sessionId,
                                lessonId: rItem.lessonId
                            };
                        }
                    }
                });
                setSlotAssignments(newAssignments);

            } catch (error) {
                console.error("Error loading course/roadmap data", error);
            } finally {
                setLoading(false);
            }
        };

        loadCourseData();
    }, [selectedCourseId, classId, scheduleItems]);

    // Prepare data for TimetableGrid
    const currentWeekDates = useMemo(() => {
        if (!weeks[selectedWeekIndex]) return [];
        const start = weeks[selectedWeekIndex].startDate;
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [weeks, selectedWeekIndex]);

    const weekSchedule = useMemo(() => {
        const sch = {};
        if (!weeks[selectedWeekIndex]) return sch;

        const start = weeks[selectedWeekIndex].startDate;
        const weekKeyStart = start.getTime();
        const weekKeyEnd = start.getTime() + 7 * 24 * 60 * 60 * 1000;

        const toDateStr = (d) => {
            if (d instanceof Date) {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            }
            return String(d).substring(0, 10);
        };

        const weekStartStr = toDateStr(start);
        const weekEndStr = toDateStr(new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000));

        scheduleItems.forEach((item) => {
            const itemDateStr = toDateStr(item.date);
            if (itemDateStr >= weekStartStr && itemDateStr < weekEndStr) {
                const d1 = new Date(itemDateStr + 'T00:00:00');
                const d2 = new Date(weekStartStr + 'T00:00:00');
                const dy = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));

                if (dy >= 0 && dy <= 6) {
                    if (!sch[dy]) sch[dy] = {};

                    const dateStr = itemDateStr;
                    const key = `${dateStr}_${item.periodId}`;
                    const assignment = slotAssignments[key];
                    const courseInfo = availableCourses.find(c => String(c.courseId) === String(item.courseId));
                    const scheduledSubject = courseInfo ? (courseInfo.courseTitle || courseInfo.title) : item.subjectName;

                    let subjectName = scheduledSubject || `Slot ${item.periodId}`;
                    let backgroundColor = "#f8fafc";
                    let textColor = "#64748b";
                    let border = "1px dashed #cbd5e1";

                    if (scheduledSubject) {
                        backgroundColor = "#f0f9ff";
                        textColor = "#0369a1";
                        border = "1px solid #bae6fd";
                    }

                    if (assignment) {
                        const ch = chapters.find(c => String(c.id) === String(assignment.chapterId));
                        const ls = lessonsMap[assignment.chapterId]?.find(l => String(l.id) === String(assignment.lessonId));
                        subjectName = ls ? (ls.lessonName || ls.title) : "Bài học";
                        backgroundColor = "#dbeafe";
                        textColor = "#1e40af";
                        border = "1px solid #bfdbfe";
                    }

                    sch[dy][item.periodId] = {
                        periodId: item.periodId,
                        subjectName,
                        subjectId: assignment ? assignment.lessonId : null,
                        backgroundColor,
                        color: textColor,
                        border,
                        type: 'roadmap-slot',
                        isScheduled: !!scheduledSubject
                    };
                }
            }
        });

        // Virtual Assignments view
        Object.keys(slotAssignments).forEach(key => {
            const [dateStr, pIdStr] = key.split('_');
            const periodId = parseInt(pIdStr);
            const date = new Date(dateStr);
            if (date.getTime() >= weekKeyStart && date.getTime() < weekKeyEnd) {
                const d1 = new Date(date); d1.setHours(0, 0, 0, 0);
                const d2 = new Date(start); d2.setHours(0, 0, 0, 0);
                const dy = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
                if (dy >= 0 && dy <= 6) {
                    if (!sch[dy]) sch[dy] = {};
                    const isDbSlot = scheduleItems.some(item => {
                        return toDateStr(item.date) === toDateStr(date) && item.periodId === periodId;
                    });

                    if (!isDbSlot) {
                        const assignment = slotAssignments[key];
                        const ls = lessonsMap[assignment.chapterId]?.find(l => String(l.id) === String(assignment.lessonId));

                        if (!sch[dy][periodId]) {
                            sch[dy][periodId] = {
                                periodId: periodId,
                                subjectName: ls ? (ls.lessonName || ls.title) : "Bài học (Mới)",
                                subjectId: assignment.lessonId,
                                backgroundColor: "#d1fae5",
                                color: "#065f46",
                                border: "1px solid #a7f3d0",
                                type: 'roadmap-slot-virtual'
                            };
                        }
                    }
                }
            }
        });

        return sch;
    }, [scheduleItems, weeks, selectedWeekIndex, slotAssignments, chapters, lessonsMap, availableCourses]);

    if (loading) {
        return (
            <div className="roadmap-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#667eea',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid rgba(102, 126, 234, 0.2)',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
                    }}></div>
                    Đang chuẩn bị dữ liệu lộ trình...
                </div>
            </div>
        );
    }

    return (
        <div className="roadmap-page">
            {/* Header Section */}
            <div className="roadmap-header">
                <div className="roadmap-header-content">
                    <div className="roadmap-header-left">
                        <button onClick={() => navigate(`/classes/${classId}`)} className="roadmap-back-btn">
                            <FaChevronLeft className="roadmap-back-icon" />
                            <span>Quay lại lớp học</span>
                        </button>
                        <div className="roadmap-title-block">
                            <h1 className="roadmap-page-title">Lộ trình học - {classInfo?.className}</h1>
                            <p className="roadmap-page-subtitle">Kế hoạch chi tiết các bài học theo tuần</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="roadmap-main-wrapper">
                <div className="roadmap-container">
                    {/* Lessons Sidebar */}
                    <div className={`roadmap-lessons-sidebar ${loading ? 'loading' : ''}`}>
                        <div className="sidebar-header">
                            <h3><FaBook style={{ marginRight: '8px', verticalAlign: 'middle' }} />Danh sách bài học</h3>
                            <div className="course-select-area">
                                <select
                                    value={selectedCourseId || ''}
                                    onChange={e => setSelectedCourseId(e.target.value)}
                                    className="modern-select"
                                >
                                    {availableCourses.map(c => (
                                        <option key={c.courseId} value={c.courseId}>
                                            {c.courseTitle || c.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="chapters-list">
                            {chapters.map(chap => {
                                const lessons = lessonsMap[chap.id] || [];
                                return (
                                    <div key={chap.id} className="chapter-group">
                                        <div className="chapter-title">{chap.sessionName || chap.name}</div>
                                        <div className="lessons-group">
                                            {lessons.map(les => {
                                                const isAssigned = Object.values(slotAssignments).some(a => String(a.lessonId) === String(les.id));
                                                return (
                                                    <div
                                                        key={les.id}
                                                        className={`lesson-item-draggable ${isAssigned ? 'assigned' : ''}`}
                                                    >
                                                        <span>{les.lessonName || les.title}</span>
                                                        {isAssigned && <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 'bold', fontSize: '16px' }}>✓</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Calendar Wrapper */}
                    <div className="roadmap-cal-wrapper">
                        {/* Week Navigator */}
                        <div className="week-navigator">
                            <button
                                className="nav-btn"
                                disabled={selectedWeekIndex <= 0}
                                onClick={() => setSelectedWeekIndex(p => p - 1)}
                            >
                                &lt; Tuần trước
                            </button>
                            <span className="week-label">
                                {weeks[selectedWeekIndex]?.label}
                                <small>
                                    ({weeks[selectedWeekIndex]?.startDate?.toLocaleDateString('vi-VN')} - {weeks[selectedWeekIndex]?.endDate?.toLocaleDateString('vi-VN')})
                                </small>
                            </span>
                            <button
                                className="nav-btn"
                                disabled={selectedWeekIndex >= weeks.length - 1}
                                onClick={() => setSelectedWeekIndex(p => p + 1)}
                            >
                                Tuần sau &gt;
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="roadmap-grid-card">
                            <div style={{ pointerEvents: 'none' }}>
                                <TimetableGrid
                                    weekDays={currentWeekDates}
                                    periods={periods}
                                    schedule={weekSchedule}
                                    onScheduleChange={() => { }}
                                    draggingSubject={null}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
