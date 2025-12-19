import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { classService } from "@utils/classService";
import { classCourseService } from "@utils/classCourseService";
import { classStudentService } from "@utils/classStudentService";
import { slugify } from "@utils/slugify";
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
        setLoading(true);
        const [resDetail, resCourses, resStudents] = await Promise.all([
          classService.getClassDetail(id),
          classCourseService.getClassCourses(id),
          classStudentService.getClassStudents(id)
        ]);

        const raw = resDetail?.data;
        const coursesRaw = resCourses?.data || [];
        // Map courses data
        const courses = Array.isArray(coursesRaw) ? coursesRaw : (coursesRaw.data || []);

        const studentsRaw = resStudents?.data || [];
        const fetchedStudents = Array.isArray(studentsRaw) ? studentsRaw : (studentsRaw.data || []);

        const d = raw?.data || raw?.item || raw?.content || raw || {};
        const endDate = d.endDate || d.end_date || null;
        const startDate = d.startDate || d.start_date || null;
        const scheduleInfo = d.schedule || d.timetable || "";
        // Use fetched students if detail doesn't have them
        const studentsArr = fetchedStudents.length > 0 ? fetchedStudents : (d.students || d.studentList || d.members || []);

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
              : studentsArr.length,
          totalTeachers: d.totalTeachers || 1,
          totalCourses: d.totalCourses || d.coursesCount || 0,
          image,
          students:
            Array.isArray(studentsArr)
              ? studentsArr.map((s) => ({
                id: s.id || s.studentId || s.code || Math.random(),
                name: s.fullName || s.name || s.studentName || "Học viên",
              }))
              : [],
          courses: courses,
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
  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2>Đang tải lớp học...</h2></div>;
  if (!cls) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2>Không tìm thấy lớp học!</h2></div>;

  const statusClass = cls.status === "ACTIVE" ? "status-active" : cls.status === "FINISHED" ? "status-finished" : "status-upcoming";

  const statusMap = {
    "ACTIVE": "Đang học",
    "FINISHED": "Đã kết thúc",
    "UPCOMING": "Sắp bắt đầu",
    "ONGOING": "Sắp bắt đầu" // Mapping per user request, though usually means Active
  };
  const displayStatus = statusMap[cls.status] || cls.status || "Sắp bắt đầu";

  return (
    <div className="class-detail-container">

      {/* HERO SECTION */}
      <div className="cd-hero">
        <div className="cd-hero-bg"></div>
        <div className="cd-header-content">
          <span className={`cd-status-badge ${statusClass}`}>{displayStatus}</span>
          <h1 className="cd-title">{cls.className}</h1>
          <p className="cd-description">{cls.description}</p>

          {/* New Action Buttons */}
          <div className="cd-actions-row">
            <Link to={`/classes/${id}/calendar`} className="cd-btn-action" style={{ textDecoration: 'none' }}>
              <div className="cd-btn-icon-box icon-schedule">📅</div>
              <span>Thời khóa biểu</span>
            </Link>
            <Link to={`/classes/${id}/roadmap`} className="cd-btn-action" style={{ textDecoration: 'none' }}>
              <div className="cd-btn-icon-box icon-path">🗺️</div>
              <span>Lộ trình học</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="cd-sections-grid">
        {/* LEFT COLUMN: COURSES & STUDENTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Courses List */}
          <div className="cd-card">
            <div className="cd-section-title">
              Danh sách khóa học ({cls.totalCourses})
            </div>
            {(!cls.courses || cls.courses.length === 0) && (
              <div className="empty-note">Chưa có khóa học nào được gán vào lớp này.</div>
            )}
            {cls.courses && cls.courses.length > 0 && (
              <div className="courses-list-modern">
                {cls.courses.map((c) => {
                  const courseTitle = c.courseTitle || c.courseName || c.title || "Khóa học";
                  const courseSlug = c.slug || c.courseSlug || slugify(courseTitle);
                  return (
                    <Link to={`/courses/${courseSlug}`} key={c.id} className="course-item-row">
                      <div className="course-code-badge">{c.courseCode || "CODE"}</div>
                      <div className="course-title-row">{courseTitle}</div>
                      <div className="course-arrow">→</div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Students List */}
          <div className="cd-card">
            <div className="cd-section-title">
              Danh sách học viên ({cls.totalStudents})
            </div>
            {(!cls.students || cls.students.length === 0) && (
              <div className="empty-note">Chưa có dữ liệu học viên</div>
            )}
            {cls.students && cls.students.length > 0 && (
              <div className="students-grid">
                {cls.students.map((st) => (
                  <div key={st.id} className="student-card">
                    <div className="st-avatar">{String(st.name || "HV").slice(0, 1)}</div>
                    <div className="st-info">
                      <span className="st-name">{st.name}</span>
                      {st.code && st.code !== "N/A" && (
                        <span className="st-code">{st.code}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="cd-card">
            <div className="cd-section-title">Thông tin chi tiết</div>
            <div>
              <div className="sidebar-info-row">
                <span className="sidebar-label">Ngày bắt đầu</span>
                <span className="sidebar-value">{cls.startDate}</span>
              </div>
              <div className="sidebar-info-row">
                <span className="sidebar-label">Ngày kết thúc</span>
                <span className="sidebar-value">{cls.endDate}</span>
              </div>
              <div className="sidebar-info-row">
                <span className="sidebar-label">Giảng viên</span>
                <span className="sidebar-value">{cls.totalTeachers} GV</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ClassDetailPage;
