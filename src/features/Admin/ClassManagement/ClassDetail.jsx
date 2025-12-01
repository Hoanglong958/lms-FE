import React, { useState, useMemo } from "react";
import "./ClassDetail.css";

export default function ClassDetail({ classData, onBack }) {
    // Generate mock students based on classData.students
    const studentsList = useMemo(() => {
        const count = parseInt(classData.students) || 0;
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

    // State to store attendance status: { studentId: 'present' | 'absent' | 'late' }
    const [attendance, setAttendance] = useState(() => {
        const initial = {};
        const count = parseInt(classData.students) || 0;
        // Initialize all as present
        for (let i = 0; i < count; i++) {
            initial[i + 1] = "present";
        }
        return initial;
    });

    const handleAttendanceChange = (studentId, status) => {
        setAttendance((prev) => ({
            ...prev,
            [studentId]: status,
        }));
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
                    <h1 className="cd-class-name">
                        {classData.name}
                        <span className="cd-class-code">{classData.code}</span>
                    </h1>
                    <div className="cd-subtitle">
                        Giảng viên: {classData.teacher} • {classData.schedule || "Chưa có lịch"}
                    </div>
                </div>
                <div>
                    <button className="cm-primary-button">Lưu điểm danh</button>
                </div>
            </header>

            <div className="cd-content">
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
                        <input
                            type="date"
                            className="cd-date-picker"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                        />
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
            </div>
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
