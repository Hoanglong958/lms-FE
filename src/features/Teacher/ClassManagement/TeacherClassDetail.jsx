import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { classService } from "@utils/classService";
import { classStudentService } from "@utils/classStudentService";
import { classCourseService } from "@utils/classCourseService";
import { examService } from "@utils/examService"; // We might need this, or create a specific service
import { Users, BookOpen, ClipboardCheck, Calendar, Clock, ChevronLeft } from "lucide-react";
import "../Dashboard/TeacherDashboard.css"; // Reuse dashboard styles
import TeacherAttendanceTab from "./TeacherAttendanceTab";

export default function TeacherClassDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);
    const [activeTab, setActiveTab] = useState("courses"); // Default to courses as that's the main teaching activity

    // Data states
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]); // Placeholder for now

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

            // 4. Fetch Exams (TODO: Implement API to fetch exams for a class)
            // For now, we will just set empty or mock
            setExams([]);

        } catch (error) {
            console.error("Failed to fetch class data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/teacher/classes");
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
                
                <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<Users size={18} />} label="Học viên" />
                <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<ClipboardCheck size={18} />} label="Điểm danh" />
                <TabButton active={activeTab === 'exams'} onClick={() => setActiveTab('exams')} icon={<ClipboardCheck size={18} />} label="Bài kiểm tra" />
            </div>

            {/* Tab Content */}
            <div className="teacher-tab-content">
                {activeTab === 'courses' && (
                    <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {courses.length > 0 ? courses.map(course => (
                            <div key={course.id} className="course-card" style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                                <h3 style={{ marginTop: 0 }}>{course.courseTitle}</h3>
                                <p style={{ color: '#6b7280', fontSize: 13 }}>Được gán ngày: {course.assignedAt}</p>
                                <button
                                    style={{
                                        marginTop: 12,
                                        width: '100%',
                                        padding: '8px',
                                        background: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/teacher/lessons/${course.courseId}?classId=${id}`)}
                                >
                                    Quản lý Bài học
                                </button>
                            </div>
                        )) : (
                            <p>Chưa có khóa học nào được gán cho lớp này.</p>
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
                    <div style={{ background: 'white', padding: 40, borderRadius: 12, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <ClipboardCheck size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
                        <h3>Tính năng Bài kiểm tra đang được phát triển</h3>
                        <p style={{ color: '#6b7280' }}>Giảng viên sẽ sớm có thể tạo và quản lý bài kiểm tra tại đây.</p>
                        <button
                            style={{ marginTop: 16, padding: '8px 16px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                            onClick={() => navigate('/teacher/exams')}
                        >
                            Đến trang Quản lý Bài kiểm tra
                        </button>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <TeacherAttendanceTab classId={id} students={students} />
                )}
            </div>
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
