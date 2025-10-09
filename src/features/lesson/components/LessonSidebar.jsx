import { useState } from "react";
import menuIconSvg from "@assets/icons/hamburger-sidebar-icon.svg";
import dropdownIconSvg from "@assets/icons/arrow-dropdown-sidebar.svg";
import "./LessonSidebar.css";
import checkIconSvg from "@assets/icons/lesson-type-icons/check-icon.svg";
import documentIconSvg from "@assets/icons/lesson-type-icons/document-icon.svg";
import quizIconSvg from "@assets/icons/lesson-type-icons/quiz-icon.svg";
import videoIconSvg from "@assets/icons/lesson-type-icons/video-icon.svg";
import terminalIconSvg from "@assets/icons/lesson-type-icons/terminal-icon.svg";
import elipsesIconSvg from "@assets/icons/elipse.svg";

export default function LessonSidebar({ initialMinimized = false }) {
  const [minimized, setMinimized] = useState(initialMinimized);

  const sidebarContent = [
    {
      id: "session-1",
      title: "Session 1: Từ vựng",
      lessons: [
        {
          id: "lesson-1-1",
          title: "Lesson 1: Phó từ láy",
          items: [
            {
              id: "1",
              type: "video",
              title: "Form & Table",
              duration: "10:34",
              img: checkIconSvg,
            },
            {
              id: "2",
              type: "video",
              title: "Luyện tập Function",
              duration: "10:34",
              img: documentIconSvg,
            },
            {
              id: "3",
              type: "video",
              title: "Tổng quan về Git",
              duration: "10:34",
              img: videoIconSvg,
            },
            {
              id: "4",
              type: "quiz",
              title: "[Quiz] JS Cơ bản",
              questions: 6,
              img: quizIconSvg,
            },
          ],
        },
        {
          id: "lesson-1-2",
          title: "Lesson 2: Tính từ",
          items: [
            {
              id: "5",
              type: "video",
              title: "Basic HTML Tag",
              duration: "10:34",
              img: videoIconSvg,
            },
            {
              id: "6",
              type: "test",
              title: "[Quiz] JS Nâng cao",
              questions: 6,
              img: quizIconSvg,
            },
          ],
        },
        {
          id: "lesson-1-3",
          title: "Lesson 3: Danh từ",
          items: [
            {
              id: "7",
              type: "video",
              title: "HTML Layout Structure",
              duration: "10:34",
              img: videoIconSvg,
            },
            {
              id: "8",
              type: "quiz",
              title: "[Quiz] JS Cơ bản",
              questions: 6,
              img: quizIconSvg,
            },
            {
              id: "9",
              type: "video",
              title: "HTML in Real World",
              duration: "10:34",
              img: videoIconSvg,
            },
            {
              id: "10",
              type: "quiz",
              title: "[Quiz] Array Methods",
              questions: 6,
              img: videoIconSvg,
            },
          ],
        },
        {
          id: "lesson-1-4",
          title: "Bài tập về nhà",
          items: [
            {
              id: "11",
              type: "task",
              title: "Chia thẻ danh sách",
              img: terminalIconSvg,
            },
            {
              id: "12",
              type: "task",
              title: "Tạo trang CV cá nhân",
              img: terminalIconSvg,
            },
            {
              id: "13",
              type: "task",
              title: "Kết hợp thẻ nav, a để làm menu",
              img: terminalIconSvg,
            },
            {
              id: "14",
              type: "task",
              title: "Thực hành thẻ img",
              img: terminalIconSvg,
            },
          ],
        },
      ],
    },
    {
      id: "session-2",
      title: "Session 2: Chữ Hán",
      lessons: [
        { id: "lesson-2-1", title: "Lesson 1: HTML Introduction", items: [] },
        { id: "lesson-2-2", title: "Lesson 2: HTML Basic", items: [] },
        { id: "lesson-2-3", title: "Lesson 3: Form & Table", items: [] },
      ],
    },
    {
      id: "session-3",
      title: "Session 3: Ngữ pháp",
      lessons: [],
    },
  ];

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
                    <li key={item.id} className="lesson-item">
                      <img
                        src={item.img}
                        alt=""
                        aria-hidden
                        className="lesson-item-icon"
                      />

                      <div className="lesson-item-content">
                        <span className="lesson-item-title">{item.title}</span>

                        {item.type === "video" && (
                          <div className="lesson-item-meta">
                            <span className="lesson-item-type">Video</span>
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
                            <span className="lesson-item-type">Quiz</span>
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
                            <span className="lesson-item-type">Task</span>
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
