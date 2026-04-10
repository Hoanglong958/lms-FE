// src/features/lesson/pages/LessonPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "@utils/courseService";
import { sessionService } from "@utils/sessionService";
import { lessonService } from "@utils/lessonService";
import { userProgressService } from "@utils/userProgressService";
import { slugify } from "@utils/slugify";
import { useEffect, useState, useMemo } from "react";

import LessonContentDisplay from "@features/lesson/components/LessonContentDisplay";
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
      const courses = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      const c = courses.find(
        (c) => slugify(c.title) === courseSlug || c.slug === courseSlug
      );
      if (!c) return navigate("/home");
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
        if (sessionsWithLessons.flatMap(s => s.lessons || []).length === 0) {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    loadSessionsAndLessons();
  }, [course]);

  // 3. Tính toán danh sách bài học trực tiếp
  const allLessons = useMemo(
    () => sessions.flatMap((s) => s.lessons || []),
    [sessions]
  );

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
        if (!data) {
          setLesson(null);
        } else {
          setLesson(data);
        }
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  // 6. Tính toán tiến độ
  const currentLessonIndex = allLessons.findIndex(
    (l) => String(l.id) === String(lessonId)
  );

  let progressText = "...";
  if (allLessons.length > 0 && currentLessonIndex !== -1) {
    progressText = `${currentLessonIndex + 1}/${allLessons.length} Bài học`;
  }

  // 7. Access control
  useEffect(() => {
    if (!course || allLessons.length === 0 || !lessonId) return;

    const checkAccess = async () => {
      const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      if (!user.id) return;

      try {
        const res = await userProgressService.getByCourse(user.id, course.id);
        const progressMap = {};
        (res.data || []).forEach(p => {
          const pid = String(p.lessonId);
          if (!progressMap[pid] || p.progressPercent > progressMap[pid]) {
            progressMap[pid] = p.progressPercent;
          }
        });

        const currentIndex = allLessons.findIndex(l => String(l.id) === String(lessonId));
        if (currentIndex === -1) return;

        let firstIncompleteIndex = -1;
        for (let i = 0; i < allLessons.length; i++) {
          const lid = String(allLessons[i].id);
          const p = progressMap[lid] || 0;
          if (p < 100) {
            firstIncompleteIndex = i;
            break;
          }
        }

        if (firstIncompleteIndex !== -1 && currentIndex > firstIncompleteIndex) {
          navigate(`/courses/${courseSlug}/${allLessons[firstIncompleteIndex].id}`, { replace: true });
        }

      } catch (e) { console.error("Access check failed", e); }
    };
    checkAccess();
  }, [lessonId, allLessons, course, courseSlug, navigate]);

  const handleNavigation = (dir) => {
    const newIndex = currentLessonIndex + dir;
    if (newIndex >= 0 && newIndex < allLessons.length) {
      const nextLesson = allLessons[newIndex];
      navigate(`/courses/${courseSlug}/${nextLesson.id}`);
    }
  };

  const currentSession = sessions.find(s => s.lessons && s.lessons.some(l => l.id === lesson?.id));
  const enrichedLesson = lesson ? {
    ...lesson,
    courseId: course?.id,
    sessionId: currentSession?.id || lesson?.sessionId
  } : null;

  // Render
  if (loading) {
    return <div className="lesson-layout">Đang tải bài học...</div>;
  }

  if (allLessons.length === 0) {
    return (
      <div className="lesson-layout" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '100px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📚</div>
        <h2 style={{ color: '#374151', marginBottom: '10px' }}>Hiện tại khóa học chưa có bài học nào</h2>
        <p style={{ color: '#6b7280' }}>Vui lòng quay lại sau khi giảng viên cập nhật nội dung.</p>
        <button 
          onClick={() => navigate('/home')}
          style={{
            marginTop: '20px',
            padding: '10px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (!lesson) {
    return <div className="lesson-layout">Không tìm thấy bài học này</div>;
  }

  return (
    <div className="lesson-layout">
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
