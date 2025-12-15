import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ClassesPage.css";
import { FaUserTie, FaRegClock } from "react-icons/fa";
import { classService } from "@utils/classService";
import { classStudentService } from "@utils/classStudentService";

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapClassesToState = (rawList) => {
    const mapped = rawList.map((c) => ({
      id: c.id,
      title: c.name || c.className || "Lớp học không tên",
      teacher: c.instructorName || c.teacherName || "Chưa phân công",
      status: (c.status || "UPCOMING").toLowerCase() === 'active' ? 'Đang học' : 'Sắp bắt đầu',
      schedule: c.schedule || "Chưa có lịch",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80",
    }));
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

        // 1. Fetch ALL classes
        const res = await classService.getClasses();
        const data = res.data?.data?.content || res.data?.data || res.data?.content || res.data || [];
        const allClasses = Array.isArray(data) ? data : [];

        if (userId) {
          // 2. Filter classes by checking student enrollment
          // Since backend doesn't support filter params, we check each class
          const enrollmentChecks = await Promise.all(
            allClasses.map(async (cls) => {
              try {
                const sRes = await classStudentService.getClassStudents(cls.id);
                const students = sRes.data?.data || sRes.data || [];
                // Check if current user is in this list
                // Student record usually has 'studentId'
                const isEnrolled = Array.isArray(students) && students.some(s =>
                  String(s.studentId) === String(userId) || String(s.id) === String(userId)
                );
                return isEnrolled ? cls : null;
              } catch (err) {
                console.warn(`Failed to check students for class ${cls.id}`, err);
                return null;
              }
            })
          );

          // Filter out nulls
          const myClasses = enrollmentChecks.filter(c => c !== null);

          if (mounted) mapClassesToState(myClasses);
        } else {
          // No user logged in, maybe show empty or all? 
          // Request implies "Your classes", so likely empty if not logged in.
          // But to be safe/friendly, let's just show all or empty. 
          // "Danh sách lớp học của bạn" implies ownership.
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
  }, []);

  const grid = useMemo(() => classes, [classes]);

  return (
    <div className="classes-page">
      <h2 className="page-title">Danh sách lớp học của bạn</h2>

      <div className="classes-grid">
        {loading && <p>Đang tải lớp học...</p>}
        {!loading && grid.length === 0 && (
          <p>Chưa có lớp học nào.</p>
        )}
        {!loading &&
          grid.map((cls) => (
            <Link
              to={`/classes/${cls.id}`}
              key={cls.id}
              className="class-card"
            >
              <img src={cls.image} alt="" className="class-image" />

              <div className="class-content">
                <h3 className="class-name">{cls.title}</h3>

                <p className="class-info">
                  <FaUserTie className="icon" />
                  <span className="class-label">Giảng viên:</span>{" "}
                  {cls.teacher}
                </p>

                <p className="class-info">
                  <FaRegClock className="icon" />
                  <span className="class-label">Lịch học:</span>{" "}
                  {cls.schedule}
                </p>

                <span
                  className={`status-badge ${cls.status === "Đang học"
                    ? "status-active"
                    : "status-finished"
                    }`}
                >
                  {cls.status}
                </span>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ClassesPage;
