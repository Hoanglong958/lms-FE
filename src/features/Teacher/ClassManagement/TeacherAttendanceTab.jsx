import React, { useState, useEffect, useMemo, useCallback } from "react";
import { attendanceService } from "@utils/attendanceService";
import { periodService } from "@utils/periodService";
import "../../Admin/ClassManagement/ClassDetail.css";

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

const MONTH_NAMES_VN = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];
const DOW_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// ─────────────────────── Mini Calendar ───────────────────────
function AttendanceCalendar({ selectedDate, onSelectDate, scheduledDates, onMonthChange }) {
    const today = new Date();
    const initDate = selectedDate ? new Date(selectedDate + "T00:00:00") : today;
    const [viewYear, setViewYear] = useState(initDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initDate.getMonth()); // 0-indexed

    // When month/year view changes, notify parent
    useEffect(() => {
        onMonthChange(viewYear, viewMonth + 1); // backend uses 1-indexed month
    }, [viewYear, viewMonth]);

    const scheduledSet = useMemo(() => new Set(scheduledDates || []), [scheduledDates]);

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const formatDateStr = (d) => {
        const mm = String(viewMonth + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        return `${viewYear}-${mm}-${dd}`;
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
        else setViewMonth(m => m + 1);
    };

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <div style={styles.calendarWrapper}>
            {/* Header */}
            <div style={styles.calHeader}>
                <button style={styles.navBtn} onClick={prevMonth}>‹</button>
                <span style={styles.calTitle}>{MONTH_NAMES_VN[viewMonth]} {viewYear}</span>
                <button style={styles.navBtn} onClick={nextMonth}>›</button>
            </div>

            {/* Day-of-week labels */}
            <div style={styles.calGrid}>
                {DOW_LABELS.map(d => (
                    <div key={d} style={styles.dowLabel}>{d}</div>
                ))}

                {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />;
                    const dateStr = formatDateStr(day);
                    const isScheduled = scheduledSet.has(dateStr);
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;

                    let cellStyle = { ...styles.dayCell };
                    if (isSelected) cellStyle = { ...cellStyle, ...styles.daySelected };
                    else if (isScheduled) cellStyle = { ...cellStyle, ...styles.dayScheduled };
                    else if (isToday) cellStyle = { ...cellStyle, ...styles.dayToday };

                    return (
                        <div
                            key={dateStr}
                            style={cellStyle}
                            onClick={() => onSelectDate(dateStr)}
                            title={isScheduled ? "Có lịch học" : ""}
                        >
                            {day}
                            {isScheduled && !isSelected && (
                                <div style={styles.dot} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={styles.legend}>
                <span style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, background: '#f97316' }} /> Ngày học
                </span>
                <span style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, background: '#3b82f6' }} /> Đã chọn
                </span>
            </div>
        </div>
    );
}

const styles = {
    calendarWrapper: {
        background: 'white',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        padding: '16px',
        minWidth: 280,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    calHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    calTitle: {
        fontWeight: 700,
        fontSize: 15,
        color: '#111827',
    },
    navBtn: {
        background: 'none',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        cursor: 'pointer',
        padding: '4px 10px',
        fontSize: 16,
        color: '#374151',
        lineHeight: 1,
    },
    calGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2,
    },
    dowLabel: {
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 600,
        color: '#9ca3af',
        padding: '4px 0',
    },
    dayCell: {
        position: 'relative',
        textAlign: 'center',
        padding: '6px 0',
        fontSize: 13,
        borderRadius: 6,
        cursor: 'pointer',
        color: '#374151',
        userSelect: 'none',
        transition: 'background 0.15s',
    },
    dayScheduled: {
        background: '#fff7ed',
        color: '#f97316',
        fontWeight: 700,
        border: '1.5px solid #fed7aa',
    },
    daySelected: {
        background: '#3b82f6',
        color: 'white',
        fontWeight: 700,
        border: 'none',
        boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
    },
    dayToday: {
        border: '1.5px solid #cbd5e1',
        color: '#1d4ed8',
        fontWeight: 600,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: '#f97316',
        margin: '2px auto 0',
    },
    legend: {
        display: 'flex',
        gap: 16,
        marginTop: 12,
        paddingTop: 10,
        borderTop: '1px solid #f3f4f6',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 11,
        color: '#6b7280',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        display: 'inline-block',
    },
};


