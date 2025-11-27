import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWindowSize from "@hooks/useWindowSize";
import { slugify } from "@utils/slugify";

// Import Services
import { courseService } from "@utils/courseService";
import { sessionService } from "@utils/sessionService";
import { lessonService } from "@utils/lessonService";

import "./LessonSidebar.css";

// ===== IMPORT ICONS (Giữ nguyên như file gốc của bạn) =====
import menuIconSvg from "@assets/icons/hamburger-sidebar-icon.svg";
import dropdownIconSvg from "@assets/icons/arrow-dropdown-sidebar.svg";
import checkIconSvg from "@assets/icons/lesson-type-icons/check-icon.svg";
import documentIconSvg from "@assets/icons/lesson-type-icons/document-icon.svg";
import quizIconSvg from "@assets/icons/lesson-type-icons/quiz-icon.svg";
import videoIconSvg from "@assets/icons/lesson-type-icons/video-icon.svg";
import terminalIconSvg from "@assets/icons/lesson-type-icons/terminal-icon.svg";
import elipsesIconSvg from "@assets/icons/elipse.svg";

export default function LessonSidebar({ initialMinimized = false }) {
  const [minimized, setMinimized] = useState(initialMinimized);

  // State lưu dữ liệu API
  const [sidebarData, setSidebarData] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");

  const { width } = useWindowSize();
  const navigate = useNavigate();
  const { courseSlug, lessonId } = useParams();
  const isDesktop = width >= 1440;

  // ===== 1. LOGIC CALL API (Lấy dữ liệu thật) =====
  useEffect(() => {
    const fetchSidebarData = async () => {
      if (!courseSlug) return;
      try {
        // B1: Tìm Course ID từ Slug
        const courseRes = await courseService.getCourses();
        const currentCourse = courseRes.data.find(
          (c) => slugify(c.title) === courseSlug || c.slug === courseSlug
        );

        if (!currentCourse) return;
        setCourseTitle(currentCourse.title);

        // B2: Lấy Sessions
        const sessionRes = await sessionService.getSessionsByCourse(
          currentCourse.id
        );
        const sessions = sessionRes.data || [];

        // B3: Lấy Lessons cho từng Session
        const fullData = await Promise.all(
          sessions.map(async (session) => {
            const lessonRes = await lessonService.getLessonsBySession(
              session.id
            );
            return {
              ...session,
              lessons: lessonRes.data || [],
            };
          })
        );

        // Sắp xếp theo thứ tự
        fullData.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        setSidebarData(fullData);
      } catch (err) {}
    };

    fetchSidebarData();
  }, [courseSlug]);

  // ===== 2. HELPER: CHỌN ICON THEO TYPE =====
  const getLessonIcon = (type) => {
    switch (type) {
      case "VIDEO":
        return videoIconSvg;
      case "QUIZ":
        return quizIconSvg;
      case "DOCUMENT":
        return documentIconSvg;
      case "TASK":
        return terminalIconSvg;
      default:
        return checkIconSvg; // Icon mặc định
    }
  };

  // ===== 3. XỬ LÝ NAVIGATE =====
  const handleItemClick = (lesson) => {
    navigate(`/courses/${courseSlug}/${lesson.id}`);
  };

  return (
    <aside
      className={`lesson-sidebar ${minimized ? "minimized" : ""}`}
      aria-label="Nội dung bài học"
    >
      {/* HEADER */}
      <div className="sidebar-header">
        <button
          onClick={() => setMinimized((s) => !s)}
          aria-expanded={!minimized}
          className="sidebar-toggle"
        >
          <img src={menuIconSvg} alt="Menu" />
        </button>
        <h3 className="sidebar-title">
          {/* Hiển thị tên khóa học hoặc title mặc định */}
          {minimized ? "Nội dung" : "Nội dung bài học"}
        </h3>
      </div>

      {/* LIST SESSIONS */}
      <ul className="topic-list">
        {sidebarData.map((session) => (
          <details key={session.id} open className="session-block">
            <summary>
              <span className="session-summary-title">{session.title}</span>
              <img
                src={dropdownIconSvg}
                alt=""
                aria-hidden
                className="dropdown-icon session-dropdown-icon"
              />
            </summary>

            {/* Lưu ý: Cấu trúc file gốc của bạn là: Session -> Lesson Group -> Items
               Nhưng API hiện tại là: Session -> Lessons.
               Để giữ đúng CSS class 'lesson-block', tôi bọc danh sách bài học vào div này.
            */}
            <div className="lesson-block">
              {/* <div className="lesson-title">...</div> (Có thể thêm title con nếu API hỗ trợ) */}

              <ul className="lesson-items">
                {session.lessons &&
                  session.lessons.map((lesson) => {
                    // Kiểm tra active
                    const isActive = String(lesson.id) === String(lessonId);
                    const iconSrc = getLessonIcon(lesson.type);

                    return (
                      <li
                        key={lesson.id}
                        className={`lesson-item ${isActive ? "active" : ""}`} // Nếu file CSS bạn có class .active
                        onClick={() => handleItemClick(lesson)}
                      >
                        {/* ICON CHÍNH CỦA BÀI HỌC */}
                        <img
                          src={iconSrc}
                          alt=""
                          aria-hidden
                          className="lesson-item-icon"
                        />

                        <div className="lesson-item-content">
                          <span className="lesson-item-title">
                            {lesson.title}
                          </span>

                          {/* === META INFO: VIDEO === */}
                          {lesson.type === "VIDEO" && (
                            <div className="lesson-item-meta">
                              <span className="lesson-item-type">Video</span>
                              <img
                                src={elipsesIconSvg}
                                alt=""
                                className="elipse"
                              />
                              <span>
                                {lesson.duration ? lesson.duration : "00:00"}
                              </span>
                            </div>
                          )}

                          {/* === META INFO: QUIZ === */}
                          {lesson.type === "QUIZ" && (
                            <div className="lesson-item-meta">
                              <span className="lesson-item-type">Quiz</span>
                              <img
                                src={elipsesIconSvg}
                                alt=""
                                className="elipse"
                              />
                              {/* Giả sử API trả về field 'questions', nếu không có thì ẩn hoặc hardcode */}
                              <span>{lesson.questions || 0} câu hỏi</span>
                            </div>
                          )}

                          {/* === META INFO: DOCUMENT/TASK === */}
                          {(lesson.type === "DOCUMENT" ||
                            lesson.type === "TASK") && (
                            <div className="lesson-item-meta">
                              <span className="lesson-item-type">
                                Đọc/Bài tập
                              </span>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}

                {/* Xử lý khi không có bài học */}
                {session.lessons && session.lessons.length === 0 && (
                  <li
                    className="lesson-item"
                    style={{ cursor: "default", opacity: 0.6 }}
                  >
                    <div
                      className="lesson-item-content"
                      style={{ paddingLeft: "10px" }}
                    >
                      Trống
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </details>
        ))}
      </ul>
    </aside>
  );
}
