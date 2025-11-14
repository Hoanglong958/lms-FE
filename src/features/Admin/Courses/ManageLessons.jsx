import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useOutletContext,
} from "react-router-dom";

import { courseService } from "@utils/courseService.js";
import { lessonService } from "@utils/lessonService.js";

import AdminHeader from "@components/Admin/AdminHeader";
import styles from "./ManageLessons.module.css";

/* Component con quản lý Bài học */
function LessonManager({
  sessionId,
  onSelectLesson,
  selectedLessonId,
  onLessonsChange,
}) {
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
      setLessons(res.data || []);
      if (onLessonsChange) onLessonsChange(sessionId, res.data || []);
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
    let title = formData.title;
    if (formData.type === "quiz") title = `[Quizz] ${title}`;

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
      console.error("Submit lesson error", err);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (window.confirm("Xóa bài học này?")) {
      try {
        await lessonService.deleteLesson(lessonId);
        await loadLessons();
      } catch (err) {
        console.error("Delete lesson error", err);
      }
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
                  placeholder="Nhập mô tả ngắn gọn về bài học..."
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
                  disabled={!!editingLesson} // giữ nguyên type khi sửa
                >
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="quiz">Quizz</option>
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

/* VideoForm, DocumentForm, QuizForm giữ nguyên như trước */

/* Component chính ManageLessons.jsx */
export default function ManageLessons() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedSections, setExpandedSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [formData, setFormData] = useState({ title: "" });

  const { toggleSidebar } = useOutletContext() || {};

  /* Load course */
  useEffect(() => {
    const foundCourse = courseService.getCourseBySlug(courseSlug);
    if (foundCourse) {
      setCourse(foundCourse);
      setSections(foundCourse.sections || []);
    } else {
      navigate("/admin/courses");
    }
  }, [courseSlug, navigate]);

  /* Section handlers */
  const handleAddSection = () => {
    setCurrentSection(null);
    setFormData({ title: "" });
    setShowModal(true);
  };

  const handleEditSection = (section) => {
    setCurrentSection(section);
    setFormData({ title: section.title });
    setShowModal(true);
  };

  const handleSubmitSection = (e) => {
    e.preventDefault();
    if (currentSection) {
      // giả lập update section
      const updated = sections.map((s) =>
        s.id === currentSection.id ? { ...s, ...formData } : s
      );
      setSections(updated);
    } else {
      const newSec = { id: Date.now(), title: formData.title };
      setSections([...sections, newSec]);
    }
    setShowModal(false);
  };

  const handleDeleteSection = (sectionId) => {
    if (window.confirm("Xóa phân học này?")) {
      setSections(sections.filter((s) => s.id !== sectionId));
      if (selectedLesson?.sessionId === sectionId) setSelectedLesson(null);
    }
  };

  return (
    <div className={styles.page}>
      <AdminHeader
        title={`Quản lý nội dung cho: ${course?.title || ""}`}
        onMenuToggle={toggleSidebar}
        actions={
          <button
            onClick={handleAddSection}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Thêm Phân học
          </button>
        }
      />

      <div className={styles.contentLayout}>
        <aside className={styles.contentSidebar}>
          {sections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            return (
              <div
                key={section.id}
                className={`${styles.sectionPanel} ${
                  isExpanded ? styles.sectionPanelExpanded : ""
                }`}
              >
                <div className={styles.sectionPanelHeader}>
                  <button
                    type="button"
                    className={styles.sectionToggle}
                    onClick={() =>
                      setExpandedSections((prev) =>
                        prev.includes(section.id)
                          ? prev.filter((id) => id !== section.id)
                          : [...prev, section.id]
                      )
                    }
                  >
                    <div className={styles.sectionToggleInfo}>
                      <span className={styles.sectionName}>
                        {section.title}
                      </span>
                    </div>
                    <span className={styles.sectionChevron}>
                      {isExpanded ? "▾" : "▸"}
                    </span>
                  </button>
                  <div className={styles.sectionActions}>
                    <button
                      type="button"
                      onClick={() => handleEditSection(section)}
                      className={styles.sectionActionButton}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(section.id)}
                      className={`${styles.sectionActionButton} ${styles.sectionActionDelete}`}
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <LessonManager
                    sessionId={section.id}
                    onSelectLesson={(lesson) =>
                      setSelectedLesson({ sessionId: section.id, ...lesson })
                    }
                    selectedLessonId={selectedLesson?.id}
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
            <h2>{currentSection ? "Sửa Phân học" : "Thêm Phân học mới"}</h2>
            <form onSubmit={handleSubmitSection}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Tên Phân học</label>
                <input
                  type="text"
                  id="title"
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
}
