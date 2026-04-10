import React, { useState, useEffect } from "react";
import { lessonService } from "@utils/lessonService.js";
import { sessionExerciseService } from "@utils/sessionExerciseService";
import { useNotification } from "@shared/notification";
import styles from "./styles/ManageLessons.module.css";

export default function LessonManager({
  sessionId,
  onSelectLesson,
  selectedLesson,
}) {
  const { confirm } = useNotification();
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
    const isConfirmed = await confirm({
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa bài học này?",
      type: "danger",
      confirmText: "Xóa",
      cancelText: "Hủy"
    });
    if (!isConfirmed) return;
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
    const isConfirmed = await confirm({
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa bài tập này?",
      type: "danger",
      confirmText: "Xóa",
      cancelText: "Hủy"
    });
    if (!isConfirmed) return;
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
            <div className={styles.modalContainer}>
              <div className={styles.modalHeaderOrange}>
                <h3>{editingLesson ? "Cập nhật bài học" : "Thêm bài học mới"}</h3>
              </div>
              <div className={styles.modalFormBody}>
                <form onSubmit={handleSubmitLesson}>
                  <div className={styles.formGroup}>
                    <label className={styles.labelBold}>Tiêu đề bài học</label>
                    <input
                      className={styles.customInputModal}
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Nhập tiêu đề bài học..."
                      required
                      autoFocus
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.labelBold}>Dạng bài học</label>
                    <div className={styles.lessonTypeSelector}>
                      {["VIDEO", "QUIZ", "DOCUMENT"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={formData.type === type ? styles.active : ""}
                          onClick={() => !editingLesson && setFormData({ ...formData, type })}
                          disabled={!!editingLesson}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.modalFooterButtons}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className={styles.btnCancel}
                    >
                      Hủy
                    </button>
                    <button type="submit" className={styles.btnSave}>
                      {editingLesson ? "Lưu thay đổi" : "Thêm bài học"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExerciseModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalContainer}>
              <div className={styles.modalHeaderOrange}>
                <h3>{editingExercise ? "Cập nhật bài tập" : "Thêm bài tập mới"}</h3>
              </div>
              <div className={styles.modalFormBody}>
                <form onSubmit={handleSubmitExercise}>
                  <div className={styles.formGroup}>
                    <label className={styles.labelBold}>Tiêu đề bài tập</label>
                    <input
                      className={styles.customInputModal}
                      value={exerciseFormData.title}
                      onChange={(e) =>
                        setExerciseFormData({
                          ...exerciseFormData,
                          title: e.target.value,
                        })
                      }
                      placeholder="Nhập tiêu đề..."
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.labelBold}>Hướng dẫn</label>
                    <textarea
                      className={styles.customInputModal}
                      style={{ minHeight: '100px' }}
                      value={exerciseFormData.instructions}
                      onChange={(e) =>
                        setExerciseFormData({
                          ...exerciseFormData,
                          instructions: e.target.value,
                        })
                      }
                      placeholder="Hướng dẫn làm bài..."
                      rows={3}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.labelBold}>Code mẫu</label>
                    <textarea
                      className={styles.customInputModal}
                      value={exerciseFormData.exampleCode}
                      onChange={(e) =>
                        setExerciseFormData({
                          ...exerciseFormData,
                          exampleCode: e.target.value,
                        })
                      }
                      placeholder="// Code mẫu..."
                      rows={3}
                      style={{ fontFamily: "monospace", minHeight: '120px', backgroundColor: '#1e1e1e', color: '#d4d4d4' }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.labelBold}>Yêu cầu (Required Fields)</label>
                    <input
                      className={styles.customInputModal}
                      value={exerciseFormData.requiredFields}
                      onChange={(e) =>
                        setExerciseFormData({
                          ...exerciseFormData,
                          requiredFields: e.target.value,
                        })
                      }
                      placeholder="Ví dụ: functionName, variableName..."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.labelBold}>Ghi chú</label>
                    <input
                      className={styles.customInputModal}
                      value={exerciseFormData.notes}
                      onChange={(e) =>
                        setExerciseFormData({
                          ...exerciseFormData,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Ghi chú thêm..."
                    />
                  </div>
                  <div className={styles.modalFooterButtons}>
                    <button
                      type="button"
                      onClick={() => setShowExerciseModal(false)}
                      className={styles.btnCancel}
                    >
                      Hủy
                    </button>
                    <button type="submit" className={styles.btnSave}>
                      {editingExercise ? "Lưu thay đổi" : "Thêm bài tập"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