// ─────────────────────── Main Component ───────────────────────
export default function TeacherAttendanceTab({ classId, students }) {
    const [attendanceDate, setAttendanceDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [periods, setPeriods] = useState([]);
    const [attendanceShift, setAttendanceShift] = useState("");
    const [sessions, setSessions] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
    const [scheduledDates, setScheduledDates] = useState([]);

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

    // 1. Initialize attendance
    useEffect(() => {
        const initialAttendance = {};
        studentsList.forEach(student => { initialAttendance[student.id] = 'present'; });
        setAttendance(initialAttendance);
    }, [studentsList]);

    // 2. Load Periods
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const res = await periodService.getAll();
                const data = res.data ?? [];
                const loaded = Array.isArray(data) ? data : data?.data ?? data?.content ?? [];
                setPeriods(loaded);
                if (loaded.length > 0) setAttendanceShift(String(loaded[0].id));
            } catch (err) {
                console.error("Load periods failed", err);
            }
        };
        fetchPeriods();
    }, []);

    // 3. Load scheduled dates for a given month
    const loadScheduledDates = useCallback(async (year, month) => {
        if (!classId) return;
        try {
            const res = await attendanceService.getScheduledDates(classId, year, month);
            setScheduledDates(res.data || []);
        } catch (err) {
            console.error("Load scheduled dates failed", err);
            setScheduledDates([]);
        }
    }, [classId]);

    // 4. Load Sessions History
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

    // 5. Load Attendance Data
    const loadAttendanceData = async () => {
        if (!classId || !attendanceDate || !attendanceShift || periods.length === 0) return;
        try {
            setIsLoadingAttendance(true);
            const res = await attendanceService.getAttendanceByClassAndDate(classId, attendanceDate);
            const records = res.data || [];
            const selectedPeriod = periods.find(p => String(p.id) === String(attendanceShift));
            if (!selectedPeriod) return;
            const startTimeStr = timeObjToString(selectedPeriod.startTime);
            const endTimeStr = timeObjToString(selectedPeriod.endTime);
            const existingSession = sessions.find(s =>
                s.sessionDate === attendanceDate && s.startTime === startTimeStr && s.endTime === endTimeStr
            );
            if (existingSession && records.length > 0) {
                const newAttendance = {};
                studentsList.forEach(s => newAttendance[s.id] = 'present');
                records.forEach(r => {
                    const status = r.status.toLowerCase();
                    newAttendance[r.studentId] = status === 'present' ? 'present' : status === 'excused' ? 'excused' : 'absent';
                });
                setAttendance(newAttendance);
            } else {
                const initialAttendance = {};
                studentsList.forEach(s => { initialAttendance[s.id] = "present"; });
                setAttendance(initialAttendance);
            }
        } catch (error) {
            console.error("Failed to load attendance data:", error);
        } finally {
            setIsLoadingAttendance(false);
        }
    };

    useEffect(() => {
        if (classId && attendanceDate && attendanceShift && periods.length > 0) loadAttendanceData();
    }, [classId, attendanceDate, attendanceShift, periods, sessions]);

    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSaveAttendance = async () => {
        if (!classId) { alert("Không tìm thấy thông tin lớp học!"); return; }
        try {
            setIsLoadingAttendance(true);
            const validationRes = await attendanceService.validateScheduleDate(classId, attendanceDate);
            if (!validationRes.data?.hasSchedule) {
                alert(`Ngày ${attendanceDate} không có lịch học trong thời khóa biểu.`);
                setIsLoadingAttendance(false);
                return;
            }
            const selectedPeriod = periods.find(p => String(p.id) === String(attendanceShift));
            if (!selectedPeriod) { alert("Vui lòng chọn ca học!"); setIsLoadingAttendance(false); return; }
            const startTime = timeObjToString(selectedPeriod.startTime);
            const endTime = timeObjToString(selectedPeriod.endTime);
            const existingSession = sessions.find(s =>
                s.sessionDate === attendanceDate && s.startTime === startTime && s.endTime === endTime
            );
            let sessionId;
            if (existingSession) {
                sessionId = existingSession.attendanceSessionId || existingSession.id;
            } else {
                const createRes = await attendanceService.createSession({
                    classId: parseInt(classId),
                    title: `Điểm danh ${attendanceDate} - ${selectedPeriod.name}`,
                    sessionDate: attendanceDate,
                    startTime,
                    endTime,
                    status: "UPCOMING"
                });
                const session = createRes.data?.data || createRes.data || createRes;
                sessionId = session.attendanceSessionId || session.id;
            }
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                attendanceSessionId: sessionId,
                studentId: parseInt(studentId),
                status: status === 'present' ? 'PRESENT' : status === 'excused' ? 'EXCUSED' : 'ABSENT',
                note: ""
            }));
            await attendanceService.markAttendanceBulk(sessionId, records);
            alert("Đã lưu điểm danh thành công!");
            await loadSessions();
        } catch (error) {
            console.error("Failed to save attendance:", error);
            const errorMsg = error.response?.data?.data || error.response?.data?.message || error.message || "Lỗi không xác định";
            alert("Lỗi khi lưu điểm danh: " + errorMsg);
        } finally {
            setIsLoadingAttendance(false);
        }
    };

    const stats = {
        total: studentsList.length,
        present: Object.values(attendance).filter(s => s === "present").length,
        excused: Object.values(attendance).filter(s => s === "excused").length,
        unexcused: Object.values(attendance).filter(s => s === "absent").length,
    };

    // Is the selected date a scheduled day?
    const isSelectedScheduled = scheduledDates.includes(attendanceDate);

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

            {/* Main Layout: Calendar + Table */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Calendar column */}
                <div style={{ flexShrink: 0 }}>
                    <AttendanceCalendar
                        selectedDate={attendanceDate}
                        onSelectDate={setAttendanceDate}
                        scheduledDates={scheduledDates}
                        onMonthChange={loadScheduledDates}
                    />

                    {/* Period selector below calendar */}
                    <div style={{
                        background: 'white', borderRadius: 12, border: '1px solid #e5e7eb',
                        padding: '14px 16px', marginTop: 12
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>CA HỌC</div>
                        <select
                            style={{
                                width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb',
                                borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer',
                                background: 'white'
                            }}
                            value={attendanceShift}
                            onChange={e => setAttendanceShift(e.target.value)}
                        >
                            {periods.length === 0 && <option value="">Đang tải...</option>}
                            {periods.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({timeObjToString(p.startTime)} - {timeObjToString(p.endTime)})
                                </option>
                            ))}
                        </select>

                        {/* Warning if selected date has no schedule */}
                        {attendanceDate && !isSelectedScheduled && scheduledDates !== null && (
                            <div style={{
                                marginTop: 10, padding: '8px 12px',
                                background: '#fef3c7', borderRadius: 8,
                                fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6
                            }}>
                                <span>⚠</span> Ngày này không có trong lịch học
                            </div>
                        )}

                        {attendanceDate && isSelectedScheduled && (
                            <div style={{
                                marginTop: 10, padding: '8px 12px',
                                background: '#f0fdf4', borderRadius: 8,
                                fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 6
                            }}>
                                <span>✓</span> Ngày có lịch học
                            </div>
                        )}
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="cd-table-card" style={{ position: 'relative', flex: 1 }}>
                    {isLoadingAttendance && (
                        <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
                            zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12
                        }}>
                            <div style={{
                                width: 32, height: 32, border: '3px solid #f3f3f3',
                                borderTop: '3px solid #3498db', borderRadius: '50%',
                                animation: 'cd-spin 1s linear infinite'
                            }} />
                            <style>{`@keyframes cd-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
                        </div>
                    )}
                    <div className="cd-table-header">
                        <div className="cd-table-title">
                            Điểm danh — {attendanceDate}
                        </div>
                        <div className="cd-header-actions">
                            <button
                                className="cm-primary-button cd-save-btn"
                                onClick={handleSaveAttendance}
                                style={{
                                    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                    boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
                                    border: "none", padding: "10px 24px",
                                    fontSize: "14px", fontWeight: "600",
                                    display: "flex", alignItems: "center", gap: "8px",
                                    color: "white", borderRadius: "8px", cursor: "pointer"
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
                                    <td className="cd-td" style={{ textAlign: "center", color: "#6b7280" }}>{index + 1}</td>
                                    <td className="cd-td">
                                        <div className="cd-student-info">
                                            <div className="cd-avatar">{student.name.charAt(0)}</div>
                                            <div>
                                                <div className="cd-student-name">{student.name}</div>
                                                <div className="cd-student-id">{student.code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="cd-td">
                                        <div className="cd-attendance-options">
                                            <AttendanceButton type="present" label="Có mặt" active={attendance[student.id] === 'present'} onClick={() => handleAttendanceChange(student.id, 'present')} />
                                            <AttendanceButton type="excused" label="Nghỉ có phép" active={attendance[student.id] === 'excused'} onClick={() => handleAttendanceChange(student.id, 'excused')} />
                                            <AttendanceButton type="unexcused" label="Nghỉ không phép" active={attendance[student.id] === 'absent'} onClick={() => handleAttendanceChange(student.id, 'absent')} />
                                        </div>
                                    </td>
                                    <td className="cd-td">
                                        <input type="text" className="att-input" placeholder="Ghi chú..."
                                            style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
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
        </div>
    );
}

function AttendanceButton({ type, label, active, onClick }) {
    const iconColors = { present: "#16a34a", excused: "#ca8a04", unexcused: "#dc2626" };
    const bgColors = { present: "#dcfce7", excused: "#fef9c3", unexcused: "#fee2e2" };
    const borderColors = { present: "#86efac", excused: "#fde047", unexcused: "#fca5a5" };
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
            <div className={`cd-dot ${type}`} style={{ backgroundColor: iconColors[type] }} />
            {label}
        </button>
    );
}
