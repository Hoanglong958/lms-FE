import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWindowSize from "@hooks/useWindowSize";
import { slugify } from "@utils/slugify";

// Import Services
import { courseService } from "@utils/courseService";
import { sessionService } from "@utils/sessionService";
import { lessonService } from "@utils/lessonService";
import { userProgressService } from "@utils/userProgressService";
import { lessonVideoService } from "@utils/lessonVideoService";
import { lessonQuizService } from "@utils/lessonQuizService";

import "./LessonSidebar.css";

import menuIconSvg from "@assets/icons/hamburger-sidebar-icon.svg";
import dropdownIconSvg from "@assets/icons/arrow-dropdown-sidebar.svg";
import checkIconSvg from "@assets/icons/lesson-type-icons/check-icon.svg";
import documentIconSvg from "@assets/icons/lesson-type-icons/document-icon.svg";
import quizIconSvg from "@assets/icons/lesson-type-icons/quiz-icon.svg";
import videoIconSvg from "@assets/icons/lesson-type-icons/video-icon.svg";
import terminalIconSvg from "@assets/icons/lesson-type-icons/terminal-icon.svg";
import elipsesIconSvg from "@assets/icons/elipse.svg";

// SideItem Component to handle individual data fetching
const SidebarItem = ({ lesson, isActive, isCompleted, progress, isLocked, onClick }) => {
  const [meta, setMeta] = useState(null);

  // Helper to format duration (seconds or string)
  const formatDuration = (val) => {
    if (!val) return "00:00";
    if (typeof val === 'string' && val.includes(':')) return val; // Already HH:MM:SS
    if (!isNaN(val)) {
      // Convert seconds to MM:SS
      const minutes = Math.floor(val / 60);
      const seconds = val % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return val;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchMeta = async () => {
      try {
        const type = (lesson.type || "").toUpperCase();

        if (type === 'VIDEO') {
          const res = await lessonVideoService.getVideosByLesson(lesson.id);
          const videos = res.data || [];
          // console.log(`Sidebar VIDEO [${lesson.id}]:`, videos);
          if (videos.length > 0 && isMounted) {
            // Check what fields we have
            // console.log("Duration raw:", videos[0].duration);
            setMeta({ duration: formatDuration(videos[0].duration) });
          }
        } else if (type === 'QUIZ') {
          const res = await lessonQuizService.getQuizzesByLesson(lesson.id);
          const quizzes = res.data || [];
          // console.log(`Sidebar QUIZ [${lesson.id}]:`, quizzes);
          if (quizzes.length > 0) {
            const q = quizzes[0];
            // Try to use existing questionCount if available
            if (q.questionCount !== undefined && q.questionCount > 0 && isMounted) {
              setMeta({ count: q.questionCount });
              return;
            }

            // Fetch Detail
            try {
              const detail = await lessonQuizService.getQuiz(q.id || q.quizId);
              // console.log(`Quiz Detail [${q.id}]:`, detail.data);
              if (isMounted) {
                setMeta({ count: detail.data?.questionCount || 0 });
              }
            } catch (e) {
              if (isMounted) setMeta({ count: 0 });
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch sidebar item meta", e);
      }
    };
    fetchMeta();
    return () => { isMounted = false; };
  }, [lesson.id, lesson.type]);

  // Icon Selection
  const getItemIcon = () => {
    if (isCompleted) return checkIconSvg;

    const type = (lesson.type || "").toUpperCase();
    switch (type) {
      case "VIDEO": return videoIconSvg;
      case "QUIZ": return quizIconSvg;
      case "DOCUMENT": return documentIconSvg;
      case "TASK": return terminalIconSvg;
      default: return checkIconSvg;
    }
  };

  const renderMeta = () => {
    if (isLocked) return <span>Bị khóa</span>;
    const type = (lesson.type || "").toUpperCase();
    if (type === 'VIDEO') {
      return (
        <>
          <span>Video</span>
          <div className="ls-user-meta-dot"></div>
          <span>{meta?.duration || "00:00"}</span>
        </>
      );
    }
    if (type === 'QUIZ') {
      return (
        <>
          <span>Quiz</span>
          <div className="ls-user-meta-dot"></div>
          <span>{meta?.count !== undefined ? meta.count : 0} câu hỏi</span>
        </>
      );
    }
    if (type === 'DOCUMENT' || type === 'TASK') {
      return <span>Đọc/Bài tập</span>;
    }
    return null;
  };

  return (
    <li
      className={`ls-user-lesson-item ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
      onClick={() => !isLocked && onClick(lesson)}
      style={isLocked ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
    >
      <img
        src={getItemIcon()}
        alt=""
        className="ls-user-item-icon"
        style={isLocked ? { filter: 'grayscale(100%)' } : {}}
      />

      <div className="ls-user-item-content">
        <div className="ls-user-item-title">{lesson.title}</div>
        <div className="ls-user-item-meta">
          {renderMeta()}
        </div>
      </div>

      {!isLocked && progress > 0 && (
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: isCompleted ? '#22c55e' : '#666', fontWeight: isCompleted ? 'bold' : 'normal' }}>
          {progress}%
        </div>
      )}
      {isLocked && (
        <div style={{ marginLeft: 'auto', fontSize: '16px' }}>🔒</div>
      )}
    </li>
  );
};

export default function LessonSidebar({ initialMinimized = false }) {
  const [minimized, setMinimized] = useState(initialMinimized);

  // State lưu dữ liệu API
  const [sidebarData, setSidebarData] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  // const [completedLessons, setCompletedLessons] = useState([]); // REMOVED
  const [progressMap, setProgressMap] = useState({}); // ADDED: id -> percent
  const [courseIdState, setCourseIdState] = useState(null);

  const { width } = useWindowSize();
  const navigate = useNavigate();
  const { courseSlug, lessonId } = useParams();
  const isDesktop = width >= 1440;

  // ===== 1. LOGIC CALL API (Lấy cấu trúc bài học) =====
  useEffect(() => {
    const fetchCourseAndStructure = async () => {
      if (!courseSlug) return;
      try {
        // B1: Tìm Course ID từ Slug
        const courseRes = await courseService.getCourses();
const courses = Array.isArray(courseRes.data)
  ? courseRes.data
  : Array.isArray(courseRes.data?.data)
  ? courseRes.data.data
  : [];

const currentCourse = courses.find(
  (c) => slugify(c.title) === courseSlug || c.slug === courseSlug
);

        if (!currentCourse) return;
        setCourseTitle(currentCourse.title);
        setCourseIdState(currentCourse.id);

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
      } catch (err) {
        console.error("Error fetching course structure:", err);
      }
    };

    fetchCourseAndStructure();
  }, [courseSlug]);

  // ===== 2. LOGIC CALL API (Lấy Progress - Chạy lại khi đổi bài học) =====
  useEffect(() => {
    const fetchProgress = async () => {
      if (!courseIdState) return;

      const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      if (user && user.id) {
        try {
          const progressRes = await userProgressService.getByCourse(user.id, courseIdState);
          const progressData = progressRes.data || [];

          const newMap = {};
          progressData.forEach(p => {
            // Prefer existing higher progress if dupes exist (though API should handle uniqueness)
            const pid = String(p.lessonId);
            const val = p.progressPercent || 0;
            if (!newMap[pid] || val > newMap[pid]) {
              newMap[pid] = val;
            }
          });
          setProgressMap(newMap);

        } catch (e) {
          console.error("Failed to load progress", e);
        }
      }
    };

    fetchProgress();
  }, [courseIdState, lessonId]);

  // ===== 3. COMPUTE LOCKED STATE =====
  // Create a Set of locked IDs
  const lockedLessonIds = React.useMemo(() => {
    const locked = new Set();
    let isAllowed = true; // First lesson is allowed

    for (const session of sidebarData) {
      if (!session.lessons) continue;
      for (const lesson of session.lessons) {
        if (!isAllowed) {
          locked.add(String(lesson.id));
        }

        // Determine if NEXT lesson is allowed
        // It is allowed if CURRENT lesson is completed (>= 100%)
        const p = progressMap[String(lesson.id)] || 0;
        if (p < 100) {
          isAllowed = false;
        }
      }
    }
    return locked;
  }, [sidebarData, progressMap]);

  // ===== 4. XỬ LÝ NAVIGATE =====
  const handleItemClick = (lesson) => {
    if (lockedLessonIds.has(String(lesson.id))) return;
    navigate(`/courses/${courseSlug}/${lesson.id}`);
  };

  return (
    <aside
      className={`ls-user-sidebar ${minimized ? "minimized" : ""}`}
      aria-label="Nội dung bài học"
    >
      {/* HEADER */}
      <div className="ls-user-header">
        <button
          onClick={() => setMinimized((s) => !s)}
          aria-expanded={!minimized}
          className="ls-user-toggle"
        >
          <img src={menuIconSvg} alt="Menu" />
        </button>
        <h3 className="ls-user-title">
          {minimized ? "Nội dung" : "Nội dung bài học"}
        </h3>
      </div>

      {/* LIST SESSIONS */}
      <ul className="ls-user-topic-list">
        {sidebarData.map((session) => (
          <details key={session.id} open className="ls-user-session-block">
            <summary className="ls-user-session-summary">
              <span>{session.title}</span>
              <img
                src={dropdownIconSvg}
                alt=""
                aria-hidden
                className="ls-user-dropdown-icon"
              />
            </summary>

            <ul className="ls-user-lesson-list">
              {session.lessons && session.lessons.map((lesson) => {
                const isActive = String(lesson.id) === String(lessonId);
                const progress = progressMap[String(lesson.id)] || 0;
                const isCompleted = progress >= 100;
                const isLocked = lockedLessonIds.has(String(lesson.id));

                return (
                  <SidebarItem
                    key={lesson.id}
                    lesson={lesson}
                    isActive={isActive}
                    isCompleted={isCompleted}
                    progress={progress}
                    isLocked={isLocked}
                    onClick={handleItemClick}
                  />
                );
              })}

              {session.lessons && session.lessons.length === 0 && (
                <li className="ls-user-item-empty">Trống</li>
              )}
            </ul>
          </details>
        ))}
      </ul>
    </aside>
  );
}
