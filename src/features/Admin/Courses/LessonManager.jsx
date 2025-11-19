import React, { useState, useEffect } from "react";
import { lessonService } from "@utils/lessonService.js";
import { lessonQuizService as quizService } from "@utils/lessonQuizService.js";
import { lessonVideoService as videoService } from "@utils/lessonVideoService.js";
import styles from "./ManageLessons.module.css";

// ===== Lesson Forms =====
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

// ===== Lesson Manager Component =====
export default function LessonManager({
  sessionId,
  onSelectLesson,
  selectedLessonId,
}) {
  const [lessons, setLessons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "VIDEO",
    content: {},
  });

  // Load lessons theo session
  const loadLessons = async () => {
    if (!sessionId) return;
    try {
      const res = await lessonService.getLessonsBySession(sessionId);
      const data = await Promise.all(
        (res.data || []).map(async (lesson) => {
          if (lesson.type === "VIDEO") {
            const r = await videoService.getVideoByLesson(lesson.id);
            return { ...lesson, content: r.data[0] || {} };
          } else if (lesson.type === "QUIZ") {
            const r = await quizService.getQuizzesByLesson(lesson.id);
            return { ...lesson, content: { questions: r.data || [] } };
          }
          return lesson;
        })
      );
      setLessons(data);
    } catch (err) {
      console.error("Load lessons error", err);
    }
  };

  useEffect(() => {
    loadLessons();
  }, [sessionId]);

  // Thêm bài học
  const handleAddLesson = () => {
    setEditingLesson(null);
    setFormData({ title: "", type: "VIDEO", content: {} });
    setShowModal(true);
  };

  // Sửa bài học
  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      type: lesson.type,
      content: lesson.content || {},
    });
    setShowModal(true);
  };

  // Xóa bài học
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Xóa bài học này?")) return;
    try {
      await lessonService.deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l.id !== lessonId));
    } catch (err) {
      console.error("Xóa lesson lỗi:", err);
      alert("Không thể xóa lesson. Xem console để biết chi tiết.");
    }
  };

  // ===== Lưu bài học (thêm/sửa) =====
  const handleSubmitLesson = async (e) => {
    e.preventDefault();
    if (!sessionId) return;

    const title =
      formData.type === "QUIZ" ? `[Quizz] ${formData.title}` : formData.title;

    try {
      let lessonId;

      if (editingLesson) {
        // 1. Update lesson
        await lessonService.updateLesson(editingLesson.id, {
          title,
          type: formData.type,
          orderIndex: editingLesson.orderIndex || 0,
          sessionId,
        });
        lessonId = editingLesson.id;
      } else {
        // 1. Add new lesson
        const res = await lessonService.addLesson({
          title,
          type: formData.type,
          orderIndex: 0,
          sessionId,
        });
        lessonId = res.data.id;
      }

      // 2. Nếu là VIDEO, tạo hoặc update video
      if (formData.type === "VIDEO") {
        const videoData = {
          lessonId,
          title: formData.title,
          videoUrl: formData.content.url || "",
          durationSeconds: formData.content.durationSeconds || 0,
          description: formData.content.description || "",
        };

        if (editingLesson && editingLesson.content?.id) {
          await videoService.updateVideo(editingLesson.content.id, videoData);
        } else {
          console.log(
            "Sending video data with token:",
            localStorage.getItem("accessToken")
          );
          await videoService.addVideo({
            lessonId,
            videoUrl: formData.content.url,
          });
          
          await videoService.addVideo(videoData);
        }
      }

      // 3. Reload lessons
      await loadLessons();
      setShowModal(false);
    } catch (err) {
      console.error("Lesson submit error:", err);
      alert("Có lỗi khi lưu bài học/video. Kiểm tra console.");
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
              <span className={`${styles.lessonTypeBadge}`}>{lesson.type}</span>
            </button>
            <div className={styles.lessonActions}>
              <button type="button" onClick={() => handleEditLesson(lesson)}>
                Sửa
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLesson(lesson.id)}
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
                  <option value="VIDEO">VIDEO</option>
                  <option value="QUIZ">QUIZ</option>
                </select>
              </div>
              {formData.type === "VIDEO" && (
                <VideoForm formData={formData} setFormData={setFormData} />
              )}
              {formData.type === "QUIZ" && (
                <QuizForm formData={formData} setFormData={setFormData} />
              )}
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
