import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import AdminHeader from '@components/Admin/AdminHeader';
import { classService } from '@utils/classService';
import { classCourseService } from '@utils/classCourseService';
import { sessionService } from '@utils/sessionService';
import { lessonService } from '@utils/lessonService';
import { roadmapService } from '@utils/roadmapService';
import { scheduleService } from '@utils/scheduleService';
import { periodService } from '@utils/periodService';
import { courseService } from '@utils/courseService';
// Import shared components from Calendar
import TimetableGrid from '../CalendarManagement/components/TimetableGrid';
import './Roadmap.css';
import { useNotification } from '@shared/notification';

export default function Roadmap() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const classId = searchParams.get('classId');
    const { success, error: notifyError } = useNotification();

    // Data States
    const [classInfo, setClassInfo] = useState(null);
    const [courseInfo, setCourseInfo] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [lessonsMap, setLessonsMap] = useState({}); // chapterId -> lessons[]

    // Schedule States
    const [scheduleItems, setScheduleItems] = useState([]); // All class slots sorted by time
    const [periods, setPeriods] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

    // Assignment State: Map<"YYYY-MM-DD_periodId", { chapterId, lessonId }>
    const [slotAssignments, setSlotAssignments] = useState({});

    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Drag & Drop State
    const [draggingLesson, setDraggingLesson] = useState(null);

    // Sidebar context
    let toggleSidebar = () => { };
    try {
        const ctx = useOutletContext();
        if (ctx && ctx.toggleSidebar) toggleSidebar = ctx.toggleSidebar;
    } catch { }

    // Helper for date string
    const getLocalYYYYMMDD = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 1. Initial Load: Class, Periods, Schedule
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

                // 3. Class Schedule & Generate Weeks
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
                } catch (e) {
                    console.warn("Could not fetch schedule", e);
                }

                // Generate Weeks (Aligned with Class Dates)
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

            // Loop until we pass the end date
            // Safety break just in case
            let safeguard = 0;
            while (currentDate <= endDate && safeguard < 1000) {
                safeguard++;

                // Determine Week Range (Monday to Sunday)
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

                // Move to next week
                currentDate.setDate(currentDate.getDate() + 7);
                weekNumber++;
            }
            setWeeks(weeksArr);
            return;
        }

        // Fallback: Generate from Items if no Class Dates
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

    // 2. Load Course Data (Roadmap & Content)
    useEffect(() => {
        if (!selectedCourseId) return;

        const loadCourseData = async () => {
            setLoading(true);
            try {
                // Course Info
                const courseDetailRes = await courseService.getCourseDetail(selectedCourseId);
                const courseDetail = courseDetailRes.data?.data || courseDetailRes.data;
                setCourseInfo(courseDetail || { id: selectedCourseId });

                // Chapters
                const chaptersRes = await sessionService.getSessionsByCourse(selectedCourseId);
                const chaptersData = chaptersRes.data?.data || chaptersRes.data || [];
                setChapters(chaptersData);

                // Lessons
                const lessonsObj = {};
                await Promise.all(chaptersData.map(async (chap) => {
                    try {
                        const lessonsRes = await lessonService.getLessonsBySession(chap.id);
                        lessonsObj[chap.id] = lessonsRes.data?.data || lessonsRes.data || [];
                    } catch (e) { }
                }));
                setLessonsMap(lessonsObj);

                // Existing Roadmap
                const roadmapRes = await roadmapService.getRoadmap(classId, selectedCourseId);
                const roadmapData = roadmapRes.data?.data || roadmapRes.data || {};
                const roadmapItems = roadmapData.items || [];

                const newAssignments = {};
                const sortedSchedule = [...scheduleItems];

                roadmapItems.forEach(rItem => {
                    const orderIdx = rItem.orderIndex; // 1-based
                    if (orderIdx - 1 < sortedSchedule.length) {
                        const sItem = sortedSchedule[orderIdx - 1]; // 0-based
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


    // Handle Drop Logic
    const handleDropLesson = (dayIndex, periodId, lessonData) => {
        const currentWeek = weeks[selectedWeekIndex];
        if (!currentWeek) return;

        const date = new Date(currentWeek.startDate);
        date.setDate(date.getDate() + dayIndex);
        const dateStr = getLocalYYYYMMDD(date);
        const key = `${dateStr}_${periodId}`;

        // Update Assignments Map
        setSlotAssignments(prev => ({
            ...prev,
            [key]: {
                chapterId: lessonData.chapterId,
                lessonId: lessonData.id
            }
        }));
    };

    const handleRemoveAssignment = (dayIndex, periodId) => {
        const currentWeek = weeks[selectedWeekIndex];
        if (!currentWeek) return;
        const date = new Date(currentWeek.startDate);
        date.setDate(date.getDate() + dayIndex);
        const dateStr = getLocalYYYYMMDD(date);
        const key = `${dateStr}_${periodId}`;

        setSlotAssignments(prev => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const keys = Object.keys(slotAssignments);

            if (keys.length === 0) {
                notifyError("Chưa có nội dung nào được gán!");
                setSaving(false);
                return;
            }

            // Sort keys by Date then Period
            keys.sort((a, b) => {
                const [d1, p1] = a.split('_');
                const [d2, p2] = b.split('_');
                if (d1 !== d2) return d1.localeCompare(d2);
                return parseInt(p1) - parseInt(p2);
            });

            const sessionIds = [];
            const lessonIds = [];
            const periodIds = [];

            keys.forEach((key, index) => {
                const assignment = slotAssignments[key];
                sessionIds.push(parseInt(assignment.chapterId));
                lessonIds.push(parseInt(assignment.lessonId));
                periodIds.push(index + 1);
            });

            const payload = {
                classId: parseInt(classId),
                courseId: parseInt(selectedCourseId),
                sessionIds,
                lessonIds,
                periodIds: periodIds,
                orderIndexes: periodIds,
            };

            await roadmapService.assignRoadmap(payload);
            success("Lưu lộ trình thành công! (Lưu ý: Chỉ lưu nội dung bài học, vui lòng đảm bảo lịch học đã được tạo trong phần Thời khóa biểu)");
        } catch (error) {
            console.error(error);
            notifyError("Lỗi khi lưu lộ trình!");
        } finally {
            setSaving(false);
        }
    };

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

        // 1. Populate from Schedule Items (Existing Database Slots)
        scheduleItems.forEach((item) => {
            const itemDateStr = toDateStr(item.date);
            if (itemDateStr >= weekStartStr && itemDateStr < weekEndStr) {
                // Day Index
                const d1 = new Date(itemDateStr + 'T00:00:00');
                const d2 = new Date(weekStartStr + 'T00:00:00');
                const dy = Math.round((d1 - d2) / (1000 * 60 * 60 * 24));

                if (dy >= 0 && dy <= 6) {
                    if (!sch[dy]) sch[dy] = {};

                    const dateStr = itemDateStr;
                    const key = `${dateStr}_${item.periodId}`;
                    const assignment = slotAssignments[key];

                    // Lookup Course Info
                    const courseInfo = availableCourses.find(c => String(c.courseId) === String(item.courseId));
                    const scheduledSubject = courseInfo ? (courseInfo.courseTitle || courseInfo.title) : item.subjectName;

                    let subjectName = scheduledSubject || `Slot ${item.periodId}`;
                    let backgroundColor = "#f8fafc";
                    let textColor = "#64748b";
                    let border = "1px dashed #cbd5e1";

                    if (scheduledSubject) {
                        backgroundColor = "#f0f9ff"; // Light Blue for scheduled slots
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

        // 2. Populate from Virtual Assignments
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

    const assignedLessonIds = useMemo(() => {
        const ids = new Set();
        Object.values(slotAssignments).forEach(a => {
            if (a.lessonId) ids.add(String(a.lessonId));
        });
        return ids;
    }, [slotAssignments]);


    return (
        <div className="roadmap-page improved-ui">
            <AdminHeader
                title={`Lộ trình môn học: ${classInfo ? classInfo.className : '...'}`}
                breadcrumb={[
                    { label: "Dashboard", to: "/admin/dashboard" },
                    { label: "Lớp học", to: "/admin/classes" },
                    { label: "Lộ trình", to: "#" },
                ]}
                onMenuToggle={toggleSidebar}
                onBack={() => navigate(-1)}
                actions={
                    <button className="roadmap-btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? "Đang lưu..." : "Lưu lộ trình"}
                    </button>
                }
            />

            <div className="roadmap-container">
                <div className={`roadmap-lessons-sidebar ${loading ? 'loading' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Danh sách bài học</h3>
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
                                            const isAssigned = assignedLessonIds.has(String(les.id));
                                            return (
                                                <div
                                                    key={les.id}
                                                    className={`lesson-item-draggable ${isAssigned ? 'assigned' : ''}`}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.effectAllowed = "copy";
                                                        e.dataTransfer.setData("text/plain", JSON.stringify({
                                                            chapterId: chap.id,
                                                            id: les.id,
                                                            title: les.lessonName || les.title
                                                        }));
                                                        setDraggingLesson({ chapterId: chap.id, id: les.id, title: les.lessonName });
                                                    }}
                                                    onDragEnd={() => setDraggingLesson(null)}
                                                >
                                                    <span className="drag-handle">::</span>
                                                    <span>{les.lessonName || les.title}</span>
                                                    {isAssigned && <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 'bold' }}>✓</span>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="roadmap-cal-wrapper">
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

                    <TimetableGrid
                        weekDays={currentWeekDates}
                        periods={periods}
                        schedule={weekSchedule}
                        onScheduleChange={(newSch, details) => {
                            if (details && details.subject) {
                                const lessonData = details.subject;
                                handleDropLesson(details.dayIndex, details.periodId, lessonData);
                            }
                        }}
                        draggingSubject={draggingLesson}
                    />
                </div>
            </div>
        </div>
    );
}
