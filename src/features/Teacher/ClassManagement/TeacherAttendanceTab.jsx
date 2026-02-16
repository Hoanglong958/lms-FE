import React, { useState, useEffect, useMemo } from "react";
import { attendanceService } from "@utils/attendanceService";
import { periodService } from "@utils/periodService";
import "../../Admin/ClassManagement/ClassDetail.css"; // Reuse Admin styles

// Helper to format time objects or strings
const timeObjToString = (t) => {
    if (!t) return "00:00:00";
    if (typeof t === 'string') {
        const parts = t.split(":");
        if (parts.length === 2) return `${t}:00`;
        return t;
    }
    if (typeof t === 'object') {
        const h = String(t.hour || 0).padStart(2, '0');
        const m = String(t.minute || 0).padStart(2, '0');
        const s = String(t.second || 0).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }
    return "00:00:00";
};

export default function TeacherAttendanceTab({ classId, students }) {
    // State
    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [periods, setPeriods] = useState([]);
    const [attendanceShift, setAttendanceShift] = useState("");
    const [sessions, setSessions] = useState([]); // All session history
    const [attendance, setAttendance] = useState({}); // Map: studentId -> status
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

    // Map students prop to consistent format
    const studentsList = useMemo(() => {
        if (!students) return [];
        return students.map((student, index) => ({
            id: student.studentId || student.id || student.userId || index + 1,
            name: student.studentName || student.fullName || student.name || `Học viên ${index + 1}`,
            code: student.studentCode || `HV${String(index + 1).padStart(3, "0")}`,
            avatar: null,
            status: student.status,
        }));
    }, [students]);

    // 1. Initialize attendance with "present" for all students when list changes
    useEffect(() => {
        const initialAttendance = {};
        studentsList.forEach(student => {
            initialAttendance[student.id] = 'present';
        });
        setAttendance(initialAttendance);
    }, [studentsList]);

    // 2. Load Periods (Shifts)
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const res = await periodService.getAll();
                const data = res.data ?? [];
                // Handle various response structures
                const loaded = Array.isArray(data) ? data : data?.data ?? data?.content ?? [];
                setPeriods(loaded);
                if (loaded.length > 0) {
                    setAttendanceShift(String(loaded[0].id));
                }
            } catch (err) {
                console.error("Load periods failed", err);
            }
        };
        fetchPeriods();
    }, []);

    // 3. Load Sessions History
    const loadSessions = async () => {
        if (!classId) return;
        try {
            const res = await attendanceService.listSessionsByClass(classId);
            setSessions(res.data || []);
        } catch (error) {
            console.error("Failed to load sessions:", error);
        }
    };

    useEffect(() => {
        if (classId) loadSessions();
    }, [classId]);

    // 4. Load Attendance Data (Sync Logic)
    const loadAttendanceData = async () => {
        if (!classId || !attendanceDate || !attendanceShift || periods.length === 0) return;

        try {
            setIsLoadingAttendance(true);

            // A. Fetch existing records for this class and date
            const res = await attendanceService.getAttendanceByClassAndDate(classId, attendanceDate);
            const records = res.data || [];

            // B. Find the selected period details
            const selectedPeriod = periods.find(p => String(p.id) === String(attendanceShift));
            if (!selectedPeriod) return;

            const startTimeStr = timeObjToString(selectedPeriod.startTime);
            const endTimeStr = timeObjToString(selectedPeriod.endTime);

            // C. active session matching Date + Shift
            const existingSession = sessions.find(s =>
                s.sessionDate === attendanceDate &&
                s.startTime === startTimeStr &&
                s.endTime === endTimeStr
            );

            if (existingSession && records.length > 0) {
                // If session exists, map existing records
                const newAttendance = {};
                // Pre-fill with present for robustness
                studentsList.forEach(s => newAttendance[s.id] = 'present');

                records.forEach(r => {
                    const status = r.status.toLowerCase();
                    newAttendance[r.studentId] = status === 'present' ? 'present' : status === 'excused' ? 'excused' : 'absent';
                });
                setAttendance(newAttendance);
            } else {
                // If no session, reset to default (all present)
                const initialAttendance = {};
                studentsList.forEach((student) => {
                    initialAttendance[student.id] = "present";
                });
                setAttendance(initialAttendance);
            }
        } catch (error) {
            console.error("Failed to load attendance data:", error);
        } finally {
            setIsLoadingAttendance(false);
        }
    };

    // Trigger load when dependencies change
    useEffect(() => {
        if (classId && attendanceDate && attendanceShift && periods.length > 0) {
            loadAttendanceData();
        }
    }, [classId, attendanceDate, attendanceShift, periods, sessions]);


    // Handlers
    const handleAttendanceChange = (studentId, status) => {
        setAttendance((prev) => ({
            ...prev,
            [studentId]: status,
        }));
    };

    const handleSaveAttendance = async () => {
        if (!classId) {
            alert("Không tìm thấy thông tin lớp học!");
            return;
        }

        try {
            setIsLoadingAttendance(true); // Reuse loading state for saving indication

            // 1. Validate schedule
            const validationRes = await attendanceService.validateScheduleDate(classId, attendanceDate);
            if (!validationRes.data?.hasSchedule) {
                alert(`Ngày ${attendanceDate} không có lịch học trong thời khóa biểu.`);
                // We typically allow continuing or return, depending on strictness. 
                // Admin side returned. Let's return to match.
                setIsLoadingAttendance(false);
                return;
            }

            // 2. Format times
            const selectedPeriod = periods.find(p => String(p.id) === String(attendanceShift));
            if (!selectedPeriod) {
                alert("Vui lòng chọn ca học!");
                setIsLoadingAttendance(false);
                return;
            }
            const startTime = timeObjToString(selectedPeriod.startTime);
            const endTime = timeObjToString(selectedPeriod.endTime);

            // 3. Find or Create Session
            const existingSession = sessions.find(s =>
                s.sessionDate === attendanceDate &&
                s.startTime === startTime &&
                s.endTime === endTime
            );

            let sessionId;
            if (existingSession) {
                sessionId = existingSession.attendanceSessionId || existingSession.id;
            } else {
                const createRes = await attendanceService.createSession({
                    classId: parseInt(classId),
                    title: `Điểm danh ${attendanceDate} - ${selectedPeriod.name}`,
                    sessionDate: attendanceDate,
                    startTime: startTime,
                    endTime: endTime,
                    status: "UPCOMING"
                });
                const session = createRes.data?.data || createRes.data || createRes;
                sessionId = session.attendanceSessionId || session.id;
            }

            // 4. Prepare Records
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                attendanceSessionId: sessionId,
                studentId: parseInt(studentId),
                status: status === 'present' ? 'PRESENT' : status === 'excused' ? 'EXCUSED' : 'ABSENT',
                note: ""
            }));

            // 5. Save Bulk
            await attendanceService.markAttendanceBulk(sessionId, records);

            alert("Đã lưu điểm danh thành công!");
            await loadSessions(); // Refresh history
            // loadAttendanceData will re-run automatically due to sessions change
        } catch (error) {
            console.error("Failed to save attendance:", error);
            if (error.response?.status === 400 && error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                const msg = error.response?.data?.data || error.message || "Unknown error";
                alert("Lỗi khi lưu điểm danh: " + msg);
            }
        } finally {
            setIsLoadingAttendance(false);
        }
    };

    // calculate stats
    const stats = {
        total: studentsList.length,
        present: Object.values(attendance).filter((s) => s === "present").length,
        excused: Object.values(attendance).filter((s) => s === "excused").length,
        unexcused: Object.values(attendance).filter((s) => s === "absent").length, // 'absent' maps to unexcused usage in code
    };

    return (
        <div className="cd-content" style={{ padding: 0, marginTop: 20 }}>
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

            {/* Attendance Table Card */}
            <div className="cd-table-card" style={{ position: 'relative' }}>
                {isLoadingAttendance && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255, 255, 255, 0.7)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px'
                    }}>
                        <div className="cd-loading-spinner" style={{
                            width: '32px',
                            height: '32px',
                            border: '3px solid #f3f3f3',
                            borderTop: '3px solid #3498db',
                            borderRadius: '50%',
                            animation: 'cd-spin 1s linear infinite'
                        }}></div>
                        <style>{`
                            @keyframes cd-spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )}

                <div className="cd-table-header">
                    <div className="cd-table-title">Danh sách điểm danh</div>
                    <div className="cd-header-actions">
                        <div className="cd-filter-group">
                            <label className="cd-filter-label">Ngày:</label>
                            <input
                                type="date"
                                className="cd-date-picker"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                            />
                        </div>

                        <div className="cd-filter-group">
                            <label className="cd-filter-label">Ca:</label>
                            <select
                                className="cd-select"
                                value={attendanceShift}
                                onChange={(e) => setAttendanceShift(e.target.value)}
                            >
                                {periods.length === 0 && <option value="">Đang tải...</option>}
                                {periods.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({timeObjToString(p.startTime)} - {timeObjToString(p.endTime)})
                                    </option>
                                ))}
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
                                gap: "8px",
                                color: "white",
                                borderRadius: "8px",
                                cursor: "pointer"
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
                                            type="unexcused" // maps to absent/unexcused
                                            label="Nghỉ không phép"
                                            active={attendance[student.id] === 'absent'}
                                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                                        />
                                    </div>
                                </td>
                                <td className="cd-td">
                                    <input
                                        type="text"
                                        className="att-input" // Reuse simple input style or cd-input if exists
                                        placeholder="Note..."
                                        style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                                    />
                                </td>
                            </tr>
                        ))}
                        {studentsList.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                    Không có học viên trong lớp này.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Attendance Button Component (Same as ClassDetail)
function AttendanceButton({ type, label, active, onClick }) {
    const iconColors = {
        present: "#16a34a",
        excused: "#ca8a04",
        unexcused: "#dc2626",
    };

    const bgColors = {
        present: "#dcfce7",
        excused: "#fef9c3",
        unexcused: "#fee2e2",
    };

    const borderColors = {
        present: "#86efac",
        excused: "#fde047",
        unexcused: "#fca5a5",
    };

    return (
        <button
            className={`cd-att-btn ${type} ${active ? 'active' : ''}`}
            onClick={onClick}
            title={label}
            style={{
                background: active ? bgColors[type] : "white",
                borderColor: active ? borderColors[type] : "#e5e7eb",
                color: active ? iconColors[type] : "#374151"
            }}
        >
            <div
                className={`cd-dot ${type}`}
                style={{
                    backgroundColor: iconColors[type],
                }}
            />
            {label}
        </button>
    );
}
