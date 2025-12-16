import React from "react";
import "./class.css"; // Sử dụng chung file CSS với class management

export default function ClassDetailModal({ isOpen, onClose, type, data, onAttendance }) {
    if (!isOpen || !data) return null;

    const getModalContent = () => {
        switch (type) {
            case "code":
                return (
                    <div className="cm-modal-content">
                        <div className="cm-modal-header">
                            <h2 className="cm-modal-title">
                                <span className="cm-modal-icon cm-modal-icon-code">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 6l-6 6 6 6M16 6l6 6-6 6M13 2l-2 20" opacity="0.8" />
                                    </svg>
                                </span>
                                Chi tiết mã lớp: {data.code}
                            </h2>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {onAttendance && (
                                    <button
                                        className="cd-toggle-attendance-btn"
                                        onClick={() => {
                                            onAttendance(data);
                                            onClose();
                                        }}
                                        style={{ padding: '8px 16px', fontSize: '13px' }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Điểm danh
                                    </button>
                                )}
                                <button onClick={onClose} className="cm-modal-close">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="cm-modal-body">
                            <div className="cm-info-grid">
                                <div className="cm-info-card">
                                    <div className="cm-info-label">Mã lớp</div>
                                    <div className="cm-info-value">{data.code}</div>
                                </div>
                                <div className="cm-info-card">
                                    <div className="cm-info-label">Tên lớp</div>
                                    <div className="cm-info-value">{data.name}</div>
                                </div>
                                <div className="cm-info-card">
                                    <div className="cm-info-label">Mô tả</div>
                                    <div className="cm-info-value">{data.subtitle}</div>
                                </div>
                                <div className="cm-info-card">
                                    <div className="cm-info-label">Trạng thái</div>
                                    <div className="cm-info-value">
                                        <span className="cm-badge cm-badge-status-active">
                                            {data.status === 'active' ? 'Đang học' : data.status === 'upcoming' ? 'Sắp bắt đầu' : 'Đã kết thúc'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="cm-section-divider"></div>

                            <h3 className="cm-section-subtitle">Thời gian biểu</h3>
                            <div className="cm-info-grid">
                                <div className="cm-info-card cm-highlight">
                                    <div className="cm-info-label">Ngày bắt đầu</div>
                                    <div className="cm-info-value cm-large">{data.startDate}</div>
                                </div>
                                <div className="cm-info-card cm-highlight">
                                    <div className="cm-info-label">Ngày kết thúc</div>
                                    <div className="cm-info-value cm-large">{data.endDate}</div>
                                </div>
                                <div className="cm-info-card cm-highlight">
                                    <div className="cm-info-label">Lịch học</div>
                                    <div className="cm-info-value">{data.schedule || "Chưa cập nhật"}</div>
                                </div>
                                <div className="cm-info-card cm-highlight">
                                    <div className="cm-info-label">Thời lượng</div>
                                    <div className="cm-info-value">3 tháng (90 ngày)</div>
                                </div>
                            </div>

                            <div className="cm-section-divider"></div>

                            <h3 className="cm-section-subtitle">Ca học chi tiết</h3>
                            <div className="cm-schedule-table">
                                <div className="cm-schedule-row cm-schedule-header">
                                    <div>Thứ</div>
                                    <div>Buổi</div>
                                    <div>Thời gian</div>
                                    <div>Phòng</div>
                                </div>
                                <div className="cm-schedule-row">
                                    <div>Thứ 2</div>
                                    <div>Sáng</div>
                                    <div>9:00 - 11:00</div>
                                    <div>Phòng A101</div>
                                </div>
                                <div className="cm-schedule-row">
                                    <div>Thứ 4</div>
                                    <div>Sáng</div>
                                    <div>9:00 - 11:00</div>
                                    <div>Phòng A101</div>
                                </div>
                                <div className="cm-schedule-row">
                                    <div>Thứ 6</div>
                                    <div>Sáng</div>
                                    <div>9:00 - 11:00</div>
                                    <div>Phòng A101</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "teacher":
                return (
                    <div className="cm-modal-content">
                        <div className="cm-modal-header">
                            <h2 className="cm-modal-title">
                                <span className="cm-modal-icon cm-modal-icon-teacher">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                                        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </span>
                                Danh sách giảng viên lớp: {data.name}
                            </h2>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {data.onAssignTeachers && (
                                    <button
                                        className="cd-toggle-attendance-btn"
                                        onClick={() => {
                                            data.onAssignTeachers();
                                            onClose();
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '13px',
                                            background: '#059669',
                                            border: 'none',
                                            color: '#fff',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontWeight: 600,
                                            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="8.5" cy="7" r="4" />
                                            <line x1="20" y1="8" x2="20" y2="14" strokeLinecap="round" />
                                            <line x1="23" y1="11" x2="17" y2="11" strokeLinecap="round" />
                                        </svg>
                                        Thêm giảng viên
                                    </button>
                                )}
                                <button onClick={onClose} className="cm-modal-close">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="cm-modal-body">
                            <h3 className="cm-section-subtitle">Danh sách giảng viên ({data.enrolledTeachers?.length || 0})</h3>
                            <div className="cm-students-table">
                                <div className="cm-student-row cm-student-header" style={{ gridTemplateColumns: "50px 1fr 120px 100px", marginRight: "6px" }}>
                                    <div>STT</div>
                                    <div>Giảng viên</div>
                                    <div>Vai trò</div>
                                    <div style={{ textAlign: "right" }}>Thao tác</div>
                                </div>
                                <div style={{ maxHeight: "60vh", overflowY: "auto", paddingBottom: "20px" }}>
                                    {data.enrolledTeachers && data.enrolledTeachers.length > 0 ? (
                                        data.enrolledTeachers.map((t, index) => (
                                            <div className="cm-student-row" key={t.id || index} style={{ gridTemplateColumns: "50px 1fr 120px 100px" }}>
                                                <div>{index + 1}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{t.teacherName || t.fullName || t.name || "N/A"}</div>
                                                    {t.email && <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.email}</div>}
                                                </div>
                                                <div>
                                                    <span className="cm-badge-mini cm-badge-success">
                                                        {t.role === 'INSTRUCTOR' ? 'Giảng viên' : (t.role === 'ASSISTANT' ? 'Trợ giảng' : (t.role || 'Giảng viên'))}
                                                    </span>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <button
                                                        onClick={() => data.onRemoveTeacher && data.onRemoveTeacher(t.teacherId || t.id)}
                                                        title="Xóa khỏi lớp"
                                                        style={{
                                                            color: "#ef4444",
                                                            background: "#fee2e2",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            width: "32px",
                                                            height: "32px",
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        }}
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: "30px", textAlign: "center", color: "#6b7280", fontStyle: "italic" }}>
                                            Chưa có giảng viên nào được phân công
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "enrollment":
                return (
                    <div className="cm-modal-content">
                        <div className="cm-modal-header">
                            <h2 className="cm-modal-title">
                                <span className="cm-modal-icon cm-modal-icon-enrollment">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </span>
                                Thông tin sĩ số lớp: {data.name}
                            </h2>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {data.onAddStudents && (
                                    <button
                                        className="cd-toggle-attendance-btn"
                                        onClick={() => {
                                            data.onAddStudents();
                                            onClose();
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '13px',
                                            background: '#0ea5e9',
                                            border: 'none',
                                            color: '#fff',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontWeight: 600,
                                            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)',
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="8.5" cy="7" r="4" />
                                            <line x1="20" y1="8" x2="20" y2="14" strokeLinecap="round" />
                                            <line x1="23" y1="11" x2="17" y2="11" strokeLinecap="round" />
                                        </svg>
                                        Thêm sinh viên
                                    </button>
                                )}
                                {onAttendance && (
                                    <button
                                        className="cd-toggle-attendance-btn"
                                        onClick={() => {
                                            onAttendance(data);
                                            onClose();
                                        }}
                                        style={{ padding: '8px 16px', fontSize: '13px' }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Điểm danh
                                    </button>
                                )}
                                <button onClick={onClose} className="cm-modal-close">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="cm-modal-body">


                            <h3 className="cm-section-subtitle">Danh sách học viên ({data.enrolledStudents?.length || 0})</h3>
                            <div className="cm-students-table">
                                <div className="cm-student-row cm-student-header" style={{ gridTemplateColumns: "50px 1fr 120px 100px", marginRight: "6px" }}>
                                    <div>STT</div>
                                    <div>Họ tên</div>
                                    <div>Trạng thái</div>
                                    <div style={{ textAlign: "right" }}>Thao tác</div>
                                </div>
                                <div style={{ maxHeight: "60vh", overflowY: "auto", paddingBottom: "20px" }}>
                                    {data.enrolledStudents && data.enrolledStudents.length > 0 ? (
                                        data.enrolledStudents.map((student, index) => (
                                            <div className="cm-student-row" key={index} style={{ gridTemplateColumns: "50px 1fr 120px 100px" }}>
                                                <div>{index + 1}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{student.studentName || student.fullName || student.name || "N/A"}</div>
                                                    {student.email && <div style={{ fontSize: 11, color: "#9ca3af" }}>{student.email}</div>}
                                                </div>
                                                <div>
                                                    <span className={`cm-badge-mini ${student.status === 'ACTIVE' ? 'cm-badge-success' : 'cm-badge-warning'}`}>
                                                        {student.status || 'ACTIVE'}
                                                    </span>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <button
                                                        onClick={() => data.onRemoveStudent && data.onRemoveStudent(student.studentId || student.id)}
                                                        title="Xóa khỏi lớp"
                                                        style={{
                                                            color: "#ef4444",
                                                            background: "#fee2e2",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            width: "32px",
                                                            height: "32px",
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center"
                                                        }}
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: "30px", textAlign: "center", color: "#6b7280", fontStyle: "italic" }}>
                                            Chưa có học viên nào trong lớp
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="cm-modal-overlay" onClick={onClose}>
            <div className="cm-modal-wrapper" onClick={(e) => e.stopPropagation()}>
                {getModalContent()}
            </div>
        </div>
    );
}
