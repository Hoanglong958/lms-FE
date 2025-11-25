// src/features/lesson/pages/LessonPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "@utils/courseService";
import { sessionService } from "@utils/sessionService";
import { lessonService } from "@utils/lessonService";
import { slugify } from "@utils/slugify";
import { useEffect, useState, useMemo } from "react";

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

  // Lấy course theo slug
  useEffect(() => {
    courseService.getCourses().then((res) => {
      const c = res.data.find(
        (c) => slugify(c.title) === courseSlug || c.slug === courseSlug
      );
      if (!c) return navigate("/courses");
      setCourse(c);
    });
  }, [courseSlug]);

  // Lấy session và lessons theo courseId
  useEffect(() => {
    if (!course?.id) return;
    const loadSessionsAndLessons = async () => {
      const sessionRes = await sessionService.getSessionsByCourse(course.id);
      const sessionsData = Array.isArray(sessionRes.data)
        ? sessionRes.data
        : [];

      const sessionsWithLessons = await Promise.all(
        sessionsData.map(async (session) => {
          const lessonRes = await lessonService.getLessonsBySession(session.id);
          return {
            ...session,
            lessons: lessonRes.data || [],
          };
        })
      );

      setSessions(sessionsWithLessons);
    };
    loadSessionsAndLessons();
  }, [course]);

  // Flatten tất cả lesson từ sessions
  const allLessons = useMemo(() => {
    return sessions.flatMap((s) => s.lessons || []);
  }, [sessions]);

  // Redirect nếu chưa có lessonId
  useEffect(() => {
    if (!lessonId && allLessons.length > 0) {
      navigate(`/courses/${courseSlug}/${allLessons[0].id}`, { replace: true });
    }
  }, [lessonId, allLessons, courseSlug, navigate]);

  // Lấy lesson chi tiết
  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    lessonService
      .getLesson(lessonId)
      .then((res) => setLesson(res.data))
      .finally(() => setLoading(false));
  }, [lessonId]);

  // Tìm index hiện tại
  const currentLessonIndex = allLessons.findIndex(
    (l) => String(l.id) === String(lessonId)
  );
  const handleNavigation = (dir) => {
    const newIndex = currentLessonIndex + dir;
    if (newIndex >= 0 && newIndex < allLessons.length) {
      const nextLesson = allLessons[newIndex];
      navigate(`/courses/${courseSlug}/${nextLesson.id}`);
    }
  };

  if (loading || !lesson)
    return <div className="lesson-layout">Đang tải bài học...</div>;

  return (
    <div className="lesson-layout">
      {/* Header top: Breadcrumb + Nav */}
      <div className="lesson-header-top">
        <div className="breadcrumbs">
          <a href="/courses">Trang chủ</a>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-active">{course.title}</span>
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
            {/* SVG Mũi tên phải */}
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

      {/* Nội dung bài học */}
      <LessonContentDisplay item={lesson} />

      {/* Component theo type */}
      {lesson.type === "video" && <VideoPlayer item={lesson} />}
      {lesson.type === "document" && <DocumentViewer item={lesson} />}
      {lesson.type === "quiz" && <QuizComponent item={lesson} />}
    </div>
  );
}
