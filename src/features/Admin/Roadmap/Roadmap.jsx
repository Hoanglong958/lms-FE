import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import AdminHeader from '@components/Admin/AdminHeader';
import { classService } from '@utils/classService';
import { classCourseService } from '@utils/classCourseService';
import { sessionService } from '@utils/sessionService'; // Course Chapters
import { lessonService } from '@utils/lessonService';
import { roadmapService } from '@utils/roadmapService';
import './Roadmap.css';

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

    // State to store roadmap assignments: { [orderIndex]: { chapterId, lessonId } }
    // We use orderIndex (0-based) as the key since periodId might not exist yet
    const [roadmapAssignments, setRoadmapAssignments] = useState({});

    const [loading, setLoading] = useState(true);

    // Get toggleSidebar from context
    let toggleSidebar = () => { };
    try {
        toggleSidebar = useOutletContext()?.toggleSidebar || (() => { });
    } catch { }

    useEffect(() => {
        if (!classId) return;

        const loadData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Class Detail
                const classRes = await classService.getClassDetail(classId);
                const classData = classRes.data?.data || classRes.data;
                setClassInfo(classData);

                // 2. Find Assigned Course
                const coursesRes = await classCourseService.getClassCourses(classId);
                const assignedCourses = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.data || []);

                if (assignedCourses.length > 0) {
                    const assignedCourse = assignedCourses[0];
                    const courseId = assignedCourse.courseId;

                    setCourseInfo({
                        id: courseId,
                        title: assignedCourse.courseTitle,
                        totalSessions: assignedCourse.totalSessions || 12 // Default if missing
                    });

                    // 3. Fetch Chapters (Sessions) for the Course
                    const chaptersRes = await sessionService.getSessionsByCourse(courseId);
                    const chaptersData = chaptersRes.data?.data || chaptersRes.data || [];
                    setChapters(chaptersData);

                    // 4. Fetch Lessons for all Chapters
                    const lessonsObj = {};
                    await Promise.all(chaptersData.map(async (chap) => {
                        try {
                            const lessonsRes = await lessonService.getLessonsBySession(chap.id);
                            lessonsObj[chap.id] = lessonsRes.data?.data || lessonsRes.data || [];
                        } catch (e) {
                            console.warn(`Failed to fetch lessons for chapter ${chap.id}`, e);
                        }
                    }));
                    setLessonsMap(lessonsObj);

                    // 5. Fetch Existing Roadmap
                    let assignments = {};
                    try {
                        const roadmapRes = await roadmapService.getRoadmap(classId, courseId);
                        const roadmapData = roadmapRes.data?.data || roadmapRes.data || {};
                        const items = roadmapData.items || [];

                        // Map items to state
                        items.forEach(item => {
                            // Key by orderIndex (normalized to 0-based if API returns 1-based, check API? Assume 1-based usually)
                            // API spec says 'orderIndex'. Let's assume it matches our session loop index.
                            // If orderIndex comes as 1, 2, 3...
                            const index = (item.orderIndex || 0);
                            assignments[index] = {
                                chapterId: item.sessionId, // API 'sessionId' maps to Chapter
                                lessonId: item.lessonId
                            };
                        });
                        // setRoadmapAssignments(assignments); // Moved to logic step 7

                    } catch (e) {

                        // 400 likely means no roadmap exists for this class/course pair yet (Backend quirk)
                        if (e.response && e.response.status === 400) {
                            console.log("No existing roadmap found (400), starting fresh.");
                        } else {
                            console.warn("Error fetching roadmap:", e);
                        }
                    }

                    // 6. Generate Class Sessions View
                    // Use totalSessions from course or classData
                    const totalSessions = assignedCourse.totalSessions || 12; // Fallback
                    const sessions = Array.from({ length: totalSessions }, (_, i) => ({
                        index: i + 1,
                        name: `Buổi ${i + 1}`,
                    }));
                    setClassSessions(sessions);

                    // 7. Auto-design Roadmap if Empty
                    // If no assignments exist, we auto-fill based on chapters/lessons sequence
                    if (Object.keys(assignments).length === 0 && chaptersData.length > 0) {
                        let currentSessionIndex = 1;
                        const newAssignments = { ...assignments };

                        // Use logic similar to autoFillRoadmap but inside effect
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
                } else {
                    alert("Lớp học chưa được gán khóa học nào!");
                }

            } catch (error) {
                console.error("Error loading roadmap data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [classId]);

    const autoFillRoadmap = () => {
        if (!chapters || chapters.length === 0) {
            alert("Không có dữ liệu chương trình học để tự động gán!");
            return;
        }

        const totalSessions = classSessions.length;
        let currentSessionIndex = 1;
        const newAssignments = {};

        for (const chap of chapters) {
            const lessons = lessonsMap[chap.id] || [];
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
        // alert("Đã tự động điền lộ trình theo thứ tự bài học của khóa học.");
    };

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
        if (!courseInfo?.id) {
            alert("Chưa xác định được khóa học của lớp này, không thể lưu!");
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
                courseId: parseInt(courseInfo.id),
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="roadmap-btn-save"
                            style={{ backgroundColor: '#2563eb' }}
                            onClick={autoFillRoadmap}
                            disabled={loading || !courseInfo}
                            title="Tự động điền lộ trình dựa trên danh sách bài học của khóa học"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Tự động gán
                        </button>
                        <button className="roadmap-btn-save" onClick={handleSave} disabled={loading}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            Lưu thay đổi
                        </button>
                    </div>
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
                                <h3>{courseInfo?.title ? `Khóa học: ${courseInfo.title}` : 'Chưa gán khóa học'}</h3>
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
