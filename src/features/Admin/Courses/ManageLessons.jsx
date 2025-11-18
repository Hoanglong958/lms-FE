import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { courseService } from "@utils/courseService.js";
import { sessionService } from "@utils/sessionService.js";
import AdminHeader from "@components/Admin/AdminHeader";
import styles from "./ManageLessons.module.css";
import { slugify } from "@utils/slugify";
import LessonManager from "./LessonManager.jsx";

export default function ManageLessons() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [formData, setFormData] = useState({ title: "" });

  const { toggleSidebar } = useOutletContext() || {};

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await courseService.getCourses();
        const course = res.data.find((c) => slugify(c.title) === courseSlug);
        setCourse(course);
      } catch (err) {
        console.error(err);
        navigate("/admin/courses");
      }
    };
    if (courseSlug) loadCourse();
  }, [courseSlug, navigate]);

  useEffect(() => {
    if (!course?.id) return;
    const loadSessions = async () => {
      try {
        const res = await sessionService.getSessionsByCourse(course.id);
        setSessions(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadSessions();
  }, [course]);

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
    if (!course) return;

    const payload = {
      title: formData.title,
      duration: formData.duration || 0,
      courseId: course.id,
      orderIndex: formData.orderIndex || sessions.length + 1,
    };

    try {
      if (currentSession) {
        await sessionService.updateSession(currentSession.id, payload);
        setSessions(
          sessions.map((s) =>
            s.id === currentSession.id ? { ...s, ...payload } : s
          )
        );
      } else {
        const res = await sessionService.addSession(payload);
        setSessions([...sessions, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
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
        onBack={() => window.history.back()} // <-- Nút quay về
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
                <label>Thời lượng (phút)</label>
                <input
                  type="number"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: Number(e.target.value),
                    })
                  }
                  min={0}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Thứ tự</label>
                <input
                  type="number"
                  value={formData.orderIndex || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      orderIndex: Number(e.target.value),
                    })
                  }
                  min={1}
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
}
