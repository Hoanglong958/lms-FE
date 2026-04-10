import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ClassesPage.css";
import { FaUserTie, FaRegClock, FaUsers } from "react-icons/fa";
import { classService } from "@utils/classService";
import { classStudentService } from "@utils/classStudentService";
import { classTeacherService } from "@utils/classTeacherService";
import AdminPagination from "@shared/components/Admin/AdminPagination";

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const mapClassesToState = (rawList) => {
    const mapped = rawList.map((c) => {
      // Calculate status dynamically
      let status = "Sắp bắt đầu";
      let statusKey = "UPCOMING";

      const start = c.startDate || c.start_date ? new Date(c.startDate || c.start_date) : null;
      const end = c.endDate || c.end_date ? new Date(c.endDate || c.end_date) : null;
      const now = new Date();

      if (start && end) {
        if (now < start) {
          status = "Sắp bắt đầu";
          statusKey = "UPCOMING";
        } else if (now >= start && now <= end) {
          status = "Đang học";
          statusKey = "ACTIVE";
        } else {
          status = "Đã kết thúc";
          statusKey = "FINISHED";
        }
      } else if (start) {
        // If only start date is known
        if (now < start) {
          status = "Sắp bắt đầu";
          statusKey = "UPCOMING";
        } else {
          status = "Đang học";
          statusKey = "ACTIVE";
        }
      }

      return {
        id: c.id,
        title: c.name || c.className || "Lớp học không tên",
        teacher: c.assignedTeacher || "Chưa phân công",
        status: status, // Use calculated status display string
        statusKey: statusKey, // Keep internal key if needed for styling
        schedule: c.schedule || "Chưa có lịch",
        studentCount: c.studentCount || 0,
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80",
        startDate: c.startDate || c.start_date,
        endDate: c.endDate || c.end_date
      };
    });
    setClasses(mapped);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (mounted) setLoading(true);

        const userStr = localStorage.getItem("loggedInUser");
        let userId = null;
        if (userStr) {
          try {
            userId = JSON.parse(userStr).id;
          } catch (e) {
            console.error("Error parsing user", e);
          }
        }

        if (userId) {
          const res = await classStudentService.getStudentClasses(userId, {
            page: currentPage - 1,
            size: pageSize
          });
          const data = res.data?.data || res.data || {};
          let content = data.content;
          if (!content && Array.isArray(data)) {
            content = data;
          } else if (!content) {
            content = [];
          }

          if (mounted) {
            setTotalPages(data.totalPages || Math.ceil(content.length / pageSize) || 1);
          }

          // Fetch extra details if not returned directly by backend payload
          const enrollmentChecks = await Promise.all(
            content.map(async (item) => {
              try {
                const cls = item.clazz || item.classResponse || item.classDto || item;
                
                let assignedTeacher = cls.assignedTeacher || "Chưa phân công";
                if (!cls.assignedTeacher && (cls.id || cls.classId)) {
                  try {
                    const tRes = await classTeacherService.getClassTeachers(cls.id || cls.classId);
                    const teachers = tRes.data?.data || tRes.data || [];
                    if (teachers.length > 0) {
                      assignedTeacher = teachers.map(t => t.fullName || t.teacherName || t.name).join(", ");
                    }
                  } catch (e) {
                    console.warn("Failed to fetch teacher for class", e);
                  }
                }
                
                let studentCount = cls.studentCount || cls.student_count || 0;
                if (!studentCount && (cls.id || cls.classId)) {
                   try {
                     const sRes = await classStudentService.getClassStudents(cls.id || cls.classId);
                     const students = sRes.data?.data || sRes.data || [];
                     studentCount = students.length;
                   } catch (e) {
                     console.warn("Failed to fetch students");
                   }
                }

                return { ...cls, id: cls.id || cls.classId, assignedTeacher, studentCount };
              } catch (err) {
                return item;
              }
            })
          );

          if (mounted) mapClassesToState(enrollmentChecks);
        } else {
          if (mounted) setClasses([]);
        }

      } catch (err) {
        console.error(err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentPage]);

  const grid = useMemo(() => classes, [classes]);

  return (
    <div className="classes-page">
      <h2 className="page-title1">Danh sách lớp học của bạn</h2>

      <div className="classes-grid">
        {loading && <p>Đang tải lớp học...</p>}
        {!loading && grid.length === 0 && (
          <div className="empty-state">
            <p>Chưa có lớp học nào.</p>
          </div>
        )}
        {!loading &&
          grid.map((cls) => {
            // Determine status helper for class
            let statusClass = "status-upcoming";
            if (cls.status === "Đang học") statusClass = "status-active";
            if (cls.status === "Đã kết thúc") statusClass = "status-finished";

            return (
              <Link
                to={`/classes/${cls.id}`}
                key={cls.id}
                className="class-card"
              >
                <div className="class-image-wrapper">
                  <img src={cls.image} alt={cls.title} className="class-image" />
                  <div className="card-overlay-tags">
                    <span className={`status-badge ${statusClass}`}>
                      {cls.status}
                    </span>
                  </div>
                </div>

                <div className="class-content">
                  <h3 className="class-name">{cls.title}</h3>

                  <div className="class-info-row">
                    <FaUsers className="info-icon" />
                    <span>{cls.studentCount} Học viên</span>
                  </div>

                  <div className="divider-line"></div>

                  <div className="teacher-meta">
                    <div className="teacher-avatar">
                      {String(cls.teacher).charAt(0).toUpperCase()}
                    </div>
                    <span className="teacher-name">{cls.teacher}</span>
                  </div>
                </div>
              </Link>
            )
          })}
      </div>

      {!loading && grid.length > 0 && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

export default ClassesPage;
