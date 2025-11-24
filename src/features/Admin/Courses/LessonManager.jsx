import React, { useState, useEffect } from "react";
import { lessonService } from "@utils/lessonService.js";
import styles from "./ManageLessons.module.css";

export default function LessonManager({
  sessionId,
  onSelectLesson,
  selectedLessonId,
}) {
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({ title: "", type: "VIDEO" });

  const loadLessons = async () => {
    if (!sessionId) return;
    try {
      const res = await lessonService.getLessonsBySession(sessionId);
      setLessons(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [sessionId]);

  const handleAddLesson = () => {
    setEditingLesson(null);
    setFormData({ title: "", type: "VIDEO" });
    setShowModal(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setFormData({ title: lesson.title, type: lesson.type });
    setShowModal(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Xóa bài học này?")) return;
    try {
      await lessonService.deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l.id !== lessonId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await lessonService.updateLesson(editingLesson.id, {
          title: formData.title,
          type: formData.type,
          sessionId,
        });
      } else {
        await lessonService.addLesson({
          title: formData.title,
          type: formData.type,
          sessionId,
        });
      }
      await loadLessons();
      setShowModal(false);
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
              <span>{lesson.title}</span>
              <span className={styles.lessonTypeBadge}>{lesson.type}</span>
            </button>
            <div className={styles.lessonActions}>
              <button onClick={() => handleEditLesson(lesson)}>Sửa</button>
              <button onClick={() => handleDeleteLesson(lesson.id)}>Xóa</button>
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
            <h2>{editingLesson ? "Sửa Bài học" : "Thêm Bài học"}</h2>
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
                <label>Dạng bài học</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  disabled={!!editingLesson}
                  required
                >
                  <option value="VIDEO">VIDEO</option>
                  <option value="QUIZ">QUIZ</option>
                  <option value="DOCUMENT">DOCUMENT</option>
                </select>
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnPrimary}>
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
