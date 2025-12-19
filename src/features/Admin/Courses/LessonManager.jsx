import React, { useState, useEffect } from "react";
import { lessonService } from "@utils/lessonService.js";
import { sessionExerciseService } from "@utils/sessionExerciseService";
import styles from "./ManageLessons.module.css";

export default function LessonManager({
  sessionId,
  onSelectLesson,
  selectedLesson,
}) {
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({ title: "", type: "VIDEO" });
  const [exercises, setExercises] = useState([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseFormData, setExerciseFormData] = useState({
    title: "",
    instructions: "",
    requiredFields: "",
    exampleCode: "",
    notes: "",
  });

  const loadLessons = async () => {
    if (!sessionId) return;
    try {
      const res = await lessonService.getLessonsBySession(sessionId);
      setLessons(res.data || []);
    } catch (err) { }
  };

  const loadExercises = async () => {
    if (!sessionId) return;
    try {
      const res = await sessionExerciseService.getSessionExercises(sessionId);
      setExercises(res.data || []);
    } catch (err) { }
  };

  useEffect(() => {
    loadLessons();
    loadExercises();
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
    } catch (err) { }
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
    } catch (err) { }
  };

  const handleAddExercise = () => {
    setEditingExercise(null);
    setExerciseFormData({
      title: "",
      instructions: "",
      requiredFields: "",
      exampleCode: "",
      notes: "",
    });
    setShowExerciseModal(true);
  };

  const handleEditExercise = (exercise) => {
    setEditingExercise(exercise);
    setExerciseFormData({
      title: exercise.title,
      instructions: exercise.instructions || "",
      requiredFields: exercise.requiredFields || "",
      exampleCode: exercise.exampleCode || "",
      notes: exercise.notes || "",
    });
    setShowExerciseModal(true);
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm("Xóa bài tập này?")) return;
    try {
      await sessionExerciseService.deleteSessionExercise(exerciseId);
      setExercises(exercises.filter((e) => e.exerciseId !== exerciseId));
    } catch (err) { }
  };

  const handleSubmitExercise = async (e) => {
    e.preventDefault();
    try {
      if (editingExercise) {
        await sessionExerciseService.updateSessionExercise(
          editingExercise.exerciseId,
          {
            ...exerciseFormData,
            sessionId,
          }
        );

        // Notify parent if the updated exercise is the currently selected one
        if (
          selectedLesson?.id === editingExercise.exerciseId &&
          selectedLesson?.type === "EXERCISE"
        ) {
          onSelectLesson?.({
            ...selectedLesson,
            ...exerciseFormData,
          });
        }

      } else {
        await sessionExerciseService.createSessionExercise({
          ...exerciseFormData,
          sessionId,
        });
      }
      await loadExercises();
      setShowExerciseModal(false);
    } catch (err) { }
  };

  return (
    <>
      <ul className={styles.lessonList}>
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className={`${styles.lessonListItem} ${selectedLesson?.id === lesson.id && selectedLesson?.type !== "EXERCISE"
              ? styles.lessonListItemActive
              : ""
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
        {exercises.map((exercise) => (
          <li
            key={`ex-${exercise.exerciseId}`}
            className={`${styles.lessonListItem} ${selectedLesson?.id === exercise.exerciseId &&
              selectedLesson?.type === "EXERCISE"
              ? styles.lessonListItemActive
              : ""
              }`}
          >
            <button
              type="button"
              className={styles.lessonTitleButton}
              onClick={() =>
                onSelectLesson?.({
                  ...exercise,
                  type: "EXERCISE",
                  id: exercise.exerciseId,
                })
              }
            >
              <span>{exercise.title}</span>
              <span className={styles.lessonTypeBadge}>EXERCISE</span>
            </button>
            <div className={styles.lessonActions}>
              <button onClick={() => handleEditExercise(exercise)}>
                Sửa
              </button>
              <button onClick={() => handleDeleteExercise(exercise.exerciseId)}>Xóa</button>
            </div>
          </li>
        ))}
        <li>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleAddLesson} className={styles.btnAddLesson}>
              + Thêm bài học
            </button>
            <button onClick={handleAddExercise} className={styles.btnAddLesson}>
              + Thêm bài tập
            </button>
          </div>
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
                  autoFocus
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

      {showExerciseModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingExercise ? "Sửa Bài tập" : "Thêm Bài tập"}</h2>
            <form onSubmit={handleSubmitExercise}>
              <div className={styles.formGroup}>
                <label>Tiêu đề</label>
                <input
                  value={exerciseFormData.title}
                  onChange={(e) =>
                    setExerciseFormData({
                      ...exerciseFormData,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hướng dẫn</label>
                <textarea
                  value={exerciseFormData.instructions}
                  onChange={(e) =>
                    setExerciseFormData({
                      ...exerciseFormData,
                      instructions: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Code mẫu</label>
                <textarea
                  value={exerciseFormData.exampleCode}
                  onChange={(e) =>
                    setExerciseFormData({
                      ...exerciseFormData,
                      exampleCode: e.target.value,
                    })
                  }
                  rows={3}
                  style={{ fontFamily: "monospace" }}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Yêu cầu (Required Fields)</label>
                <input
                  value={exerciseFormData.requiredFields}
                  onChange={(e) =>
                    setExerciseFormData({
                      ...exerciseFormData,
                      requiredFields: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ghi chú</label>
                <input
                  value={exerciseFormData.notes}
                  onChange={(e) =>
                    setExerciseFormData({
                      ...exerciseFormData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowExerciseModal(false)}
                >
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
