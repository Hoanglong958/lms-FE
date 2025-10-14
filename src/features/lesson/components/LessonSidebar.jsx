import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courses } from "@data/courseData";
import useWindowSize from "@hooks/useWindowSize"; // Giả sử hook của bạn ở đây
import "./LessonSidebar.css";

// Import các icon của bạn
import menuIconSvg from "@assets/icons/hamburger-sidebar-icon.svg";
import dropdownIconSvg from "@assets/icons/arrow-dropdown-sidebar.svg";
import elipsesIconSvg from "@assets/icons/elipse.svg";

export default function LessonSidebar({ initialMinimized = false }) {
  const [minimized, setMinimized] = useState(initialMinimized);
  // State mới để quản lý việc xổ danh sách trên mobile/tablet
  const [isListVisible, setListVisible] = useState(false);

  const { width } = useWindowSize();
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const sidebarContent = courses[courseId]?.sessions || [];

  const handleItemClick = (item) => {
    navigate(`/lessons/${courseId}/${item.id}`);
    // Tự động đóng danh sách sau khi chọn bài học trên thiết bị nhỏ
    if (width < 1440) {
      setListVisible(false);
    }
  };

  // Quyết định xem đang ở giao diện desktop hay không
  const isDesktop = width >= 1440;

  return (
    <aside
      className={`
        lesson-sidebar
        ${isDesktop && minimized ? "minimized" : ""}
        ${!isDesktop && isListVisible ? "list-visible" : ""}
      `}
      aria-label="Nội dung bài học"
    >
      {/* Chỉ hiển thị header này trên DESKTOP */}
      {isDesktop && (
        <div className="sidebar-header">
          <button
            onClick={() => setMinimized((s) => !s)}
            aria-expanded={!minimized}
            className="sidebar-toggle"
          >
            <img src={menuIconSvg} alt="Menu" />
          </button>
          <h3 className="sidebar-title">Nội dung bài học</h3>
        </div>
      )}

      {/* Chỉ hiển thị nút này trên TABLET/MOBILE */}
      {!isDesktop && (
        <button
          className="sidebar-mobile-toggle"
          onClick={() => setListVisible((prev) => !prev)}
        >
          <span>Danh sách bài học</span>
          <img
            src={dropdownIconSvg}
            alt="Mở danh sách"
            className="dropdown-icon"
          />
        </button>
      )}

      {/* Danh sách bài học */}
      <ul className="topic-list">
        {/* Nội dung lặp map của bạn giữ nguyên ở đây... */}
        {sidebarContent.map((session) => (
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
            {session.lessons.map((lesson) => (
              <div key={lesson.id} className="lesson-block">
                <div className="lesson-title">{lesson.title}</div>
                <ul className="lesson-items">
                  {lesson.items.map((item) => (
                    <li
                      key={item.id}
                      className={`lesson-item ${
                        item.id === lessonId ? "active" : ""
                      }`}
                      onClick={() => handleItemClick(item)}
                    >
                      <img
                        src={item.img}
                        alt=""
                        aria-hidden
                        className="lesson-item-icon"
                      />
                      <div className="lesson-item-content">
                        <span className="lesson-item-title">{item.title}</span>
                        {/* Meta content */}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        ))}
      </ul>
    </aside>
  );
}
