import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { classService } from "@utils/classService";
import { classStudentService } from "@utils/classStudentService";
import { classCourseService } from "@utils/classCourseService";
import { examService } from "@utils/examService"; // We might need this, or create a specific service
import { Users, BookOpen, ClipboardCheck, Calendar, Clock, ChevronLeft, Layout, List, FolderPlus, Book, ListOrdered, X, Save } from "lucide-react";
import "../Dashboard/TeacherDashboard.css"; // Reuse dashboard styles
import TeacherAttendanceTab from "./TeacherAttendanceTab";
import ExamTable from "@admin/ExamManagement/ExamTable";
import ExamCreateDialog from "@admin/ExamManagement/ExamCreateDialog";
import ExamEditDialog from "@admin/ExamManagement/ExamEditDialog";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import LessonManager from "@admin/Courses/LessonManager";
import LessonDetailView from "@admin/Courses/LessonDetailView";
import { sessionService } from "@utils/sessionService";
import manageStyles from "@admin/Courses/ManageLessons.module.css";

export default function TeacherClassDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);
    const [activeTab, setActiveTab] = useState("lessons"); // Default to lessons for teaching hub

    // Data states
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [expandedSessions, setExpandedSessions] = useState([]);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);
    const [sessionFormData, setSessionFormData] = useState({ title: "", orderIndex: "" });

    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    const [notification, setNotification] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    useEffect(() => {
        fetchClassData();
    }, [id]);

    const fetchClassData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Class Detail
            const res = await classService.getClassDetail(id);
            const data = res.data?.data || res.data;
            setClassData(data);

            // 2. Fetch Students
            const studentRes = await classStudentService.getClassStudents(id);
            setStudents(studentRes.data?.data || studentRes.data || []);

            // 3. Fetch Courses
            const courseRes = await classCourseService.getClassCourses(id);
            setCourses(courseRes.data?.data || courseRes.data || []);

            // 4. Fetch Exams for this class
            try {
                const examRes = await examService.getExamsByClass(id);
                setExams(examRes.data?.data || examRes.data || []);
            } catch (error) {
                console.error("Failed to fetch exams for class", error);
                setExams([]);
            }

            // 5. Select first course by default if lessons tab is active
            if (courseRes.data?.data?.length > 0 || (Array.isArray(courseRes.data) && courseRes.data.length > 0)) {
                const firstCourse = courseRes.data?.data?.[0] || courseRes.data[0];
                setSelectedCourseId(firstCourse.courseId);
            }

        } catch (error) {
            console.error("Failed to fetch class data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/teacher/classes");
    };

    const handleCreateSuccess = () => {
        fetchClassData();
        setNotification({
            isOpen: true,
            title: "Thành công",
            message: "Tạo bài kiểm tra thành công!",
            type: "success"
        });
    };

    const handleEditSuccess = () => {
        fetchClassData();
        setNotification({
            isOpen: true,
            title: "Thành công",
            message: "Cập nhật bài kiểm tra thành công!",
            type: "success"
        });
    };

    const handleDeleteExam = async (examId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) return;
        try {
            await examService.deleteExam(examId);
            fetchClassData();
            setNotification({
                isOpen: true,
                title: "Thành công",
                message: "Xóa bài kiểm tra thành công!",
                type: "success"
            });
        } catch (error) {
            setNotification({
                isOpen: true,
                title: "Lỗi",
                message: "Không thể xóa bài kiểm tra.",
                type: "error"
            });
        }
    };

    useEffect(() => {
        if (!selectedCourseId) return;
        const loadSessions = async () => {
            try {
                const res = await sessionService.getSessionsByCourse(selectedCourseId);
                setSessions(res.data || []);
            } catch (err) { }
        };
        loadSessions();
    }, [selectedCourseId]);

    const handleAddSession = () => {
        setCurrentSession(null);
        setSessionFormData({ title: "", orderIndex: sessions.length + 1 });
        setShowSessionModal(true);
    };

    const handleEditSession = (s) => {
        setCurrentSession(s);
        setSessionFormData({ title: s.title, orderIndex: s.orderIndex });
        setShowSessionModal(true);
    };

    const handleDeleteSession = async (sid) => {
        if (!window.confirm("Xóa chương học này?")) return;
        try {
            await sessionService.deleteSession(sid);
            setSessions(sessions.filter((s) => s.id !== sid));
            if (selectedLesson?.sessionId === sid) setSelectedLesson(null);
        } catch (err) { }
    };

    const handleSubmitSession = async (e) => {
        e.preventDefault();
        if (!selectedCourseId) return;
        const payload = {
            title: sessionFormData.title,
            courseId: selectedCourseId,
            orderIndex: sessionFormData.orderIndex || sessions.length + 1,
        };
        try {
            if (currentSession) {
                await sessionService.updateSession(currentSession.id, payload);
                setSessions(sessions.map((s) => s.id === currentSession.id ? { ...s, ...payload } : s));
            } else {
                const res = await sessionService.addSession(payload);
                setSessions([...sessions, res.data]);
            }
            setShowSessionModal(false);
        } catch (err) { }
    };

    if (loading) return <div className="p-8">Đang tải...</div>;
    if (!classData) return <div className="p-8">Không tìm thấy dữ liệu lớp học.</div>;

    return (
        <div className="teacher-dashboard">
            {/* Header with Back Button */}
            <div className="teacher-class-header" style={{ marginBottom: 24 }}>
                <button
                    onClick={handleBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280',
                        marginBottom: 16,
                        fontWeight: 500
                    }}
                >
                    <ChevronLeft size={20} />
                    Quay lại danh sách
                </button>

                <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>{classData.className}</h1>
                            <p style={{ color: '#6b7280', margin: 0 }}>{classData.description}</p>
                        </div>
                        <span className={`status-badge ${classData.status?.toLowerCase()}`}>{classData.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 24, marginTop: 20, borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4b5563' }}>
                            <Users size={18} />
                            <span><strong>{students.length}</strong> học viên</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4b5563' }}>
                            <Calendar size={18} />
                            <span>{classData.startDate} - {classData.endDate || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4b5563' }}>
                            <Clock size={18} />
                            <span>{classData.scheduleInfo || 'Chưa có lịch'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="teacher-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>

                <TabButton active={activeTab === 'lessons'} onClick={() => setActiveTab('lessons')} icon={<BookOpen size={18} />} label="Bài học" />
                <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={18} />} label="Học viên" />
                <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<ClipboardCheck size={18} />} label="Điểm danh" />
                <TabButton active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} icon={<ClipboardCheck size={18} />} label="Bài kiểm tra" />
            </div>

            {/* Tab Content */}
            <div className="teacher-tab-content">
                {activeTab === 'lessons' && (
                    <div className="lessons-tab-container" style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        {courses.length > 0 ? (
                            <div style={{ display: 'flex', minHeight: '600px' }}>
                                {/* Left column: Sessions & Lessons */}
                                <div style={{ width: '350px', borderRight: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: 'white' }}>
                                        <select
                                            style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #e5e7eb' }}
                                            value={selectedCourseId || ""}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                        >
                                            {courses.map(c => <option key={c.id} value={c.courseId}>{c.courseTitle}</option>)}
                                        </select>
                                        <button
                                            onClick={handleAddSession}
                                            style={{ marginTop: 12, width: '100%', padding: '8px', background: '#f97316', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            + Thêm Chương học
                                        </button>
                                    </div>

                                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                                        <div className={manageStyles.contentSidebar} style={{ width: '100%', padding: 0 }}>
                                            {sessions.map((s) => {
                                                const isExpanded = expandedSessions.includes(s.id);
                                                return (
                                                    <div key={s.id} className={`${manageStyles.sectionPanel} ${isExpanded ? manageStyles.sectionPanelExpanded : ""}`}>
                                                        <div className={manageStyles.sectionPanelHeader}>
                                                            <button
                                                                className={manageStyles.sectionToggle}
                                                                onClick={() => setExpandedSessions((prev) => prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id])}
                                                            >
                                                                <span className={manageStyles.sectionName}>{s.title}</span>
                                                                <span className={manageStyles.sectionChevron}>{isExpanded ? "▾" : "▸"}</span>
                                                            </button>
                                                            <div className={manageStyles.sectionActions}>
                                                                <button onClick={() => handleEditSession(s)}>Sửa</button>
                                                                <button onClick={() => handleDeleteSession(s.id)}>Xóa</button>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <LessonManager
                                                                sessionId={s.id}
                                                                selectedLesson={selectedLesson}
                                                                onSelectLesson={(l) => setSelectedLesson({ sessionId: s.id, ...l })}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right column: Lesson Detail */}
                                <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                                    <LessonDetailView
                                        lesson={selectedLesson}
                                        onLessonUpdated={(updated) => setSelectedLesson((prev) => ({ ...prev, ...updated }))}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: 40, textAlign: 'center' }}>
                                <p>Chưa có khóa học nào được gán cho lớp này.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="students-list" style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                    <th style={{ padding: 12 }}>STT</th>
                                    <th style={{ padding: 12 }}>Tên học viên</th>
                                    <th style={{ padding: 12 }}>Ngày tham gia</th>
                                    <th style={{ padding: 12 }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                                        <td style={{ padding: 12 }}>{index + 1}</td>
                                        <td style={{ padding: 12 }}>{student.studentName}</td>
                                        <td style={{ padding: 12 }}>{student.enrolledAt}</td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: 20,
                                                fontSize: 12,
                                                background: student.status === 'ACTIVE' ? '#ecfdf5' : '#f3f4f6',
                                                color: student.status === 'ACTIVE' ? '#10b981' : '#6b7280'
                                            }}>
                                                {student.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="exams-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0 }}>Danh sách bài kiểm tra</h3>
                            <button
                                style={{
                                    padding: '8px 16px',
                                    background: '#f97316',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}
                                onClick={() => setIsCreateOpen(true)}
                            >
                                <ClipboardCheck size={18} />
                                + Tạo bài kiểm tra
                            </button>
                        </div>
                        <ExamTable
                            exams={exams}
                            loading={loading}
                            onEdit={(exam) => {
                                setSelectedExam(exam);
                                setIsEditOpen(true);
                            }}
                            onDelete={handleDeleteExam}
                            onViewDetail={(examId) => navigate(`/teacher/exams/detail/${examId}`)}
                        />
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <TeacherAttendanceTab classId={id} students={students} />
                )}
            </div>

            <ExamCreateDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                defaultClassId={id}
                onSuccess={handleCreateSuccess}
            />

            {showSessionModal && (
                <div className={manageStyles.modalOverlay}>
                    <div className={manageStyles.modalContainer}>
                        <div className={manageStyles.modalHeaderOrange}>
                            <div className={manageStyles.modalHeaderIcon}>
                                <FolderPlus size={32} color="white" strokeWidth={1.5} />
                            </div>
                            <h3>{currentSession ? "Cập nhật chương học" : "Thêm Chương học"}</h3>
                        </div>

                        <form onSubmit={handleSubmitSession} className={manageStyles.modalFormBody}>
                            <div className={manageStyles.formGroup}>
                                <label className={manageStyles.labelBold}>Tên Chương học</label>
                                <div className={manageStyles.inputWithIcon}>
                                    <Book size={24} className={manageStyles.inputIcon} />
                                    <input
                                        className={manageStyles.customInputModal}
                                        value={sessionFormData.title}
                                        onChange={(e) => setSessionFormData({ ...sessionFormData, title: e.target.value })}
                                        placeholder="Nhập tên chương học..."
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className={manageStyles.formGroup}>
                                <label className={manageStyles.labelBold}>Thứ tự</label>
                                <div className={manageStyles.inputWithIcon}>
                                    <ListOrdered size={24} className={manageStyles.inputIcon} />
                                    <input
                                        type="number"
                                        className={manageStyles.customInputModal}
                                        value={sessionFormData.orderIndex || ""}
                                        onChange={(e) => setSessionFormData({ ...sessionFormData, orderIndex: Number(e.target.value) })}
                                        placeholder="Ví dụ: 1, 2, 3..."
                                        min={1}
                                    />
                                </div>
                            </div>

                            <div className={manageStyles.modalFooterButtons}>
                                <button type="button" onClick={() => setShowSessionModal(false)} className={manageStyles.btnCancel}>
                                    <X size={18} /> Hủy
                                </button>
                                <button type="submit" className={manageStyles.btnSave}>
                                    <Save size={18} /> Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ExamEditDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                exam={selectedExam}
                onSuccess={handleEditSuccess}
            />

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                border: 'none',
                background: active ? 'white' : 'transparent',
                color: active ? '#f97316' : '#6b7280',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
            }}
        >
            {icon}
            {label}
        </button>
    );
}
