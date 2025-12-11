import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./ClassesPage.css";
import { FaUserTie, FaRegClock } from "react-icons/fa";
import { classService } from "@utils/classService";

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await classService.getClasses({ page: 0, size: 1000 });
        const raw = res?.data;
        const apiData = Array.isArray(raw?.data?.content)
          ? raw.data.content
          : Array.isArray(raw?.content)
          ? raw.content
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
          ? raw
          : [];

        const mapped = apiData.map((item) => ({
          id: item.id,
          title:
            item.className || item.name || item.class_name || "Chưa có tên",
          teacher:
            item.instructorName ||
            item.teacher ||
            item.instructor ||
            item.teacherName ||
            "Chưa phân công",
          status:
            item.status === "active" || item.status === "ACTIVE"
              ? "Đang học"
              : item.status === "ended" || item.status === "FINISHED"
              ? "Hoàn thành"
              : "Sắp bắt đầu",
          schedule: item.schedule || item.timetable || "",
          image: item.image || "/anh1.png",
        }));
        if (mounted) setClasses(mapped);
      } catch (e) {
        console.error("Load user classes failed", e);
        if (mounted) setClasses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
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
                className={`status-badge ${
                  cls.status === "Đang học"
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
