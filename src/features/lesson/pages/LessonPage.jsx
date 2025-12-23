// src/features/lesson/pages/LessonPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "@utils/courseService";
import { sessionService } from "@utils/sessionService";
import { lessonService } from "@utils/lessonService";
import { slugify } from "@utils/slugify";
import { useEffect, useState } from "react"; // Bỏ useMemo cho đơn giản

import LessonContentDisplay from "@features/lesson/components/LessonContentDisplay";
import VideoPlayer from "@features/lesson/components/VideoPlayer";
import DocumentViewer from "@features/lesson/components/DocumentViewer";
import QuizComponent from "@features/lesson/components/QuizComponent";

import "./LessonPage.css";

export default function LessonPage() {
  const { courseSlug, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Lấy thông tin Course
  useEffect(() => {
    courseService.getCourses().then((res) => {
      const c = res.data.find(
        (c) => slugify(c.title) === courseSlug || c.slug === courseSlug
      );
      if (!c) return navigate("/courses");
      setCourse(c);
    });
  }, [courseSlug, navigate]);

  // 2. Lấy Sessions và Lessons
  useEffect(() => {
    if (!course?.id) return;
    const loadSessionsAndLessons = async () => {
      try {
        const sessionRes = await sessionService.getSessionsByCourse(course.id);
        const sessionsData = Array.isArray(sessionRes.data)
          ? sessionRes.data
          : [];

        const sessionsWithLessons = await Promise.all(
          sessionsData.map(async (session) => {
            const lessonRes = await lessonService.getLessonsBySession(
              session.id
            );
            return {
              ...session,
              lessons: lessonRes.data || [],
            };
          })
        );
        setSessions(sessionsWithLessons);
      } catch (err) {
        console.error(err);
      }
    };
    loadSessionsAndLessons();
  }, [course]);

  // 3. Tính toán danh sách bài học trực tiếp (Không dùng useMemo để đảm bảo luôn tươi mới)
  const allLessons = sessions.flatMap((s) => s.lessons || []);

  // 4. Redirect nếu vào trang mà chưa có lessonId
  useEffect(() => {
    if (!lessonId && allLessons.length > 0) {
      navigate(`/courses/${courseSlug}/${allLessons[0].id}`, { replace: true });
    }
  }, [lessonId, allLessons, courseSlug, navigate]);

  // 5. Lấy chi tiết bài học hiện tại
  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    lessonService
      .getLesson(lessonId)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setLesson(data);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  // 6. TÍNH TOÁN TIẾN ĐỘ (QUAN TRỌNG)
  // -----------------------------------------------------------------
  // Tìm vị trí bài học hiện tại
  const currentLessonIndex = allLessons.findIndex(
    (l) => String(l.id) === String(lessonId)
  );

  // Logic hiển thị text:
  // - Mặc định là "..."
  // - Nếu tìm thấy index -> hiện "X/Y Bài học"
  let progressText = "...";

  if (allLessons.length > 0 && currentLessonIndex !== -1) {
    progressText = `${currentLessonIndex + 1}/${allLessons.length} Bài học`;
  }
  // -----------------------------------------------------------------

  const handleNavigation = (dir) => {
    const newIndex = currentLessonIndex + dir;
    if (newIndex >= 0 && newIndex < allLessons.length) {
      const nextLesson = allLessons[newIndex];
      navigate(`/courses/${courseSlug}/${nextLesson.id}`);
    }
  };

  // 7. Enrich lesson data with Context (CourseID, SessionID)
  const currentSession = sessions.find(s => s.lessons && s.lessons.some(l => l.id === lesson?.id));
  const enrichedLesson = lesson ? {
    ...lesson,
    courseId: course?.id,
    sessionId: currentSession?.id || lesson.sessionId
  } : null;

  if (loading || !lesson)
    return <div className="lesson-layout">Đang tải bài học...</div>;

  return (
    <div className="lesson-layout">
      {/* Header */}
      <div className="lesson-header-top">
        <div className="breadcrumbs">
          <a href="/courses">Trang chủ</a>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-active">{course?.title}</span>
        </div>

        <div className="lesson-navigation">
          <button
            className="nav-button prev"
            disabled={currentLessonIndex <= 0}
            onClick={() => handleNavigation(-1)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            <span className="nav-text">Bài trước</span>
          </button>

          <button
            className="nav-button next"
            disabled={currentLessonIndex >= allLessons.length - 1}
            onClick={() => handleNavigation(1)}
          >
            <span className="nav-text">Bài tiếp theo</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <LessonContentDisplay
        item={enrichedLesson}
        progress={progressText}
        onNextLesson={() => handleNavigation(1)}
      />


    </div>
  );
}
