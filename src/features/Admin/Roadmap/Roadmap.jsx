import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import AdminHeader from '@components/Admin/AdminHeader';
import { classService } from '@utils/classService';
import { classCourseService } from '@utils/classCourseService';
import { sessionService } from '@utils/sessionService'; // Course Chapters
import { lessonService } from '@utils/lessonService';
import { roadmapService } from '@utils/roadmapService';
import './Roadmap.css';

import { courseService } from '@utils/courseService';

export default function Roadmap() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const classId = searchParams.get('classId');

    const [classInfo, setClassInfo] = useState(null);
    const [courseInfo, setCourseInfo] = useState(null);
    const [chapters, setChapters] = useState([]); // List of Course Sessions (Chapters)
    const [lessonsMap, setLessonsMap] = useState({}); // Map chapterId -> lessons[]

    // Class Sessions (Slots)
    const [classSessions, setClassSessions] = useState([]);

    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    // State to store roadmap assignments: { [orderIndex]: { chapterId, lessonId } }
    // We use orderIndex (0-based) as the key since periodId might not exist yet
    const [roadmapAssignments, setRoadmapAssignments] = useState({});

    const [loading, setLoading] = useState(true);

    // Get toggleSidebar from context
    let toggleSidebar = () => { };
    try {
        toggleSidebar = useOutletContext()?.toggleSidebar || (() => { });
    } catch { }

    // 1. Initial Load: Class Info & Assigned Courses List
    useEffect(() => {
        if (!classId) return;

        const loadClassAndCourses = async () => {
            try {
                setLoading(true);
                // Fetch Class Detail
                const classRes = await classService.getClassDetail(classId);
                const classData = classRes.data?.data || classRes.data;
                setClassInfo(classData);

                // Fetch Assigned Courses
                const coursesRes = await classCourseService.getClassCourses(classId);
                const assignedCourses = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.data || []);

                setAvailableCourses(assignedCourses);

                // Default to first course if none selected
                if (assignedCourses.length > 0 && !selectedCourseId) {
                    setSelectedCourseId(assignedCourses[0].courseId);
                } else if (assignedCourses.length === 0) {
                    setLoading(false); // Stop loading if no courses
                    alert("Lớp học chưa được gán khóa học nào!");
                }
            } catch (err) {
                console.error("Error loading class/courses", err);
                setLoading(false);
            }
        };

        loadClassAndCourses();
    }, [classId]);

    // 2. Course Specific Data Load
    useEffect(() => {
        if (!selectedCourseId) return;

        const loadCourseData = async () => {
            setLoading(true);
            try {
                // Find basic info from available list first to show something quickly
                const basicInfo = availableCourses.find(c => String(c.courseId) === String(selectedCourseId));
                let totalSessions = basicInfo?.totalSessions || 12;
                let courseTitle = basicInfo?.courseTitle || basicInfo?.title || "";

                // Fetch authoritative Course Detail
                try {
                    const courseDetailRes = await courseService.getCourseDetail(selectedCourseId);
                    const courseDetail = courseDetailRes.data?.data || courseDetailRes.data;
                    if (courseDetail) {
                        if (courseDetail.totalSessions) totalSessions = courseDetail.totalSessions;
                        if (courseDetail.courseName) courseTitle = courseDetail.courseName;
                    }
                } catch (err) {
                    console.warn("Failed to fetch full course detail", err);
                }

                setCourseInfo({
                    id: selectedCourseId,
                    title: courseTitle,
                    totalSessions: totalSessions
                });

                // Fetch Chapters
                const chaptersRes = await sessionService.getSessionsByCourse(selectedCourseId);
                const chaptersData = chaptersRes.data?.data || chaptersRes.data || [];
                setChapters(chaptersData);

                // Fetch Lessons
                const lessonsObj = {};
                await Promise.all(chaptersData.map(async (chap) => {
                    try {
                        const lessonsRes = await lessonService.getLessonsBySession(chap.id);
                        lessonsObj[chap.id] = lessonsRes.data?.data || lessonsRes.data || [];
                    } catch (e) {
                        // silent fail
                    }
                }));
                setLessonsMap(lessonsObj);

                // Fetch Existing Roadmap
                let assignments = {};
                try {
                    const roadmapRes = await roadmapService.getRoadmap(classId, selectedCourseId);
                    const roadmapData = roadmapRes.data?.data || roadmapRes.data || {};
                    const items = roadmapData.items || [];

                    items.forEach(item => {
                        const index = (item.orderIndex || 0);
                        assignments[index] = {
                            chapterId: item.sessionId,
                            lessonId: item.lessonId
                        };
                    });
                } catch (e) {
                    if (e.response && e.response.status === 400) {
                        console.log("No existing roadmap found (400), starting fresh.");
                    }
                }

                // Generate Class Sessions
                const sessions = Array.from({ length: totalSessions }, (_, i) => ({
                    index: i + 1,
                    name: `Buổi ${i + 1}`,
                }));
                setClassSessions(sessions);

                // Auto-design Logic
                if (Object.keys(assignments).length === 0 && chaptersData.length > 0) {
                    let currentSessionIndex = 1;
                    const newAssignments = { ...assignments };
                    for (const chap of chaptersData) {
                        const lessons = lessonsObj[chap.id] || [];
                        for (const lesson of lessons) {
                            if (currentSessionIndex > totalSessions) break;
                            newAssignments[currentSessionIndex] = {
                                chapterId: chap.id,
                                lessonId: lesson.id
                            };
                            currentSessionIndex++;
                        }
                        if (currentSessionIndex > totalSessions) break;
                    }
                    setRoadmapAssignments(newAssignments);
                } else {
                    setRoadmapAssignments(assignments);
                }

            } catch (error) {
                console.error("Error loading specific course data", error);
            } finally {
                setLoading(false);
            }
        };

        loadCourseData();
    }, [selectedCourseId, classId, availableCourses]); // availableCourses typically stable loop-wise if ref fetched

    const handleAssignmentChange = (index, field, value) => {
        setRoadmapAssignments(prev => {
            const current = prev[index] || {};
            // If changing chapter, reset lesson
            if (field === 'chapterId') {
                return {
                    ...prev,
                    [index]: { ...current, chapterId: value, lessonId: '' }
                };
            }
            return {
                ...prev,
                [index]: { ...current, [field]: value }
            };
        });
    };

    const handleSave = async () => {
        if (!selectedCourseId) {
            alert("Chưa chọn khóa học!");
            return;
        }

        try {
            setLoading(true);
            const sessionIds = [];
            const lessonIds = [];
            const periodIds = [];

            classSessions.forEach(session => {
                const assignment = roadmapAssignments[session.index];
                if (assignment && assignment.chapterId && assignment.lessonId) {
                    sessionIds.push(parseInt(assignment.chapterId));
                    lessonIds.push(parseInt(assignment.lessonId));
                    periodIds.push(session.index);
                }
            });

            if (sessionIds.length === 0) {
                alert("Vui lòng gán ít nhất một bài học cho lộ trình!");
                setLoading(false);
                return;
            }

            const payload = {
                classId: parseInt(classId),
                courseId: parseInt(selectedCourseId),
                sessionIds,
                lessonIds,
                periodIds: periodIds, // Re-introducing periodIds
                orderIndexes: periodIds, // Adding orderIndexes just in case
            };

            console.log("Saving Roadmap Payload:", JSON.stringify(payload, null, 2));
            await roadmapService.assignRoadmap(payload);

            alert("Lưu lộ trình thành công!");
        } catch (error) {
            console.error("Failed to save roadmap:", error);
            console.error("Error Response Data:", error.response?.data);
            const detail = error.response?.data?.error || JSON.stringify(error.response?.data) || error.message;
            alert("Lỗi khi lưu lộ trình: " + detail);
        } finally {
            setLoading(false);
        }
    };

    if (!classId) return <div>Không tìm thấy classId</div>;

    return (
        <div className="roadmap-page">
            <AdminHeader
                title={`Lộ trình: ${classInfo?.className || classInfo?.name || '...'}`}
                breadcrumb={[
                    { label: "Dashboard", to: "/admin/dashboard" },
                    { label: "Lớp học", to: "/admin/classes" },
                    { label: `Chi tiết`, to: `/admin/classes/${classId}` },
                    { label: "Lộ trình", to: "#" },
                ]}
                onMenuToggle={toggleSidebar}
                onBack={() => navigate(-1)}
                actions={
                    <button className="roadmap-btn-save" onClick={handleSave} disabled={loading}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                        Lưu thay đổi
                    </button>
                }
            />

            <div className="roadmap-content">
                {loading ? (
                    <div className="roadmap-loading">
                        <div className="spinner"></div> Đang tải dữ liệu...
                    </div>
                ) : (
                    <div className="roadmap-timeline-container">
                        <div className="roadmap-header-info">
                            <div className="header-icon-wrapper">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                </svg>
                            </div>
                            <div className="header-text">
                                {availableCourses.length > 1 ? (
                                    <div style={{ marginBottom: 4 }}>
                                        <label style={{ fontWeight: 600, marginRight: 8 }}>Chọn khóa học:</label>
                                        <select
                                            value={selectedCourseId}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
                                        >
                                            {availableCourses.map(c => (
                                                <option key={c.courseId} value={c.courseId}>
                                                    {c.courseTitle || c.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <h3>{courseInfo?.title ? `Khóa học: ${courseInfo.title}` : 'Chưa gán khóa học'}</h3>
                                )}
                                <p>Thiết lập nội dung học tập cho <strong>{classSessions.length} buổi học</strong>.</p>
                            </div>
                        </div>

                        <div className="roadmap-timeline-wrapper">
                            {classSessions.map((session) => {
                                const assignment = roadmapAssignments[session.index] || {};
                                const selectedChapterId = assignment.chapterId || "";
                                const selectedLessonId = assignment.lessonId || "";

                                // Find available lessons for the selected chapter
                                const availableLessons = selectedChapterId ? (lessonsMap[selectedChapterId] || []) : [];

                                return (
                                    <div className="timeline-item" key={session.index}>
                                        <div className="timeline-left">
                                            <div className="timeline-circle">
                                                {session.index}
                                            </div>
                                            <div className="timeline-line"></div>
                                        </div>

                                        <div className="timeline-content-card">
                                            <div className="card-header">
                                                <div className="session-title">
                                                    <span className="session-number">{session.name}</span>
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                <div className="roadmap-controls-row">
                                                    <div className="control-group">
                                                        <label>Chương / Phần</label>
                                                        <select
                                                            className="modern-select"
                                                            value={selectedChapterId}
                                                            onChange={(e) => handleAssignmentChange(session.index, 'chapterId', e.target.value)}
                                                        >
                                                            <option value="">-- Chọn Chương --</option>
                                                            {chapters.map(chap => (
                                                                <option key={chap.id} value={chap.id}>
                                                                    {chap.sessionName || chap.name || chap.title}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="control-group">
                                                        <label>Bài học</label>
                                                        <select
                                                            className="modern-select"
                                                            value={selectedLessonId}
                                                            onChange={(e) => handleAssignmentChange(session.index, 'lessonId', e.target.value)}
                                                            disabled={!selectedChapterId}
                                                        >
                                                            <option value="">-- Chọn Bài học --</option>
                                                            {availableLessons.length > 0 ? (
                                                                availableLessons.map(les => (
                                                                    <option key={les.id} value={les.id}>
                                                                        {les.lessonName || les.name || les.title}
                                                                    </option>
                                                                ))
                                                            ) : (
                                                                <option disabled>Không có bài học</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
