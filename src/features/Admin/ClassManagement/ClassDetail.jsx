import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { classService } from "@utils/classService";
import { courseService } from "@utils/courseService";
import { classCourseService } from "@utils/classCourseService";
import { classTeacherService } from "@utils/classTeacherService";
import { classStudentService } from "@utils/classStudentService";
import { userService } from "@utils/userService";
import "./ClassDetail.css";
import ClassDetailModal from "./ClassDetailModal";

export default function ClassDetail({ classData: propClassData, onBack }) {
    const { state } = useLocation();
    const { id } = useParams();
    const navigate = useNavigate();

    // Use passed prop, or state from navigation, or null (to fetch)
    const [classData, setClassData] = useState(propClassData || state?.classData || null);
    const [loading, setLoading] = useState(!classData);

    useEffect(() => {
        // Validation: If we have state data matching the ID (if applicable), use it
        if (state?.classData) {
            setClassData(state.classData);
            setLoading(false);
            return;
        }

        // If prop is provided and matches (or we assume it matches if no ID checks), use it
        if (propClassData) {
            setClassData(propClassData);
            setLoading(false);
            return;
        }

        // Otherwise if we have an ID, fetch it
        if (id) {
            // Only fetch if we don't have data or data ID doesn't match URL ID
            if (!classData || String(classData.id) !== String(id)) {
                setLoading(true);
                classService.getClassDetail(id)
                    .then(res => {
                        const data = res.data?.data || res.data;

                        const mapped = {
                            id: data.id,
                            name: data.className || data.name,
                            code: data.classCode || data.code,
                            teacher: data.instructorName || data.teacher,
                            students: data.maxStudents || 0,
                            active: data.activeStudents || 0,
                            progress: data.progress || 0,
                            startDate: data.startDate,
                            endDate: data.endDate,
                            status: (data.status || 'upcoming').toLowerCase().replace('ongoing', 'active').replace('completed', 'ended'),
                            schedule: data.schedule
                        };
                        setClassData(mapped);
                    })
                    .catch(err => {
                        console.error("Failed to fetch class detail", err);
                        alert("Không tìm thấy thông tin lớp học");
                    })
                    .finally(() => setLoading(false));
            }
        }
    }, [id, state, propClassData]); // Removed classData from dependency to avoid infinite loops


    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate("/admin/classes");
        }
    };

    // Real students data from API (must be declared before studentsList)
    const [realStudents, setRealStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Use real students instead of mock data
    const studentsList = useMemo(() => {
        console.log('🔍 Mapping students to list:', realStudents);
        console.log('🔍 Sample student object:', realStudents[0]);

        return realStudents.map((student, index) => {
            const mapped = {
                id: student.studentId || student.id || student.userId || index + 1,
                name: student.studentName || student.fullName || student.name || `Học viên ${index + 1}`,
                code: `HV${String(index + 1).padStart(3, "0")}`,
                avatar: null,
                enrolledAt: student.enrolledAt,
                status: student.status,
            };
            if (index === 0) console.log('🔍 Mapped student:', mapped);
            return mapped;
        });
    }, [realStudents]);

    // Initialize attendance state when studentsList changes
    useEffect(() => {
        const initialAttendance = {};
        studentsList.forEach(student => {
            initialAttendance[student.id] = 'present';
        });
        setAttendance(initialAttendance);
    }, [studentsList]);

    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [attendance, setAttendance] = useState({});
    const [attendanceShift, setAttendanceShift] = useState("morning");


    const [showAttendance, setShowAttendance] = useState(true);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    // Course Modals State
    const [showAssignedCoursesModal, setShowAssignedCoursesModal] = useState(false);
    const [assignedCourses, setAssignedCourses] = useState([]); // Mock assigned courses
    const [showCourseSelectionModal, setShowCourseSelectionModal] = useState(false);

    const [coursesList, setCoursesList] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Teacher Assignment Modal State
    const [assigningClass, setAssigningClass] = useState(null);

    // Student Assignment Modal State
    const [addingStudents, setAddingStudents] = useState(null);

    // Fetch real students for this class
    useEffect(() => {
        if (classData?.id) {
            async function fetchClassStudents() {
                try {
                    setLoadingStudents(true);
                    const res = await classStudentService.getClassStudents(classData.id);

                    let students = [];
                    if (res.data?.data && Array.isArray(res.data.data)) {
                        students = res.data.data;
                    } else if (Array.isArray(res.data)) {
                        students = res.data;
                    }

                    console.log('✅ Class students loaded:', students);
                    setRealStudents(students);

                    // Update classData.students count with real number
                    setClassData(prev => ({
                        ...prev,
                        students: students.length,
                        active: students.filter(s => s.status === 'ACTIVE').length
                    }));
                } catch (error) {
                    console.error('Failed to load class students:', error);
                    console.warn('⚠️ Fallback to mock data based on classData.students count');

                    // Fallback: Create mock students based on count
                    const count = parseInt(classData.students) || 0;
                    const mockStudents = Array.from({ length: count }, (_, i) => ({
                        studentId: i + 1,
                        studentName: `Sinh viên ${i + 1}`,
                        fullName: `Sinh viên ${i + 1}`,
                        status: 'ACTIVE',
                        enrolledAt: new Date().toISOString(),
                    }));

                    setRealStudents(mockStudents);
                } finally {
                    setLoadingStudents(false);
                }
            }
            fetchClassStudents();
        }
    }, [classData?.id]);


    // Fetch assigned courses when opening the modal
    async function handleOpenAssignedCoursesModal() {
        setShowAssignedCoursesModal(true);
        if (classData?.id) {
            try {
                const res = await classCourseService.getClassCourses(parseInt(classData.id));
                console.log("Assigned Courses Response:", res); // Debug log

                let data = [];
                if (res.data?.data && Array.isArray(res.data.data)) {
                    data = res.data.data;
                } else if (res.data && Array.isArray(res.data)) {
                    data = res.data;
                } else if (Array.isArray(res)) {
                    data = res;
                }

                setAssignedCourses(data);
            } catch (error) {
                console.error("Failed to fetch assigned courses", error);
                // Keep previous state or set empty
                if (assignedCourses.length === 0) setAssignedCourses([]);
            }
        }
    }

    async function handleOpenCourseSelectionModal() {
        setShowAssignedCoursesModal(false); // Close the list modal if we want to replace, or stack them.
        // Better UX: Close "Assigned" -> Open "Selection". Or overlay.
        // Let's close "Assigned" for simplicity in this turn.
        setShowCourseSelectionModal(true);
        try {
            const res = await courseService.getCourses();
            console.log("API Courses Response:", res); // Debug log

            let data = [];
            if (res.data?.data?.content && Array.isArray(res.data.data.content)) {
                data = res.data.data.content;
            } else if (res.data?.content && Array.isArray(res.data.content)) {
                data = res.data.content;
            } else if (res.data?.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (res.data && Array.isArray(res.data)) {
                data = res.data;
            } else if (Array.isArray(res)) {
                data = res.data;
            }

            setCoursesList(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    }

    const handleSelectCourse = async (course) => {
        try {
            const res = await classCourseService.assignCourseToClass({
                classId: parseInt(classData.id),
                courseId: parseInt(course.id),
                note: "Assigned from Class Detail"
            });

            // Optimistically update the list with the response data
            // API returns the assignment object: { id, classId, courseId, courseTitle, ... }
            const newAssignment = res.data?.data || res.data;
            if (newAssignment) {
                // Ensure we have a displayable title if the API doesn't return one immediately
                if (!newAssignment.courseTitle) {
                    newAssignment.courseTitle = course.courseName || course.name || course.title;
                }
                setAssignedCourses(prev => [...prev, newAssignment]);
            }

            setShowCourseSelectionModal(false);
            alert(`Đã thêm khóa học: ${course.courseName || course.name || course.title}`);

            // Re-open assigned list to show the new addition
            // We do NOT call handleOpenAssignedCoursesModal() here to avoid the 500 error wiping our local update
            setShowAssignedCoursesModal(true);

        } catch (error) {
            console.error("Failed to assign course", error);
            const errorMsg = error.response?.data?.message || JSON.stringify(error.response?.data) || error.message;
            alert("Lỗi khi thêm khóa học: " + errorMsg);
        }
    };


    const handleAttendanceChange = (studentId, status) => {
        setAttendance((prev) => ({
            ...prev,
            [studentId]: status,
        }));
    };

    const handleSaveAttendance = () => {
        alert("Đã lưu điểm danh thành công!");
        console.log("Attendance data:", attendance);
    };

    const handleTagClick = (type) => {
        const modalType = type === 'students' ? 'enrollment' : type;
        setModalContent({ type: modalType });
        setShowDetailModal(true);
    };

    if (loading) return <div className="p-8">Đang tải...</div>;
    if (!classData) return <div className="p-8">Không tìm thấy dữ liệu lớp học.</div>;

    // Calculate stats
    const stats = {
        total: studentsList.length,
        present: Object.values(attendance).filter((s) => s === "present").length,
        excused: Object.values(attendance).filter((s) => s === "excused").length,
        unexcused: Object.values(attendance).filter((s) => s === "unexcused").length,
    };

    return (
        <div className="cd-container">
            {/* Header */}
            <header className="cd-header">
                <button className="cd-back-btn" onClick={handleBack} title="Quay lại">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div className="cd-title-wrap">
                    <h1 className="cd-class-name">{classData.name}</h1>
                    <div className="cd-info-tags">
                        <span className="cd-info-tag cd-tag-code" onClick={() => handleTagClick('code')} title="Click để xem chi tiết">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="9" y1="9" x2="15" y2="9" />
                                <line x1="9" y1="15" x2="15" y2="15" />
                            </svg>
                            <span>Mã lớp: {classData.code}</span>
                        </span>
                        <span className="cd-info-tag cd-tag-teacher" onClick={() => handleTagClick('teacher')} title="Click để xem thông tin giảng viên">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>Giảng viên: {classData.teacher}</span>
                        </span>
                        <span className="cd-info-tag cd-tag-students" onClick={() => handleTagClick('students')} title="Click để xem danh sách học viên">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span>Sĩ số: {classData.students} HV</span>
                        </span>
                        {classData.schedule && (
                            <span className="cd-info-tag cd-tag-schedule" onClick={() => handleTagClick('schedule')} title="Click để xem lịch học chi tiết">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span>{classData.schedule}</span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="cd-header-actions-group">
                    <button className="cd-header-btn" onClick={() => navigate(`/admin/calendar?classId=${classData.id}`)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Thời khóa biểu
                    </button>
                    <button className="cd-header-btn" onClick={handleOpenAssignedCoursesModal}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        Khóa học
                    </button>
                    <button className="cd-header-btn" onClick={() => navigate(`/admin/roadmap?classId=${classData.id}`)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        Lộ trình
                    </button>
                    <button
                        className={`cd-toggle-attendance-btn ${showAttendance ? 'active' : ''}`}
                        onClick={() => setShowAttendance(!showAttendance)}
                    >
                        {showAttendance ? (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Ẩn điểm danh
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Bắt đầu điểm danh
                            </>
                        )}
                    </button>
                </div>
            </header>

            <div className="cd-content">
                {showAttendance && (
                    <>
                        {/* Stats Bar */}
                        <div className="cd-stats-bar">
                            <div className="cd-stat-card">
                                <div className="cd-stat-label">Tổng sĩ số</div>
                                <div className="cd-stat-value">{stats.total}</div>
                            </div>
                            <div className="cd-stat-card" style={{ borderLeft: "4px solid #22c55e" }}>
                                <div className="cd-stat-label">Có mặt</div>
                                <div className="cd-stat-value" style={{ color: "#16a34a" }}>{stats.present}</div>
                            </div>
                            <div className="cd-stat-card" style={{ borderLeft: "4px solid #eab308" }}>
                                <div className="cd-stat-label">Nghỉ có phép</div>
                                <div className="cd-stat-value" style={{ color: "#ca8a04" }}>{stats.excused}</div>
                            </div>
                            <div className="cd-stat-card" style={{ borderLeft: "4px solid #ef4444" }}>
                                <div className="cd-stat-label">Nghỉ không phép</div>
                                <div className="cd-stat-value" style={{ color: "#dc2626" }}>{stats.unexcused}</div>
                            </div>
                        </div>

                        {/* Attendance Table */}
                        <div className="cd-table-card">
                            <div className="cd-table-header">
                                <div className="cd-table-title">Điểm danh lớp học</div>
                                <div className="cd-header-actions">
                                    <div className="cd-filter-group">
                                        <label className="cd-filter-label">Ngày học:</label>
                                        <input
                                            type="date"
                                            className="cd-date-picker"
                                            value={attendanceDate}
                                            onChange={(e) => setAttendanceDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="cd-filter-group">
                                        <label className="cd-filter-label">Ca học:</label>
                                        <select
                                            className="cd-select"
                                            value={attendanceShift}
                                            onChange={(e) => setAttendanceShift(e.target.value)}
                                        >
                                            <option value="morning">Ca Sáng (8:00 - 11:30)</option>
                                            <option value="afternoon">Ca Chiều (13:30 - 17:00)</option>
                                            <option value="evening">Ca Tối (18:30 - 21:30)</option>
                                        </select>
                                    </div>

                                    <button
                                        className="cm-primary-button cd-save-btn"
                                        onClick={handleSaveAttendance}
                                        style={{
                                            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
                                            border: "none",
                                            padding: "10px 24px",
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px"
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                        LƯU ĐIỂM DANH
                                    </button>
                                </div>
                            </div>
                            <table className="cd-table">
                                <thead>
                                    <tr>
                                        <th className="cd-th" style={{ width: "60px" }}>STT</th>
                                        <th className="cd-th">Học viên</th>
                                        <th className="cd-th">Trạng thái điểm danh</th>
                                        <th className="cd-th">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsList.map((student, index) => (
                                        <tr key={student.id}>
                                            <td className="cd-td" style={{ textAlign: "center", color: "#6b7280" }}>
                                                {index + 1}
                                            </td>
                                            <td className="cd-td">
                                                <div className="cd-student-info">
                                                    <div className="cd-avatar">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="cd-student-name">{student.name}</div>
                                                        <div className="cd-student-id">{student.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="cd-td">
                                                <div className="cd-attendance-options">
                                                    <AttendanceButton
                                                        type="present"
                                                        label="Có mặt"
                                                        active={attendance[student.id] === 'present'}
                                                        onClick={() => handleAttendanceChange(student.id, 'present')}
                                                    />
                                                    <AttendanceButton
                                                        type="excused"
                                                        label="Nghỉ có phép"
                                                        active={attendance[student.id] === 'excused'}
                                                        onClick={() => handleAttendanceChange(student.id, 'excused')}
                                                    />
                                                    <AttendanceButton
                                                        type="unexcused"
                                                        label="Nghỉ không phép"
                                                        active={attendance[student.id] === 'unexcused'}
                                                        onClick={() => handleAttendanceChange(student.id, 'unexcused')}
                                                    />
                                                </div>
                                            </td>
                                            <td className="cd-td">
                                                <input
                                                    type="text"
                                                    placeholder="Ghi chú..."
                                                    style={{
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "6px",
                                                        padding: "6px 10px",
                                                        width: "100%",
                                                        fontSize: "13px"
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Detail Info Modal */}
            <ClassDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                type={modalContent?.type}
                data={{
                    ...classData,
                    onAssignTeachers: () => {
                        setAssigningClass(classData);
                        setShowDetailModal(false);
                    },
                    onAddStudents: () => {
                        setAddingStudents(classData);
                        setShowDetailModal(false);
                    }
                }}
            />

            {/* Assigned Courses Modal */}
            {showAssignedCoursesModal && (
                <AssignedCoursesModal
                    isOpen={showAssignedCoursesModal}
                    onClose={() => setShowAssignedCoursesModal(false)}
                    courses={assignedCourses}
                    onAddCourse={handleOpenCourseSelectionModal}
                />
            )}

            {/* Course Selection Modal */}
            {showCourseSelectionModal && (
                <CourseSelectionModal
                    isOpen={showCourseSelectionModal}
                    onClose={() => setShowCourseSelectionModal(false)}
                    courses={coursesList}
                    onSelect={handleSelectCourse}
                />
            )}

            {/* Add Students Modal */}
            {addingStudents && (
                <AddStudentsModal
                    classData={addingStudents}
                    onClose={() => setAddingStudents(null)}
                    onSubmit={async (selectedStudentIds) => {
                        try {
                            // Add all selected students to the class
                            await Promise.all(
                                selectedStudentIds.map((studentId) =>
                                    classStudentService.addStudentToClass({
                                        classId: addingStudents.id,
                                        studentId: studentId,
                                        status: "ACTIVE",
                                        note: `Added from class detail`
                                    })
                                )
                            );
                            alert("Thêm sinh viên thành công!");
                            setAddingStudents(null);
                        } catch (error) {
                            console.error("Failed to add students:", error);
                            alert("Lỗi khi thêm sinh viên: " + (error.response?.data?.message || error.message));
                        }
                    }}
                />
            )}

            {/* Assign Teachers Modal */}
            {assigningClass && (
                <AssignTeachersModal
                    classData={assigningClass}
                    onClose={() => setAssigningClass(null)}
                    onSubmit={async (selectedTeacherIds) => {
                        try {
                            // Assign all selected teachers to the class
                            await Promise.all(
                                selectedTeacherIds.map((teacherId) =>
                                    classTeacherService.assignTeacherToClass({
                                        classId: assigningClass.id,
                                        teacherId: teacherId,
                                        role: "INSTRUCTOR",
                                        note: `Assigned from class detail`
                                    })
                                )
                            );
                            alert("Phân công giảng viên thành công!");
                            setAssigningClass(null);
                        } catch (error) {
                            console.error("Failed to assign teachers:", error);
                            alert("Lỗi khi phân công giảng viên: " + (error.response?.data?.message || error.message));
                        }
                    }}
                />
            )}
        </div>
    );
}

function AttendanceButton({ type, label, active, onClick }) {
    return (
        <button
            className={`cd-att-btn ${type} ${active ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className={`cd-dot ${type}`}></div>
            {label}
        </button>
    );
}

function AssignedCoursesModal({ isOpen, onClose, courses, onAddCourse }) {
    if (!isOpen) return null;

    const modalStyles = {
        backdrop: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        container: {
            background: "#fff",
            borderRadius: "12px",
            width: "500px",
            maxWidth: "90%",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        },
        header: {
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        title: {
            fontSize: "18px",
            fontWeight: "600",
            color: "#111827",
            margin: 0,
        },
        closeBtn: {
            background: "transparent",
            border: "none",
            fontSize: "24px",
            lineHeight: 1,
            cursor: "pointer",
            color: "#6b7280",
        },
        body: {
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
        },
        list: {
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
        },
        item: {
            padding: "12px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f9fafb"
        },
        courseName: {
            fontWeight: "600",
            color: "#111827",
        },
        courseCode: {
            fontSize: "13px",
            color: "#6b7280",
            background: "#f3f4f6",
            padding: "2px 6px",
            borderRadius: "4px",
        },
        addButton: {
            width: "100%",
            padding: "12px",
            background: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
        }
    };

    return (
        <div style={modalStyles.backdrop} onClick={onClose}>
            <div style={modalStyles.container} onClick={e => e.stopPropagation()}>
                <div style={modalStyles.header}>
                    <h3 style={modalStyles.title}>Khóa học của lớp</h3>
                    <button style={modalStyles.closeBtn} onClick={onClose}>×</button>
                </div>
                <div style={modalStyles.body}>
                    {courses.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#6b7280", padding: "10px" }}>
                            Lớp học này chưa có khóa học nào.
                        </div>
                    ) : (
                        <ul style={modalStyles.list}>
                            {courses.map((course, idx) => (
                                <li key={idx} style={modalStyles.item}>
                                    <span style={modalStyles.courseName}>{course.courseTitle || course.courseName || course.name || course.title}</span>
                                    {course.totalSessions && course.totalSessions !== "N/A" && (
                                        <span style={modalStyles.courseCode}>{course.totalSessions} buổi</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    <button style={modalStyles.addButton} onClick={onAddCourse}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Chọn khóa học
                    </button>
                </div>
            </div>
        </div>
    );
}

function CourseSelectionModal({ isOpen, onClose, courses, onSelect }) {
    if (!isOpen) return null;

    const modalStyles = {
        backdrop: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        container: {
            background: "#fff",
            borderRadius: "12px",
            width: "500px",
            maxWidth: "90%",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        },
        header: {
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        title: {
            fontSize: "18px",
            fontWeight: "600",
            color: "#111827",
            margin: 0,
        },
        closeBtn: {
            background: "transparent",
            border: "none",
            fontSize: "24px",
            lineHeight: 1,
            cursor: "pointer",
            color: "#6b7280",
        },
        body: {
            padding: "20px",
            overflowY: "auto",
        },
        list: {
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
        },
        item: {
            padding: "12px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        itemHover: {
            borderColor: "#ea580c",
            background: "#fff7ed",
        },
        courseName: {
            fontWeight: "600",
            color: "#111827",
        },
        courseCode: {
            fontSize: "13px",
            color: "#6b7280",
            background: "#f3f4f6",
            padding: "2px 6px",
            borderRadius: "4px",
        }
    };

    return (
        <div style={modalStyles.backdrop} onClick={onClose}>
            <div style={modalStyles.container} onClick={e => e.stopPropagation()}>
                <div style={modalStyles.header}>
                    <h3 style={modalStyles.title}>Chọn khóa học</h3>
                    <button style={modalStyles.closeBtn} onClick={onClose}>×</button>
                </div>
                <div style={modalStyles.body}>
                    {courses.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
                            Chưa có khóa học nào.
                        </div>
                    ) : (
                        <ul style={modalStyles.list}>
                            {courses.map(course => (
                                <li
                                    key={course.id}
                                    style={modalStyles.item}
                                    onClick={() => onSelect(course)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "#ea580c";
                                        e.currentTarget.style.background = "#fff7ed";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                        e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    <span style={modalStyles.courseName}>{course.courseName || course.name || course.title}</span>
                                    <span style={modalStyles.courseCode}>{course.totalSessions || 0} buổi</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

function AssignTeachersModal({ classData, onClose, onSubmit }) {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [existingTeachers, setExistingTeachers] = useState([]);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);

                // Load all teachers
                const res = await userService.getAllUsers({ role: "ROLE_TEACHER", size: 100 });
                let data = [];
                if (res.data.data && res.data.data.content) {
                    data = res.data.data.content;
                } else if (res.data.content) {
                    data = res.data.content;
                } else if (res.data.data && Array.isArray(res.data.data)) {
                    data = res.data.data;
                } else if (Array.isArray(res.data)) {
                    data = res.data;
                }
                const validTeachers = data.filter(u => u.role === "ROLE_TEACHER");
                setTeachers(validTeachers);

                // Load existing teachers for this class
                try {
                    const tRes = await classTeacherService.getClassTeachers(classData.id);
                    let existing = [];
                    if (tRes.data?.data && Array.isArray(tRes.data.data)) {
                        existing = tRes.data.data;
                    } else if (Array.isArray(tRes.data)) {
                        existing = tRes.data;
                    }
                    const existingIds = existing.map(t => t.teacherId);
                    setExistingTeachers(existingIds);
                    setSelectedTeachers(existingIds);
                } catch (e) {
                    console.warn("Could not load existing teachers:", e);
                }
            } catch (error) {
                console.error("Failed to load teachers:", error);
                alert("Lỗi khi tải danh sách giảng viên!");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [classData.id]);

    const handleToggle = (teacherId) => {
        setSelectedTeachers(prev => {
            if (prev.includes(teacherId)) {
                return prev.filter(id => id !== teacherId);
            } else {
                return [...prev, teacherId];
            }
        });
    };

    const handleSubmit = () => {
        onSubmit(selectedTeachers);
    };

    const modalStyles = {
        backdrop: {
            position: "fixed",
            inset: 0,
            background: "rgba(17,24,39,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
        },
        container: {
            width: "100%",
            maxWidth: 700,
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            boxShadow: "0 24px 48px rgba(17,24,39,0.18)",
            overflow: "hidden",
            maxHeight: "90vh",
            overflowY: "auto",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid #f3f4f6",
        },
        title: {
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
        },
        body: {
            padding: 16,
            display: "grid",
            rowGap: 12,
        },
        footer: {
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: 16,
            borderTop: "1px solid #f3f4f6",
        },
        ghostBtn: {
            background: "transparent",
            border: "1px solid #e5e7eb",
            color: "#111827",
            padding: "10px 16px",
            borderRadius: 10,
            fontWeight: 600,
            cursor: "pointer",
        },
        iconButton: {
            background: "transparent",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: "pointer",
            padding: 6,
            color: "#6b7280",
            fontSize: 24,
        },
        primaryButton: {
            background: "#f97316",
            border: "none",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(249,115,22,0.25)",
        },
    };

    return (
        <div style={modalStyles.backdrop} role="dialog" aria-modal="true">
            <div style={modalStyles.container}>
                <div style={modalStyles.header}>
                    <h3 style={modalStyles.title}>
                        🧑‍🏫 Phân công giảng viên - {classData.name}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={modalStyles.iconButton}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>
                <div style={modalStyles.body}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                            Đang tải danh sách giảng viên...
                        </div>
                    ) : teachers.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                            Không có giảng viên nào trong hệ thống
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 16, color: "#6b7280", fontSize: 14 }}>
                                Chọn giảng viên để phân công cho lớp học này. Bạn có thể chọn nhiều giảng viên.
                            </div>
                            <div style={{
                                maxHeight: 400,
                                overflow: "auto",
                                border: "1px solid #e5e7eb",
                                borderRadius: 10,
                                padding: 12,
                            }}>
                                {teachers.map((teacher) => (
                                    <label
                                        key={teacher.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "12px 10px",
                                            borderBottom: "1px solid #f3f4f6",
                                            cursor: "pointer",
                                            transition: "background 0.2s",
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTeachers.includes(teacher.id)}
                                            onChange={() => handleToggle(teacher.id)}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                marginRight: 12,
                                                cursor: "pointer",
                                                accentColor: "#f97316",
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
                                                {teacher.fullName}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                                                {teacher.email}
                                            </div>
                                        </div>
                                        {existingTeachers.includes(teacher.id) && (
                                            <span style={{
                                                fontSize: 11,
                                                padding: "2px 8px",
                                                background: "#dbeafe",
                                                color: "#1e40af",
                                                borderRadius: 12,
                                                fontWeight: 600,
                                            }}>
                                                Đã phân công
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                            <div style={{
                                marginTop: 12,
                                padding: 10,
                                background: "#f0fdf4",
                                borderRadius: 8,
                                border: "1px solid #bbf7d0",
                                color: "#166534",
                                fontSize: 13,
                            }}>
                                ✓ Đã chọn: <strong>{selectedTeachers.length}</strong> giảng viên
                            </div>
                        </>
                    )}
                </div>
                <div style={modalStyles.footer}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={modalStyles.ghostBtn}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={{
                            ...modalStyles.primaryButton,
                            background: "#059669",
                        }}
                        disabled={selectedTeachers.length === 0}
                    >
                        Phân công ({selectedTeachers.length})
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddStudentsModal({ classData, onClose, onSubmit }) {
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [existingStudents, setExistingStudents] = useState([]);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);

                // Load all students (users with role ROLE_USER)
                const res = await userService.getAllUsers({ role: "ROLE_USER", size: 100 });
                console.log('📥 Students API Response:', res);

                let data = [];
                if (res.data.data && res.data.data.content) {
                    data = res.data.data.content;
                } else if (res.data.content) {
                    data = res.data.content;
                } else if (res.data.data && Array.isArray(res.data.data)) {
                    data = res.data.data;
                } else if (Array.isArray(res.data)) {
                    data = res.data;
                }

                console.log('📊 All users data:', data, 'Length:', data.length);

                const validStudents = data.filter(u => u.role === "ROLE_USER");
                console.log('✅ Filtered students (ROLE_USER):', validStudents, 'Count:', validStudents.length);

                setStudents(validStudents);

                // Load existing students for this class
                try {
                    const sRes = await classStudentService.getClassStudents(classData.id);
                    let existing = [];
                    if (sRes.data?.data && Array.isArray(sRes.data.data)) {
                        existing = sRes.data.data;
                    } else if (Array.isArray(sRes.data)) {
                        existing = sRes.data;
                    }
                    const existingIds = existing.map(s => s.studentId);
                    setExistingStudents(existingIds);
                    // Don't auto-select existing students for adding new ones
                } catch (e) {
                    console.warn("Could not load existing students:", e);
                }
            } catch (error) {
                console.error("Failed to load students:", error);
                alert("Lỗi khi tải danh sách sinh viên!");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [classData.id]);

    const handleToggle = (studentId) => {
        setSelectedStudents(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const handleSubmit = () => {
        onSubmit(selectedStudents);
    };

    const modalStyles = {
        backdrop: {
            position: "fixed",
            inset: 0,
            background: "rgba(17,24,39,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
        },
        container: {
            width: "100%",
            maxWidth: 700,
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            boxShadow: "0 24px 48px rgba(17,24,39,0.18)",
            overflow: "hidden",
            maxHeight: "90vh",
            overflowY: "auto",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid #f3f4f6",
        },
        title: {
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
        },
        body: {
            padding: 16,
            display: "grid",
            rowGap: 12,
        },
        footer: {
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: 16,
            borderTop: "1px solid #f3f4f6",
        },
        ghostBtn: {
            background: "transparent",
            border: "1px solid #e5e7eb",
            color: "#111827",
            padding: "10px 16px",
            borderRadius: 10,
            fontWeight: 600,
            cursor: "pointer",
        },
        iconButton: {
            background: "transparent",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            cursor: "pointer",
            padding: 6,
            color: "#6b7280",
            fontSize: 24,
        },
        primaryButton: {
            background: "#f97316",
            border: "none",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(249,115,22,0.25)",
        },
    };

    return (
        <div style={modalStyles.backdrop} role="dialog" aria-modal="true">
            <div style={modalStyles.container}>
                <div style={modalStyles.header}>
                    <h3 style={modalStyles.title}>
                        👨‍🎓 Thêm sinh viên - {classData.name}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={modalStyles.iconButton}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>
                <div style={modalStyles.body}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                            Đang tải danh sách sinh viên...
                        </div>
                    ) : students.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                            Không có sinh viên nào trong hệ thống
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: 16, color: "#6b7280", fontSize: 14 }}>
                                Chọn sinh viên để thêm vào lớp học này. Bạn có thể chọn nhiều sinh viên.
                            </div>
                            <div style={{
                                maxHeight: 400,
                                overflow: "auto",
                                border: "1px solid #e5e7eb",
                                borderRadius: 10,
                                padding: 12,
                            }}>
                                {students.map((student) => (
                                    <label
                                        key={student.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "12px 10px",
                                            borderBottom: "1px solid #f3f4f6",
                                            cursor: existingStudents.includes(student.id) ? "not-allowed" : "pointer",
                                            transition: "background 0.2s",
                                            opacity: existingStudents.includes(student.id) ? 0.6 : 1,
                                        }}
                                        onMouseEnter={(e) => !existingStudents.includes(student.id) && (e.currentTarget.style.background = "#f9fafb")}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={() => handleToggle(student.id)}
                                            disabled={existingStudents.includes(student.id)}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                marginRight: 12,
                                                cursor: existingStudents.includes(student.id) ? "not-allowed" : "pointer",
                                                accentColor: "#0ea5e9",
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
                                                {student.fullName}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                                                {student.email}
                                            </div>
                                        </div>
                                        {existingStudents.includes(student.id) && (
                                            <span style={{
                                                fontSize: 11,
                                                padding: "2px 8px",
                                                background: "#dbeafe",
                                                color: "#1e40af",
                                                borderRadius: 12,
                                                fontWeight: 600,
                                            }}>
                                                Đã trong lớp
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                            <div style={{
                                marginTop: 12,
                                padding: 10,
                                background: "#eff6ff",
                                borderRadius: 8,
                                border: "1px solid #bfdbfe",
                                color: "#1e40af",
                                fontSize: 13,
                            }}>
                                ✓ Đã chọn: <strong>{selectedStudents.length}</strong> sinh viên
                            </div>
                        </>
                    )}
                </div>
                <div style={modalStyles.footer}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={modalStyles.ghostBtn}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={{
                            ...modalStyles.primaryButton,
                            background: "#0ea5e9",
                        }}
                        disabled={selectedStudents.length === 0}
                    >
                        Thêm sinh viên ({selectedStudents.length})
                    </button>
                </div>
            </div>
        </div>
    );
}
