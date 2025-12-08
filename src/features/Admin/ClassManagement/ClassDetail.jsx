import React, { useState, useMemo, useEffect } from "react";
import "./ClassDetail.css";
import ClassDetailModal from "./ClassDetailModal";

export default function ClassDetail({ classData, onBack }) {
    // Debug: Log classData to verify students count
    console.log("ClassDetail received classData:", classData);
    console.log("Students count:", classData.students);

    // Generate mock students based on classData.students
    const studentsList = useMemo(() => {
        const count = parseInt(classData.students) || 0;
        console.log("Generating", count, "students");
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `Học viên ${i + 1}`,
            code: `HV${String(i + 1).padStart(3, "0")}`,
            avatar: null,
        }));
    }, [classData.students]);

    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [attendanceShift, setAttendanceShift] = useState("morning");


    const [showAttendance, setShowAttendance] = useState(true);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    // State to store attendance status: { studentId: 'present' | 'excused' | 'unexcused' }
    const [attendance, setAttendance] = useState(() => {
        const initial = {};
        const count = parseInt(classData.students) || 0;
        // Initialize all as present
        for (let i = 0; i < count; i++) {
            initial[i + 1] = "present";
        }
        return initial;
    });

    // Reset attendance when class changes
    useEffect(() => {
        const initial = {};
        const count = parseInt(classData.students) || 0;
        for (let i = 0; i < count; i++) {
            initial[i + 1] = "present";
        }
        setAttendance(initial);
    }, [classData.id, classData.students]);

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
        // Map type to modal type
        const modalType = type === 'students' ? 'enrollment' : type;
        setModalContent({ type: modalType });
        setShowDetailModal(true);
    };

    // Calculate stats
    const stats = useMemo(() => {
        const total = studentsList.length;
        const present = Object.values(attendance).filter((s) => s === "present").length;
        const excused = Object.values(attendance).filter((s) => s === "excused").length;
        const unexcused = Object.values(attendance).filter((s) => s === "unexcused").length;
        return { total, present, excused, unexcused };
    }, [attendance, studentsList]);

    return (
        <div className="cd-container">
            {/* Header */}
            <header className="cd-header">
                <button className="cd-back-btn" onClick={onBack} title="Quay lại">
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
                <div>
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
                data={classData}
            />
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
