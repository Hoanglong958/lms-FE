import React, { useState } from "react";
// Bước 2.1: Import các hook cần thiết từ React Router
import { useNavigate, useParams } from "react-router-dom";
// Import dữ liệu chung mà chúng ta đã tạo
import { courses } from "@data/courseData";
import "./LessonSidebar.css";

// Import các icon của bạn
import menuIconSvg from "@assets/icons/hamburger-sidebar-icon.svg";
import dropdownIconSvg from "@assets/icons/arrow-dropdown-sidebar.svg";
import elipsesIconSvg from "@assets/icons/elipse.svg";

export default function LessonSidebar({ initialMinimized = false }) {
  const [minimized, setMinimized] = useState(initialMinimized);

  // Bước 2.2: Lấy các hook để sử dụng
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams(); // Lấy courseId và lessonId từ URL

  // Bước 2.3: Lấy đúng danh sách bài học dựa trên courseId từ URL
  const sidebarContent = courses[courseId]?.sessions || [];

  // Bước 2.4: Tạo hàm để xử lý khi người dùng click vào một bài học
  const handleItemClick = (item) => {
    // Dùng navigate để chuyển URL đến bài học tương ứng
    navigate(`/lessons/${courseId}/${item.id}`);
  };

  return (
    <aside
      className={`lesson-sidebar ${minimized ? "minimized" : ""}`}
      aria-label="Nội dung bài học"
    >
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

      <ul className="topic-list">
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
                    // Bước 2.5: Thêm onClick và class 'active' động
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
                        {/* ... Phần render meta (video, quiz, task) giữ nguyên ... */}
                        {item.type === "video" && (
                          <div className="lesson-item-meta">
                            <span>Video</span>
                            <img
                              src={elipsesIconSvg}
                              alt=""
                              className="elipse"
                            />
                            <span>{item.duration}</span>
                          </div>
                        )}
                        {item.type === "quiz" && (
                          <div className="lesson-item-meta">
                            <span>Quiz</span>
                            <img
                              src={elipsesIconSvg}
                              alt=""
                              className="elipse"
                            />
                            <span>{item.questions} câu hỏi</span>
                          </div>
                        )}
                        {item.type === "task" && (
                          <div className="lesson-item-meta">
                            <span>Task</span>
                          </div>
                        )}
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
