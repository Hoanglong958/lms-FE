import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminHeader from '@components/Admin/AdminHeader';
import { useOutletContext } from "react-router-dom";
import { classService } from '@utils/classService';
import { sessionService } from '@utils/sessionService'; // Course Chapters
import { lessonService } from '@utils/lessonService';
import './Roadmap.css';

export default function Roadmap() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const classId = searchParams.get('classId');

    const [classInfo, setClassInfo] = useState(null);
    const [courseInfo, setCourseInfo] = useState(null);
    const [chapters, setChapters] = useState([]); // List of Course Sessions (Chapters)
    const [lessonsMap, setLessonsMap] = useState({}); // Map chapterId -> lessons[]

    // Local state for 'Class Sessions' (Buổi học)
    // In a real app, this would come from the Schedule/Timetable API
    const [classSessions, setClassSessions] = useState([]);

    // State to store roadmap assignments: { [sessionId]: { chapterId, lessonId } }
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

                // 2. Fetch Assigned Course (Assume first course for now if multiple)
                // We need to look up which course is assigned.
                const coursesRes = await classService.findCourses(classId);
                const assignedCourses = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.data || []);

                if (assignedCourses.length > 0) {
                    const courseId = assignedCourses[0].courseId;
                    // Fetch Course Detail (Optional, mainly for title)
                    // const courseRes = await courseService.getCourseDetail(courseId);
                    setCourseInfo({ id: courseId, title: assignedCourses[0].courseTitle });

                    // 3. Fetch Chapters (Sessions) for the Course
                    const chaptersRes = await sessionService.getSessionsByCourse(courseId);
                    const chaptersData = chaptersRes.data?.data || chaptersRes.data || [];
                    setChapters(chaptersData);

                    // 4. Fetch Lessons for all Chapters (Parallel)
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
                }

                // 5. Generate / Fetch Class Sessions (Mocking based on "schedule")
                // In production, this should fetch per specific dates from the backend.
                // We'll generate 24 sessions for demo.
                const mockSessions = Array.from({ length: 12 }, (_, i) => ({
                    id: `session-${i + 1}`,
                    name: `Buổi ${i + 1}`,
                    date: classData.startDate ? new Date(new Date(classData.startDate).getTime() + i * 86400000 * 2).toISOString() : null, // Every 2 days
                    status: i < 3 ? 'COMPLETED' : 'UPCOMING'
                }));
                setClassSessions(mockSessions);

            } catch (error) {
                console.error("Error loading roadmap data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [classId]);

    const handleAssignmentChange = (sessionId, field, value) => {
        setRoadmapAssignments(prev => {
            const current = prev[sessionId] || {};
            // If changing chapter, reset lesson
            if (field === 'chapterId') {
                return {
                    ...prev,
                    [sessionId]: { ...current, chapterId: value, lessonId: '' }
                };
            }
            return {
                ...prev,
                [sessionId]: { ...current, [field]: value }
            };
        });
    };

    const handleSave = async () => {
        // Here we would call API to save the roadmap
        console.log("Saving Assignments:", roadmapAssignments);
        alert("Đã lưu lộ trình thành công!");
    };

    if (!classId) return <div>Không tìm thấy classId</div>;

    return (
        <div className="roadmap-page">
            <AdminHeader
                title={`Lộ trình: ${classInfo?.className || '...'}`}
                breadcrumb={[
                    { label: "Dashboard", to: "/admin/dashboard" },
                    { label: "Lớp học", to: "/admin/classes" },
                    { label: `Chi tiết`, to: `/admin/classes/${classId}` },
                    { label: "Lộ trình", to: "#" },
                ]}
                onMenuToggle={toggleSidebar}
                onBack={() => navigate(-1)}
                actions={
                    <button className="roadmap-btn-save" onClick={handleSave}>
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
                    <div className="roadmap-loading">Đang tải dữ liệu...</div>
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
                                <p>Thiết lập nội dung học tập và theo dõi tiến độ từng buổi học.</p>
                            </div>
                        </div>

                        <div className="roadmap-timeline-wrapper">
                            {classSessions.map((session, index) => {
                                const assignment = roadmapAssignments[session.id] || {};
                                const selectedChapterId = assignment.chapterId || "";
                                const selectedLessonId = assignment.lessonId || "";
                                const availableLessons = selectedChapterId ? (lessonsMap[selectedChapterId] || []) : [];
                                const isPassed = session.status === 'COMPLETED';

                                return (
                                    <div className={`timeline-item ${isPassed ? 'passed' : ''}`} key={session.id}>
                                        <div className="timeline-left">
                                            <div className="timeline-date">
                                                {session.date ? new Date(session.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '--/--'}
                                            </div>
                                            <div className="timeline-line"></div>
                                            <div className="timeline-dot">
                                                {isPassed ? (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                ) : (
                                                    <div className="inner-dot"></div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="timeline-content-card">
                                            <div className="card-header">
                                                <div className="session-title">
                                                    <span className="session-number">Buổi {index + 1}</span>
                                                </div>
                                                <span className={`status-pill ${session.status.toLowerCase()}`}>
                                                    {isPassed ? 'Đã hoàn thành' : 'Sắp diễn ra'}
                                                </span>
                                            </div>

                                            <div className="card-body">
                                                <div className="control-group">
                                                    <label>Chương học</label>
                                                    <select
                                                        className="modern-select"
                                                        value={selectedChapterId}
                                                        onChange={(e) => handleAssignmentChange(session.id, 'chapterId', e.target.value)}
                                                    >
                                                        <option value="">-- Chọn Chương --</option>
                                                        {chapters.map(chap => (
                                                            <option key={chap.id} value={chap.id}>{chap.sessionName || chap.name || chap.title}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="control-group">
                                                    <label>Bài học</label>
                                                    <select
                                                        className="modern-select"
                                                        value={selectedLessonId}
                                                        onChange={(e) => handleAssignmentChange(session.id, 'lessonId', e.target.value)}
                                                        disabled={!selectedChapterId}
                                                    >
                                                        <option value="">-- Chọn Bài học --</option>
                                                        {availableLessons.map(les => (
                                                            <option key={les.id} value={les.id}>{les.lessonName || les.name || les.title}</option>
                                                        ))}
                                                    </select>
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
