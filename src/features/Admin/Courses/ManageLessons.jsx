import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { courseService, lessonService } from "@utils/courseService.js";
import styles from "./ManageLessons.module.css";

/**
 * ============================================
 * Component con quản lý Bài học (Lesson)
 * ============================================
 */
function LessonManager({ sectionId }) {
  const [lessons, setLessons] = useState(() =>
    lessonService.getLessonsBySectionId(sectionId)
  );

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
    content: {},
  });

  const handleAddLesson = () => {
    setFormData({
      title: "",
      description: "",
      type: "video",
      content: {},
    });
    setShowModal(true);
  };

  const handleSubmitLesson = (e) => {
    e.preventDefault();

    let title = formData.title;
    if (formData.type === "quiz") title = `[Quizz] ${title}`;

    lessonService.addLesson({
      sectionId,
      ...formData,
      title,
    });

    setLessons(lessonService.getLessonsBySectionId(sectionId));
    setShowModal(false);
  };

  const handleDeleteLesson = (lessonId) => {
    if (window.confirm("Xóa bài học này?")) {
      lessonService.deleteLesson(lessonId);
      setLessons(lessonService.getLessonsBySectionId(sectionId));
    }
  };

  return (
    <>
      <ul className={styles.lessonList}>
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <span>{lesson.title}</span>
            <div className={styles.lessonActions}>
              <button
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

      {/* MODAL THÊM BÀI HỌC */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Thêm Bài học mới</h2>
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

/**
 * FORM CON: Video
 */
function VideoForm({ formData, setFormData }) {
  return (
    <div className={styles.formGroup}>
      <label>Link video (YouTube hoặc file)</label>
      <input
        type="text"
        value={formData.content.videoUrl || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            content: { ...formData.content, videoUrl: e.target.value },
          })
        }
        placeholder="https://youtube.com/..."
      />
    </div>
  );
}

/**
 * FORM CON: Document (tài liệu có nhiều phần nhỏ)
 */
function DocumentForm({ formData, setFormData }) {
  const sections = formData.content.sections || [];

  const addSubSection = () => {
    const newSec = { id: Date.now(), title: "", content: "" };
    setFormData({
      ...formData,
      content: { sections: [...sections, newSec] },
    });
  };

  const updateSubSection = (id, key, value) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, [key]: value } : s
    );
    setFormData({ ...formData, content: { sections: updated } });
  };

  return (
    <div className={styles.formGroup}>
      <label>Tài liệu chi tiết</label>
      {sections.map((s) => (
        <div key={s.id} className={styles.subSection}>
          <input
            type="text"
            placeholder="Tiêu đề nhỏ"
            value={s.title}
            onChange={(e) => updateSubSection(s.id, "title", e.target.value)}
          />
          <textarea
            placeholder="Nội dung"
            value={s.content}
            onChange={(e) => updateSubSection(s.id, "content", e.target.value)}
          />
        </div>
      ))}
      <button type="button" onClick={addSubSection} className={styles.btnSmall}>
        + Thêm phần nhỏ
      </button>
    </div>
  );
}

/**
 * FORM CON: Quizz (thêm câu hỏi & đáp án)
 */
function QuizForm({ formData, setFormData }) {
  const questions = formData.content.questions || [];

  const addQuestion = () => {
    const newQ = { id: Date.now(), question: "", answer: "" };
    setFormData({
      ...formData,
      content: { questions: [...questions, newQ] },
    });
  };

  const updateQuestion = (id, key, value) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, [key]: value } : q
    );
    setFormData({ ...formData, content: { questions: updated } });
  };

  return (
    <div className={styles.formGroup}>
      <label>Danh sách câu hỏi</label>
      {questions.map((q) => (
        <div key={q.id} className={styles.quizItem}>
          <input
            type="text"
            placeholder="Câu hỏi"
            value={q.question}
            onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
          />
          <input
            type="text"
            placeholder="Đáp án"
            value={q.answer}
            onChange={(e) => updateQuestion(q.id, "answer", e.target.value)}
          />
        </div>
      ))}
      <button type="button" onClick={addQuestion} className={styles.btnSmall}>
        + Thêm câu hỏi
      </button>
    </div>
  );
}

/**
 * ============================================
 * Component chính quản lý Phân học (Section)
 * ============================================
 */
export default function ManageLessons() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [course, setCourse] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [formData, setFormData] = useState({ title: "" });

  useEffect(() => {
    if (courseId) {
      const foundCourse = courseService.getCourseById(courseId);
      if (foundCourse) {
        setCourse(foundCourse);
        setSections(lessonService.getSectionsByCourseId(courseId));
      } else {
        navigate("/admin/courses");
      }
    }
  }, [courseId, navigate]);

  const handleDeleteSection = (sectionId) => {
    if (
      window.confirm(
        "Xóa phân học này? (Tất cả bài học bên trong cũng sẽ bị xóa!)"
      )
    ) {
      lessonService.deleteSection(sectionId);
      setSections(lessonService.getSectionsByCourseId(courseId));
    }
  };

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
      lessonService.updateSection({ ...currentSection, ...formData });
    } else {
      lessonService.addSection({ courseId: courseId, ...formData });
    }
    setSections(lessonService.getSectionsByCourseId(courseId));
    setShowModal(false);
  };

  if (!courseId) {
    return (
      <div className={styles.page}>
        <h1>Phân học & Bài học</h1>
        <p>
          Vui lòng chọn một khóa học từ trang{" "}
          <Link to="/admin/courses">Quản lý khóa học</Link> để xem nội dung.
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.page}>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link to="/admin/courses" className={styles.backLink}>
            &larr; Quay lại danh sách khóa học
          </Link>
          <h1>Quản lý nội dung cho: {course.title}</h1>
        </div>
        <button
          onClick={handleAddSection}
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          Thêm Phân học
        </button>
      </div>

      <div className={styles.sectionList}>
        {sections.map((section) => (
          <div key={section.id} className={styles.sectionItem}>
            <div className={styles.sectionHeader}>
              <h3>{section.title}</h3>
              <div className={styles.sectionActions}>
                <button
                  onClick={() => handleEditSection(section)}
                  className={`${styles.btn} ${styles.btnEdit}`}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDeleteSection(section.id)}
                  className={`${styles.btn} ${styles.btnDelete}`}
                >
                  Xóa
                </button>
              </div>
            </div>
            <LessonManager sectionId={section.id} />
          </div>
        ))}
        {sections.length === 0 && (
          <p>Chưa có phân học nào. Hãy thêm một phân học mới.</p>
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{currentSection ? "Sửa Phân học" : "Thêm Phân học mới"}</h2>
            <form onSubmit={handleSubmitSection}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Tên Phân học (Chương/Phần)</label>
                <input
                  type="text"
                  id="title"
                  name="title"
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
