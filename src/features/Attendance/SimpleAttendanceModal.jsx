import React, { useState, useEffect } from "react";
import { attendanceService } from "@utils/attendanceService";
import { classStudentService } from "@utils/classStudentService";
import { X, Save, Key } from "lucide-react";
import "./SimpleAttendanceModal.css";

export default function SimpleAttendanceModal({ isOpen, onClose, classId, sessionInfo, onSave }) {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    useEffect(() => {
        if (isOpen && classId && sessionInfo) {
            loadOrCreateSession();
        }
    }, [isOpen, classId, sessionInfo]);

    const loadOrCreateSession = async () => {
        try {
            setLoading(true);
            
            // IMPORTANT: Reset sessionId when loading new date/period
            // This ensures we don't use stale sessionId from previous day
            setSessionId(null);
            setAttendanceRecords([]);

            // NEW: Load attendance by date instead of session
            try {
                const attendanceRes = await attendanceService.getAttendanceByClassAndDate(classId, sessionInfo.date);
                const existingRecords = attendanceRes.data || [];

                if (existingRecords.length > 0) {
                    // Map existing records to our format
                    const mappedRecords = existingRecords.map(record => ({
                        attendanceRecordId: record.attendanceRecordId,
                        attendanceSessionId: record.attendanceSessionId,
                        studentId: record.studentId,
                        studentName: record.studentName,
                        studentCode: record.studentCode || "",
                        status: record.status,
                        note: record.note || ""
                    }));
                    setAttendanceRecords(mappedRecords);
                    // IMPORTANT: Use the sessionId from existing records for this date
                    setSessionId(existingRecords[0].attendanceSessionId);
                    return;
                }
            } catch (attendanceError) {
                console.warn("Failed to load existing attendance:", attendanceError);
            }

            // NEW: Validate that this date has a schedule before creating session
            try {
                const validationRes = await attendanceService.validateScheduleDate(classId, sessionInfo.date);
                if (!validationRes.data?.hasSchedule) {
                    alert(`Ngày ${sessionInfo.date} không có lịch học. Vui lòng chọn ngày có trong thời khóa biểu.`);
                    onClose();
                    return;
                }
            } catch (validationError) {
                console.warn("Schedule validation failed:", validationError);
                // Continue anyway if validation fails
            }

            // ALWAYS create a new session for today's attendance
            // This ensures each day has its own session and doesn't overwrite previous days
            const createRes = await attendanceService.createSession({
                classId: parseInt(classId),
                title: sessionInfo.title || `Buổi học ${sessionInfo.date}`,
                sessionDate: sessionInfo.date,
                startTime: sessionInfo.startTime,
                endTime: sessionInfo.endTime,
                status: "UPCOMING"
            });
            const session = createRes.data || createRes;

            setSessionId(session.id);

            // Load students for this session
            const studentsRes = await attendanceService.listStudentsForSession(session.id);
            const records = studentsRes.data || [];

            // If no records yet, fetch class students
            if (records.length === 0) {
                const classStudentsRes = await classStudentService.getClassStudents(classId);
                const classStudents = classStudentsRes.data?.data || classStudentsRes.data || [];

                const initialRecords = classStudents.map(student => ({
                    attendanceRecordId: null,
                    attendanceSessionId: session.id,
                    studentId: student.studentId || student.id,
                    studentName: student.studentName || student.fullName || student.name,
                    studentCode: student.studentCode || student.code || "",
                    status: "PRESENT",
                    note: ""
                }));
                setAttendanceRecords(initialRecords);
            } else {
                setAttendanceRecords(records);
            }
        } catch (error) {
            console.error("Failed to load session:", error);
            if (error.response?.status === 400 && error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert("Lỗi khi tải buổi điểm danh!");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceRecords(prev => prev.map(record =>
            record.studentId === studentId ? { ...record, status } : record
        ));
    };

    const handleSave = async () => {
        if (!sessionId) return;

        try {
            setLoading(true);
            const records = attendanceRecords.map(record => ({
                attendanceRecordId: record.attendanceRecordId, // NEW: Include record ID for updates
                attendanceSessionId: sessionId,
                studentId: record.studentId,
                status: record.status,
                note: record.note || ""
            }));

            await attendanceService.markAttendanceBulk(sessionId, records);
            onSave?.();
            onClose();
        } catch (error) {
            console.error("Failed to save attendance:", error);
            alert("Lỗi khi lưu điểm danh!");
        } finally {
            setLoading(false);
        }
    };

    const splitName = (fullName) => {
        if (!fullName) return { lastName: "", firstName: "" };
        const parts = fullName.trim().split(" ");
        if (parts.length === 1) return { lastName: "", firstName: parts[0] };
        const firstName = parts[parts.length - 1];
        const lastName = parts.slice(0, -1).join(" ");
        return { lastName, firstName };
    };

    if (!isOpen) return null;

    return (
        <div className="sam-overlay" onClick={onClose}>
            <div className="sam-modal" onClick={e => e.stopPropagation()}>
                <div className="sam-header">
                    <div className="sam-header-info">
                        <h2 className="sam-course-title">Học phần: {sessionInfo?.courseName}</h2>
                        <div className="sam-meta">
                            <span>{sessionInfo?.startTime} - {sessionInfo?.endTime} (Tiết {sessionInfo?.periodName})</span>
                            <span className="sam-absent-rate">Vắng mặt(Số buổi/Số tiết/Tỷ lệ): (1/2/4%)</span>
                        </div>
                    </div>
                    <button className="sam-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="sam-subheader">
                    <h3 className="sam-class-name">Lớp: {sessionInfo?.className}</h3>
                    <div className="sam-controls">
                        <div className="sam-search-wrapper">
                            <span>Từ khóa điểm danh</span>
                            <div className="sam-input-group">
                                <input type="text" placeholder="Từ khóa điểm danh" className="sam-input" />
                                <button className="sam-btn sam-btn-secondary"><Key size={16} /> Lưu</button>
                            </div>
                        </div>
                        <button className="sam-btn sam-btn-primary" onClick={handleSave} disabled={loading}>
                            <Save size={16} /> {loading ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                </div>

                <p className="sam-room-info">(Phòng học: VPC2-702)</p>

                <div className="sam-table-wrapper">
                    <table className="sam-table">
                        <thead>
                            <tr>
                                <th style={{ width: 60 }}>STT</th>
                                <th style={{ width: 120 }}>Mã số</th>
                                <th>Họ đệm</th>
                                <th style={{ width: 120 }}>Tên</th>
                                <th style={{ width: 150 }}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords.length > 0 ? (
                                attendanceRecords.map((record, index) => {
                                    const { lastName, firstName } = splitName(record.studentName);
                                    return (
                                        <tr key={record.studentId}>
                                            <td className="center">{index + 1}</td>
                                            <td>{record.studentCode}</td>
                                            <td>{lastName}</td>
                                            <td className="bold">{firstName}</td>
                                            <td>
                                                <select
                                                    className="sam-select"
                                                    value={record.status}
                                                    onChange={(e) => handleStatusChange(record.studentId, e.target.value)}
                                                >
                                                    <option value="PRESENT">Có mặt</option>
                                                    <option value="EXCUSED">Nghỉ có phép</option>
                                                    <option value="ABSENT">Nghỉ không phép</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="center" style={{ padding: 40, color: '#6b7280' }}>
                                        {loading ? "Đang tải dữ liệu..." : "Chưa có dữ liệu học viên."}
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
