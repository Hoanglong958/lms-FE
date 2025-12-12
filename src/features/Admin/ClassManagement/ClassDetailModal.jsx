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
                                Thông tin giảng viên: {data.teacher}
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
                            <div className="cm-teacher-profile">
                                <div className="cm-teacher-avatar">
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                </div>
                                <div className="cm-teacher-info">
                                    <h3 className="cm-teacher-name">{data.teacher}</h3>
                                    <p className="cm-teacher-title">Giảng viên React & JavaScript</p>
                                    <p className="cm-teacher-email">teacher@mankai.edu.vn</p>
                                </div>
                            </div>

                            <div className="cm-section-divider"></div>

                            <h3 className="cm-section-subtitle">Lớp phụ trách</h3>
                            <div className="cm-info-grid">
                                <div className="cm-info-card">
                                    <div className="cm-info-label">Tên lớp</div>
                                    <div className="cm-info-value">{data.name}</div>
                                </div>
                                <div className="cm-info-card">
                                    <div className="cm-info-label">Mã lớp</div>
                                    <div className="cm-info-value">{data.code}</div>
                                </div>
                                <div className="cm-info-card">
                                    <div className="cm-info-label">Số học viên</div>
                                    <div className="cm-info-value">{data.students} học viên</div>
                                </div>
                                <div className="cm-info-card">
                                    <div className="cm-info-label">Đang hoạt động</div>
                                    <div className="cm-info-value">{data.active} học viên</div>
                                </div>
                            </div>

                            <div className="cm-section-divider"></div>

                            <h3 className="cm-section-subtitle">Lịch dạy</h3>
                            <div className="cm-info-card cm-highlight">
                                <div className="cm-info-value cm-large">{data.schedule || "Chưa cập nhật"}</div>
                                <div className="cm-info-label">Địa điểm: Tòa nhà A, Phòng 101</div>
                            </div>

                            <div className="cm-section-divider"></div>

                            <h3 className="cm-section-subtitle">Kinh nghiệm & Chứng chỉ</h3>
                            <div className="cm-experience-list">
                                <div className="cm-experience-item">
                                    <div className="cm-experience-dot"></div>
                                    <div>
                                        <strong>5+ năm</strong> kinh nghiệm giảng dạy React & JavaScript
                                    </div>
                                </div>
                                <div className="cm-experience-item">
                                    <div className="cm-experience-dot"></div>
                                    <div>
                                        <strong>Chứng chỉ</strong> React Developer Professional
                                    </div>
                                </div>
                                <div className="cm-experience-item">
                                    <div className="cm-experience-dot"></div>
                                    <div>
                                        <strong>Dự án</strong> đã tham gia 20+ dự án thực tế
                                    </div>
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
                            <div className="cm-stats-grid">
                                <div className="cm-stat-card cm-stat-card-primary">
                                    <div className="cm-stat-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" opacity="0.3" />
                                            <circle cx="9" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <div className="cm-stat-value">{data.students}</div>
                                    <div className="cm-stat-label">Tổng học viên</div>
                                </div>

                                <div className="cm-stat-card cm-stat-card-success">
                                    <div className="cm-stat-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="10" opacity="0.3" />
                                            <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" fill="none" />
                                        </svg>
                                    </div>
                                    <div className="cm-stat-value">{data.active}</div>
                                    <div className="cm-stat-label">Đang hoạt động</div>
                                </div>

                                <div className="cm-stat-card cm-stat-card-warning">
                                    <div className="cm-stat-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" opacity="0.3" />
                                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                    </div>
                                    <div className="cm-stat-value">
                                        {data.students ? Math.round((data.active / data.students) * 100) : 0}%
                                    </div>
                                    <div className="cm-stat-label">Tỉ lệ hoạt động</div>
                                </div>

                                <div className="cm-stat-card cm-stat-card-info">
                                    <div className="cm-stat-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                            <rect x="4" y="4" width="16" height="16" rx="2" opacity="0.3" />
                                            <path d="M9 11h6M9 15h6" stroke="white" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <div className="cm-stat-value">{data.progress}%</div>
                                    <div className="cm-stat-label">Tiến độ trung bình</div>
                                </div>
                            </div>

                            <div className="cm-section-divider"></div>

                            <h3 className="cm-section-subtitle">Phân tích chi tiết</h3>
                            <div className="cm-progress-bars">
                                <div className="cm-progress-item">
                                    <div className="cm-progress-label">
                                        <span>Có mặt thường xuyên</span>
                                        <span className="cm-progress-value">85%</span>
                                    </div>
                                    <div className="cm-progress-bar">
                                        <div className="cm-progress-fill" style={{ width: "85%", background: "#10b981" }}></div>
                                    </div>
                                </div>

                                <div className="cm-progress-item">
                                    <div className="cm-progress-label">
                                        <span>Hoàn thành bài tập</span>
                                        <span className="cm-progress-value">75%</span>
                                    </div>
                                    <div className="cm-progress-bar">
                                        <div className="cm-progress-fill" style={{ width: "75%", background: "#6366f1" }}></div>
                                    </div>
                                </div>

                                <div className="cm-progress-item">
                                    <div className="cm-progress-label">
                                        <span>Tham gia thảo luận</span>
                                        <span className="cm-progress-value">65%</span>
                                    </div>
                                    <div className="cm-progress-bar">
                                        <div className="cm-progress-fill" style={{ width: "65%", background: "#f59e0b" }}></div>
                                    </div>
                                </div>

                                <div className="cm-progress-item">
                                    <div className="cm-progress-label">
                                        <span>Điểm kiểm tra trung bình</span>
                                        <span className="cm-progress-value">8.2/10</span>
                                    </div>
                                    <div className="cm-progress-bar">
                                        <div className="cm-progress-fill" style={{ width: "82%", background: "#ec4899" }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="cm-section-divider"></div>

                            <h3 className="cm-section-subtitle">Danh sách học viên tiêu biểu</h3>
                            <div className="cm-students-table">
                                <div className="cm-student-row cm-student-header">
                                    <div>STT</div>
                                    <div>Họ tên</div>
                                    <div>Điểm TB</div>
                                    <div>Hoàn thành</div>
                                </div>
                                <div className="cm-student-row">
                                    <div>1</div>
                                    <div>Nguyễn Văn B</div>
                                    <div>9.2</div>
                                    <div><span className="cm-badge-mini cm-badge-success">95%</span></div>
                                </div>
                                <div className="cm-student-row">
                                    <div>2</div>
                                    <div>Trần Thị C</div>
                                    <div>8.8</div>
                                    <div><span className="cm-badge-mini cm-badge-success">90%</span></div>
                                </div>
                                <div className="cm-student-row">
                                    <div>3</div>
                                    <div>Lê Văn D</div>
                                    <div>8.5</div>
                                    <div><span className="cm-badge-mini cm-badge-success">85%</span></div>
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
