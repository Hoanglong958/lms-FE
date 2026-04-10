import React, { useState, useEffect, useMemo } from "react";
import { classService } from "@utils/classService";
import { Search, BookOpen, Calendar, Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../Dashboard/TeacherDashboard.css";

const TeacherClassList = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await classService.getMyClasses();
            setClasses(res.data || []);
        } catch (error) {
            console.error("Failed to fetch classes:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = useMemo(() => {
        return classes.filter(cls =>
            cls.className.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [classes, searchQuery]);

    const handleClassClick = (id) => {
        navigate(`/teacher/classes/${id}`);
    };

    return (
        <div className="teacher-dashboard">
            <div className="teacher-dashboard-header">
                <h1 className="teacher-dashboard-title">Danh sách lớp học</h1>
                <p className="teacher-dashboard-subtitle">Quản lý các lớp học được phân công cho bạn.</p>
            </div>

            <div className="card-body" style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {/* Search Bar */}
                <div style={{ marginBottom: 24, position: 'relative' }}>
                    <Search size={20} color="#9ca3af" style={{ position: 'absolute', left: 12, top: 10 }} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm lớp học..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            borderRadius: 8,
                            border: '1px solid #e5e7eb',
                            outline: 'none'
                        }}
                    />
                </div>

                {loading ? (
                    <p>Đang tải...</p>
                ) : filteredClasses.length > 0 ? (
                    <div className="teacher-class-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {filteredClasses.map(cls => (
                            <div
                                key={cls.id}
                                className="class-card"
                                onClick={() => handleClassClick(cls.id)}
                                style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 12,
                                    padding: 20,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: 'white'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#f97316'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ width: 40, height: 40, background: '#fff7ed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                                        <BookOpen size={20} />
                                    </div>
                                    <span className={`status-badge ${cls.status?.toLowerCase()}`}>{cls.status}</span>
                                </div>

                                <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600, color: '#111827' }}>{cls.className}</h3>
                                <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#6b7280', lineClamp: 2 }}>{cls.description}</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#4b5563' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Users size={14} />
                                        <span>{cls.totalStudents} HV</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Calendar size={14} />
                                        <span>{cls.startDate}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <BookOpen size={48} color="#d1d5db" />
                        <p>Không tìm thấy lớp học nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherClassList;
