import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "@utils/courseService";
import { sessionService } from "@utils/sessionService";
import { lessonService } from "@utils/lessonService";
import { slugify } from "@utils/slugify";
import { useEffect, useState, useMemo } from "react";
import LessonContentDisplay from "@features/lesson/components/LessonContentDisplay";

export default function LessonPage() {
  const { courseSlug, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Lấy course theo slug
  useEffect(() => {
    courseService.getCourses().then((res) => {
      const c = res.data.find(
        (c) => slugify(c.title) === courseSlug || c.slug === courseSlug
      );
      if (!c) return navigate("/courses"); // fallback an toàn
      setCourse(c);
    });
  }, [courseSlug]);

  // 2️⃣ Lấy session và lessons theo courseId
  useEffect(() => {
    if (!course?.id) return;
    const loadSessionsAndLessons = async () => {
      try {
        const sessionRes = await sessionService.getSessionsByCourse(course.id);
        const sessionsData = Array.isArray(sessionRes.data) ? sessionRes.data : [];
        
        // Fetch lessons cho từng session
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
      } catch (err) {
        console.error("Lỗi tải sessions và lessons:", err);
      }
    };
    loadSessionsAndLessons();
  }, [course]);

  // 3️⃣ Flatten lessons từ sessions
  const allLessons = useMemo(() => {
    return sessions.flatMap((s) => s.lessons || []);
  }, [sessions]);

  // 4️⃣ Redirect nếu chưa có lessonId
  useEffect(() => {
    if (!lessonId && allLessons.length > 0) {
      navigate(`/courses/${courseSlug}/${allLessons[0].id}`, { replace: true });
    }
  }, [lessonId, allLessons, courseSlug, navigate]);

  // 5️⃣ Lấy lesson chi tiết
  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    lessonService
      .getLesson(lessonId)
      .then((res) => setLesson(res.data))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
  const handleNavigation = (dir) => {
    const newIndex = currentLessonIndex + dir;
    if (newIndex >= 0 && newIndex < allLessons.length) {
      navigate(`/courses/${courseSlug}/${allLessons[newIndex].id}`);
    }
  };

  if (loading || !lesson) return <div>Đang tải bài học...</div>;

  return (
    <div>
      <h2>{lesson.title}</h2>
      <LessonContentDisplay item={lesson} />
      <div>
        <button
          disabled={currentLessonIndex <= 0}
          onClick={() => handleNavigation(-1)}
        >
          Bài trước
        </button>
        <button
          disabled={currentLessonIndex >= allLessons.length - 1}
          onClick={() => handleNavigation(1)}
        >
          Bài tiếp theo
        </button>
      </div>
    </div>
  );
}
