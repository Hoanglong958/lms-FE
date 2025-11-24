import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { courseService } from "@utils/courseService.js";
import { sessionService } from "@utils/sessionService.js";
import AdminHeader from "@components/Admin/AdminHeader";
import LessonManager from "./LessonManager.jsx";
import LessonDetailView from "./LessonDetailView.jsx";
import styles from "./ManageLessons.module.css";
import { slugify } from "@utils/slugify";

export default function ManageLessons() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [expandedSessions, setExpandedSessions] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [formData, setFormData] = useState({ title: "" });
  const { toggleSidebar } = useOutletContext() || {};

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await courseService.getCourses();
        const c = res.data.find((c) => slugify(c.title) === courseSlug);
        setCourse(c);
      } catch (err) {
        console.error(err);
        navigate("/admin/courses");
      }
    };
    if (courseSlug) loadCourse();
  }, [courseSlug]);

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

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Xóa chương học này?")) return;
    await sessionService.deleteSession(id);
    setSessions(sessions.filter((s) => s.id !== id));
    if (selectedLesson?.sessionId === id) setSelectedLesson(null);
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

  return (
    <div className={styles.page}>
      <AdminHeader
        title={`Quản lý nội dung cho: ${course?.title || ""}`}
        onMenuToggle={toggleSidebar}
        onBack={() => window.history.back()}
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
                    <button onClick={() => handleEditSession(s)}>Sửa</button>
                    <button onClick={() => handleDeleteSession(s.id)}>
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
          <LessonDetailView lesson={selectedLesson} />
        </section>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{currentSession ? "Sửa Chương học" : "Thêm Chương học"}</h2>
            <form onSubmit={handleSubmitSession}>
              <div className={styles.formGroup}>
                <label>Tên Chương học</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ title: e.target.value })}
                  required
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
                <button type="button" onClick={() => setShowModal(false)}>
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
