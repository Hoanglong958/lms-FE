import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { courseService } from "@utils/courseService.js";
import { sessionService } from "@utils/sessionService.js";
import { lessonService } from "@utils/lessonService";
import AdminHeader from "@components/Admin/AdminHeader";
import LessonManager from "./LessonManager.jsx";
import LessonDetailView from "./LessonDetailView.jsx";
import styles from "./ManageLessons.module.css";
import { slugify } from "@utils/slugify";
import dayjs from "dayjs";
import { FolderPlus, Book, ListOrdered, X, Save } from "lucide-react";

export default function ManageLessons() {
  const { courseSlug, courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [expandedSessions, setExpandedSessions] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [formData, setFormData] = useState({ title: "" });
  const { toggleSidebar } = useOutletContext() || {};
  const [totalLessons, setTotalLessons] = useState(0);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        if (courseId) {
          const res = await courseService.getCourseDetail(courseId);
          setCourse(res.data?.data || res.data);
        } else if (courseSlug) {
          const res = await courseService.getCourses();
          const c = res.data.find((c) => slugify(c.title) === courseSlug);
          setCourse(c);
        }
      } catch (err) {
        // Handle error - maybe stay on page or navigate back depending on context
        console.error("Failed to load course", err);
      }
    };
    if (courseSlug || courseId) loadCourse();
  }, [courseSlug, courseId]);

  useEffect(() => {
    if (!course?.id) return;
    const loadSessions = async () => {
      try {
        const res = await sessionService.getSessionsByCourse(course.id);
        setSessions(res.data || []);
      } catch (err) { }
    };
    loadSessions();
  }, [course]);

  useEffect(() => {
    const loadLessonsCount = async () => {
      if (!sessions.length) return;
      let count = 0;
      for (let s of sessions) {
        try {
          const res = await lessonService.getLessonsBySession(s.id); // gọi GET /lessons?sessionId=s.id
          count += res.data.length;
        } catch (err) { }
      }
      setTotalLessons(count);
    };
    loadLessonsCount();
  }, [sessions]);

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
    } catch (err) { }
  };

  return (
    <div className={styles.page}>
      <AdminHeader
        title={`Quản lý nội dung cho: ${course?.title || ""}`}
        subtitle={course?.description || ""}
        onMenuToggle={toggleSidebar}
        onBack={() => {
          if (courseId) {
            navigate(-1); // Go back to where we came from (likely ClassDetail)
          } else {
            navigate(`/admin/courses`);
          }
        }}
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
                className={`${styles.sectionPanel} ${isExpanded ? styles.sectionPanelExpanded : ""
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
                    selectedLesson={selectedLesson}
                    onSelectLesson={(l) =>
                      setSelectedLesson({ sessionId: s.id, ...l })
                    }
                  />
                )}
              </div>
            );
          })}
        </aside>

        <div className={styles.rightContent}>
          <div className={styles.cardLayout}>
            {course && (
              <>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Ngày tạo</h3>
                  <p className={styles.cardDescription}>
                    {dayjs(course.createdAt).format("DD/MM/YYYY")}
                  </p>
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Tổng số session</h3>
                  <p className={styles.cardDescription}>{sessions.length}</p>
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Tổng số lesson</h3>
                  <p className={styles.cardDescription}>{totalLessons}</p>
                </div>
              </>
            )}
          </div>

          <section className={styles.contentDetail}>
            <LessonDetailView
              lesson={selectedLesson}
              onLessonUpdated={(updated) =>
                setSelectedLesson((prev) => ({ ...prev, ...updated }))
              }
            />
          </section>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeaderOrange}>
              <div className={styles.modalHeaderIcon}>
                <FolderPlus size={32} color="white" strokeWidth={1.5} />
              </div>
              <h3>{currentSession ? "Cập nhật chương học" : "Thêm Chương học"}</h3>
            </div>

            <form onSubmit={handleSubmitSession} className={styles.modalFormBody}>
              <div className={styles.formGroup}>
                <label className={styles.labelBold}>Tên Chương học</label>
                <div className={styles.inputWithIcon}>
                  <Book size={24} className={styles.inputIcon} />
                  <input
                    className={styles.customInputModal}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nhập tên chương học..."
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.labelBold}>Thứ tự</label>
                <div className={styles.inputWithIcon}>
                  <ListOrdered size={24} className={styles.inputIcon} />
                  <input
                    type="number"
                    className={styles.customInputModal}
                    value={formData.orderIndex || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderIndex: Number(e.target.value),
                      })
                    }
                    placeholder="Ví dụ: 1, 2, 3..."
                    min={1}
                  />
                </div>
              </div>

              <div className={styles.modalFooterButtons}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.btnCancel}>
                  <X size={18} /> Hủy
                </button>
                <button type="submit" className={styles.btnSave}>
                  <Save size={18} /> Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
