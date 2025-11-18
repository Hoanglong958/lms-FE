import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { courseService } from "@utils/courseService.js";
import { sessionService } from "@utils/sessionService.js";
import { lessonService } from "@utils/lessonService.js";
import { lessonQuizService as quizService } from "@utils/lessonQuizService.js";
import { lessonVideoService as videoService } from "@utils/lessonVideoService.js";
import AdminHeader from "@components/Admin/AdminHeader";
import styles from "./ManageLessons.module.css";

// ================= Lesson Forms =================
function VideoForm({ formData, setFormData }) {
  return (
    <div className={styles.formGroup}>
      <label>Video URL</label>
      <input
        type="text"
        value={formData.content.url || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            content: { ...formData.content, url: e.target.value },
          })
        }
        placeholder="https://..."
        required
      />
    </div>
  );
}

function DocumentForm({ formData, setFormData }) {
  return (
    <div className={styles.formGroup}>
      <label>Document URL</label>
      <input
        type="text"
        value={formData.content.url || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            content: { ...formData.content, url: e.target.value },
          })
        }
        placeholder="https://..."
        required
      />
    </div>
  );
}

function QuizForm({ formData, setFormData }) {
  const handleQuestionChange = (idx, field, value) => {
    const questions = [...(formData.content.questions || [])];
    questions[idx] = { ...questions[idx], [field]: value };
    setFormData({ ...formData, content: { questions } });
  };
  const addQuestion = () => {
    const questions = [...(formData.content.questions || [])];
    questions.push({ question: "", answers: ["", "", ""], correct: 0 });
    setFormData({ ...formData, content: { questions } });
  };
  const removeQuestion = (idx) => {
    const questions = [...(formData.content.questions || [])];
    questions.splice(idx, 1);
    setFormData({ ...formData, content: { questions } });
  };

  return (
    <div className={styles.formGroup}>
      <label>Quiz Questions</label>
      {(formData.content.questions || []).map((q, idx) => (
        <div key={idx} className={styles.quizQuestion}>
          <input
            type="text"
            value={q.question}
            onChange={(e) =>
              handleQuestionChange(idx, "question", e.target.value)
            }
            placeholder="Question..."
            required
          />
          {q.answers.map((a, i) => (
            <input
              key={i}
              type="text"
              value={a}
              onChange={(e) => {
                const newAnswers = [...q.answers];
                newAnswers[i] = e.target.value;
                handleQuestionChange(idx, "answers", newAnswers);
              }}
              placeholder={`Answer ${i + 1}`}
              required
            />
          ))}
          <select
            value={q.correct}
            onChange={(e) =>
              handleQuestionChange(idx, "correct", Number(e.target.value))
            }
          >
            {q.answers.map((_, i) => (
              <option key={i} value={i}>
                Correct: {i + 1}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => removeQuestion(idx)}>
            Xóa câu hỏi
          </button>
        </div>
      ))}
      <button type="button" onClick={addQuestion}>
        + Thêm câu hỏi
      </button>
    </div>
  );
}

// ================= Lesson Manager =================
function LessonManager({ sessionId, onSelectLesson, selectedLessonId }) {
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
    content: {},
  });

  const loadLessons = async () => {
    try {
      const res = await lessonService.getLessonsBySession(sessionId);
      const data = await Promise.all(
        (res.data || []).map(async (l) => {
          if (l.type === "video") {
            const r = await videoService.getVideosByLesson(l.id);
            return { ...l, content: r.data[0] || {} };
          } else if (l.type === "quiz") {
            const r = await quizService.getQuizzesByLesson(l.id);
            return { ...l, content: { questions: r.data || [] } };
          }
          return l;
        })
      );
      setLessons(data);
    } catch (err) {
      console.error("Load lessons error", err);
    }
  };

  useEffect(() => {
    if (sessionId) loadLessons();
  }, [sessionId]);

  const handleAddLesson = () => {
    setEditingLesson(null);
    setFormData({ title: "", description: "", type: "video", content: {} });
    setShowModal(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title.replace(/^\[Quizz\]\s*/, ""),
      description: lesson.description || "",
      type: lesson.type || "video",
      content: lesson.content || {},
    });
    setShowModal(true);
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();
    const title =
      formData.type === "quiz" ? `[Quizz] ${formData.title}` : formData.title;
    try {
      if (editingLesson) {
        await lessonService.updateLesson(editingLesson.id, {
          ...formData,
          title,
        });
      } else {
        await lessonService.addLesson({ sessionId, ...formData, title });
      }
      await loadLessons();
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Xóa bài học này?")) return;
    try {
      await lessonService.deleteLesson(lessonId);
      await loadLessons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <ul className={styles.lessonList}>
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className={`${styles.lessonListItem} ${
              selectedLessonId === lesson.id ? styles.lessonListItemActive : ""
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectLesson?.(lesson)}
              className={styles.lessonTitleButton}
            >
              <span className={styles.lessonTitle}>{lesson.title}</span>
              <span
                className={`${styles.lessonTypeBadge} ${
                  lesson.type === "video"
                    ? styles.badgeVideo
                    : lesson.type === "document"
                    ? styles.badgeDocument
                    : styles.badgeQuiz
                }`}
              >
                {lesson.type.toUpperCase()}
              </span>
            </button>
            <div className={styles.lessonActions}>
              <button
                type="button"
                onClick={() => handleEditLesson(lesson)}
                className={styles.edit}
              >
                Sửa
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLesson(lesson.id)}
                className={styles.delete}
              >
                Xóa
              </button>
            </div>
          </li>
        ))}
        <li>
          <button onClick={handleAddLesson} className={styles.btnAddLesson}>
            + Thêm bài học
          </button>
        </li>
      </ul>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingLesson ? "Sửa Bài học" : "Thêm Bài học mới"}</h2>
            <form onSubmit={handleSubmitLesson}>
              <div className={styles.formGroup}>
                <label>Tiêu đề</label>
                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Dạng bài học</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      content: {},
                    })
                  }
                  required
                  disabled={!!editingLesson}
                >
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              {formData.type === "video" && (
                <VideoForm formData={formData} setFormData={setFormData} />
              )}
              {formData.type === "document" && (
                <DocumentForm formData={formData} setFormData={setFormData} />
              )}
              {formData.type === "quiz" && (
                <QuizForm formData={formData} setFormData={setFormData} />
              )}
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.btn}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ================= Main ManageLessons =================
export default function ManageLessons() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [formData, setFormData] = useState({ title: "" });

  const { toggleSidebar } = useOutletContext() || {};

  // load course
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await courseService.getCourse(courseId);
        setCourse(res.data);
      } catch (err) {
        console.error(err);
        navigate("/admin/courses");
      }
    };
    if (courseId) loadCourse();
  }, [courseId, navigate]);

  // load sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await sessionService.getSessionsByCourse(courseId);
        setSessions(res.data || []);
      } catch (err) {
        console.error("Load sessions error", err);
      }
    };
    if (courseId) loadSessions();
  }, [courseId]);

  // session handlers
  const handleAddSession = () => {
    setCurrentSession(null);
    setFormData({ title: "" });
    setShowModal(true);
  };
  const handleEditSession = (s) => {
    setCurrentSession(s);
    setFormData({ title: s.title });
    setShowModal(true);
  };
  const handleSubmitSession = async (e) => {
    e.preventDefault();
    if (currentSession) {
      await sessionService.updateSession(currentSession.id, formData);
      setSessions(
        sessions.map((s) =>
          s.id === currentSession.id ? { ...s, ...formData } : s
        )
      );
    } else {
      const res = await sessionService.addSession({ courseId, ...formData });
      setSessions([...sessions, res.data]);
    }
    setShowModal(false);
  };
  const handleDeleteSession = async (id) => {
    if (!window.confirm("Xóa chương học này?")) return;
    await sessionService.deleteSession(id);
    setSessions(sessions.filter((s) => s.id !== id));
    if (selectedLesson?.sessionId === id) setSelectedLesson(null);
  };

  return (
    <div className={styles.page}>
      <AdminHeader
        title={`Quản lý nội dung cho: ${course?.title || ""}`}
        onMenuToggle={toggleSidebar}
        actions={
          <button
            onClick={handleAddSession}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Thêm Chương học
          </button>
        }
      />
      <div className={styles.contentLayout}>
        <aside className={styles.contentSidebar}>
          {sessions.map((s) => {
            const isExpanded = expandedSessions.includes(s.id);
            return (
              <div
                key={s.id}
                className={`${styles.sectionPanel} ${
                  isExpanded ? styles.sectionPanelExpanded : ""
                }`}
              >
                <div className={styles.sectionPanelHeader}>
                  <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() =>
                      setExpandedSessions((prev) =>
                        prev.includes(s.id)
                          ? prev.filter((id) => id !== s.id)
                          : [...prev, s.id]
                      )
                    }
                  >
                    <span className={styles.sectionName}>{s.title}</span>
                    <span className={styles.sectionChevron}>
                      {isExpanded ? "▾" : "▸"}
                    </span>
                  </button>
                  <div className={styles.sectionActions}>
                    <button
                      type="button"
                      onClick={() => handleEditSession(s)}
                      className={styles.sectionActionButton}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(s.id)}
                      className={`${styles.sectionActionButton} ${styles.sectionActionDelete}`}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <LessonManager
                    sessionId={s.id}
                    selectedLessonId={selectedLesson?.id}
                    onSelectLesson={(l) =>
                      setSelectedLesson({ sessionId: s.id, ...l })
                    }
                  />
                )}
              </div>
            );
          })}
        </aside>
        <section className={styles.contentDetail}>
          {selectedLesson ? (
            <div className={styles.detailWrapper}>
              <h2>{selectedLesson.title}</h2>
              <p>{selectedLesson.description}</p>
            </div>
          ) : (
            <div className={styles.detailPlaceholder}>
              <h3>Chọn một bài học để xem chi tiết</h3>
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{currentSession ? "Sửa Chương học" : "Thêm Chương học mới"}</h2>
            <form onSubmit={handleSubmitSession}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Tên Chương học</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ title: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.btn}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  console.log("TOKEN FE ĐANG GỬI:", localStorage.getItem("accessToken"));
}
