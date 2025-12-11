import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { classService } from "@utils/classService";
import "./ClassDetailPage.css";

const ClassDetailPage = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await classService.getClassDetail(id);
        const raw = res?.data;
        const d = raw?.data || raw?.item || raw?.content || raw || {};
        const endDate = d.endDate || d.end_date || null;
        const startDate = d.startDate || d.start_date || null;
        const scheduleInfo = d.schedule || d.timetable || "";
        const studentsArr = d.students || d.studentList || d.members || [];
        const image = d.image || "/anh1.png";
        const mapped = {
          id: d.id || Number(id),
          className: d.className || d.name || d.class_name || "Chưa có tên",
          description: d.description || d.subtitle || "",
          scheduleInfo,
          startDate: startDate || "N/A",
          endDate: endDate || "N/A",
          status: d.status || "UPCOMING",
          totalStudents:
            typeof d.totalStudents === "number"
              ? d.totalStudents
              : Array.isArray(studentsArr)
              ? studentsArr.length
              : 0,
          totalTeachers: d.totalTeachers || 1,
          totalCourses: d.totalCourses || d.coursesCount || 0,
          image,
          students:
            Array.isArray(studentsArr)
              ? studentsArr.map((s) => ({
                  id: s.id || s.studentId || s.code || Math.random(),
                  name: s.fullName || s.name || "Học viên",
                  code: s.code || s.studentCode || "N/A",
                }))
              : [],
        };
        if (mounted) setDetail(mapped);
      } catch (e) {
        console.error("Load class detail failed", e);
        if (mounted)
          setDetail({
            id: Number(id),
            className: "Chi tiết lớp học",
            description: "",
            scheduleInfo: "",
            startDate: "N/A",
            endDate: "N/A",
            status: "UPCOMING",
            totalStudents: 0,
            totalTeachers: 0,
            totalCourses: 0,
            image: "/anh1.png",
            students: [],
          });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const cls = useMemo(() => detail, [detail]);
  if (loading) return <h2 style={{ padding: 20 }}>Đang tải lớp học...</h2>;
  if (!cls) return <h2 style={{ padding: 20 }}>Không tìm thấy lớp học!</h2>;

  return (
    <div className="class-detail-container">
      <div className="class-detail-card">

        {/* Banner */}
        <div className="banner-wrapper">
          <img src={cls.image} className="banner-img" />
        </div>

        {/* Title + Description */}
        <h1 className="class-title">{cls.className}</h1>
        <p className="class-description">{cls.description}</p>

        {/* Info Grid */}
        <div className="info-grid">
          <div className="info-box">
            <p>Học viên</p>
            <span>{cls.totalStudents}</span>
          </div>

          <div className="info-box">
            <p>Giảng viên</p>
            <span>{cls.totalTeachers}</span>
          </div>

          <div className="info-box">
            <p>Khóa học</p>
            <span>{cls.totalCourses}</span>
          </div>

          <div className="info-box">
            <p>Lịch học</p>
            <span>{cls.scheduleInfo}</span>
          </div>
        </div>

        {/* Date */}
        <div className="date-box">
          <strong>Ngày bắt đầu:</strong> {cls.startDate} <br />
          <strong>Ngày kết thúc:</strong> {cls.endDate}
        </div>

        {/* Status */}
        <span
          className={`status-label ${
            cls.status.toLowerCase()
          }`}
        >
          {cls.status}
        </span>

        {/* Students List */}
        <div className="students-section">
          <h3>Danh sách học viên</h3>
          {(!cls.students || cls.students.length === 0) && (
            <div className="students-empty">Chưa có dữ liệu học viên</div>
          )}
          {cls.students && cls.students.length > 0 && (
            <ul className="students-list">
              {cls.students.map((st) => (
                <li key={st.id} className="student-item">
                  <div className="student-avatar">{String(st.name || "HV").slice(0, 1)}</div>
                  <div className="student-meta">
                    <div className="student-name">{st.name}</div>
                    <div className="student-code">{st.code}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClassDetailPage;
