import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useOutletContext } from "react-router-dom";
import { courseService, lessonService } from "@utils/courseService.js";
import AdminHeader from "@components/Admin/AdminHeader";
import styles from "./ManageLessons.module.css";

/**
 * ============================================
 * Component con quản lý Bài học (Lesson)
 * ============================================
 */
function LessonManager({ sectionId, onSelectLesson, selectedLessonId, onLessonsChange }) {
  const [lessons, setLessons] = useState(() =>
    lessonService.getLessonsBySectionId(sectionId)
  );

  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
    content: {},
  });

  useEffect(() => {
    setLessons(lessonService.getLessonsBySectionId(sectionId));
  }, [sectionId]);

  const refreshLessons = (options = { preserveSelection: false }) => {
    const updatedLessons = lessonService.getLessonsBySectionId(sectionId);
    setLessons(updatedLessons);
    if (onLessonsChange) {
      onLessonsChange(sectionId, updatedLessons, options);
    }
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setFormData({
      title: "",
      description: "",
      type: "video",
      content: {},
    });
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

  const handleSubmitLesson = (e) => {
    e.preventDefault();
    let title = formData.title;
    if (formData.type === "quiz") title = `[Quizz] ${title}`;

    if (editingLesson) {
      lessonService.updateLesson({
        ...editingLesson,
        ...formData,
        title,
      });
    } else {
      lessonService.addLesson({
        sectionId,
        ...formData,
        title,
      });
    }

    refreshLessons({ preserveSelection: true });
    setShowModal(false);
  };

  const handleDeleteLesson = (lessonId) => {
    if (window.confirm("Xóa bài học này?")) {
      lessonService.deleteLesson(lessonId);
      refreshLessons();
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
      {/* MODAL THÊM / SỬA BÀI HỌC */}
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
                  disabled={!!editingLesson} // ✅ giữ nguyên type khi sửa
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

/* === FORM CON: VIDEO === */
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

/* === FORM CON: DOCUMENT === */
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

/* === FORM CON: QUIZZ === */
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
  const { courseSlug } = useParams();
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedSections, setExpandedSections] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [formData, setFormData] = useState({ title: "" });

  const courseId = course?.id;

  const findFirstLesson = (sectionData) => {
    for (const section of sectionData) {
      const lessons = lessonService.getLessonsBySectionId(section.id);
      if (lessons.length) {
        return { section, lesson: lessons[0] };
      }
    }
    return null;
  };

  const computeNextSelection = (sectionData, prevSelected) => {
    if (!sectionData.length) return null;

    if (prevSelected?.section?.id) {
      const matchedSection = sectionData.find(
        (section) => section.id === prevSelected.section.id
      );
      if (matchedSection) {
        const lessons = lessonService.getLessonsBySectionId(matchedSection.id);
        if (!lessons.length) {
          return findFirstLesson(sectionData);
        }

        const matchedLesson = lessons.find(
          (lesson) => lesson.id === prevSelected.lesson.id
        );
        if (matchedLesson) {
          return { section: matchedSection, lesson: matchedLesson };
        }

        return { section: matchedSection, lesson: lessons[0] };
      }
    }

    return findFirstLesson(sectionData);
  };

  const syncSections = (prevSelected, targetCourseId) => {
    const effectiveCourseId = targetCourseId ?? courseId;
    if (!effectiveCourseId) return;

    const nextSections = lessonService.getSectionsByCourseId(effectiveCourseId);
    setSections(nextSections);

    const nextSelection = computeNextSelection(nextSections, prevSelected);
    setSelectedLesson(nextSelection);

    setExpandedSections((prev) => {
      const valid = prev.filter((id) =>
        nextSections.some((section) => section.id === id)
      );

      if (nextSelection?.section?.id && !valid.includes(nextSelection.section.id)) {
        valid.push(nextSelection.section.id);
      }

      return valid;
    });
  };

  const handleLessonsChange = () => {
    syncSections(selectedLesson);
  };

  const handleSelectLesson = (section, lesson) => {
    setSelectedLesson({ section, lesson });
    setExpandedSections((prev) =>
      prev.includes(section.id) ? prev : [...prev, section.id]
    );
  };

  const handleToggleSection = (sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "Video";
      case "document":
        return "Document";
      case "quiz":
        return "Quiz";
      default:
        return type;
    }
  };

  const renderLessonContent = (lesson) => {
    if (!lesson) return null;

    if (lesson.type === "video") {
      const videoUrl = lesson.content?.videoUrl;

      if (!videoUrl) {
        return <p className={styles.detailEmptyContent}>Chưa có video cho bài học này.</p>;
      }

      const isYoutube =
        videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

      const embedUrl = isYoutube
        ? videoUrl
            .replace("watch?v=", "embed/")
            .replace("youtu.be/", "www.youtube.com/embed/")
        : videoUrl;

      return (
        <div className={styles.detailVideo}>
          {isYoutube ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <a href={videoUrl} target="_blank" rel="noreferrer">
              Xem video
            </a>
          )}
        </div>
      );
    }

    if (lesson.type === "document") {
      const sections = lesson.content?.sections || [];

      if (!sections.length) {
        return (
          <p className={styles.detailEmptyContent}>
            Chưa có nội dung tài liệu được thêm vào.
          </p>
        );
      }

      return (
        <div className={styles.detailDocument}>
          {sections.map((section) => (
            <div key={section.id} className={styles.detailDocumentItem}>
              <h4>{section.title}</h4>
              <p>{section.content}</p>
            </div>
          ))}
        </div>
      );
    }

    if (lesson.type === "quiz") {
      const questions = lesson.content?.questions || [];

      if (!questions.length) {
        return (
          <p className={styles.detailEmptyContent}>
            Chưa có câu hỏi nào trong bài quiz này.
          </p>
        );
      }

      return (
        <div className={styles.detailQuiz}>
          {questions.map((question) => (
            <div key={question.id} className={styles.detailQuizItem}>
              <p>
                <strong>Câu hỏi:</strong> {question.question}
              </p>
              <p>
                <strong>Đáp án:</strong> {question.answer}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className={styles.detailEmptyContent}>
        Loại bài học này chưa được hỗ trợ hiển thị chi tiết.
      </p>
    );
  };

  useEffect(() => {
    if (!courseSlug) return;

    const foundCourse = courseService.getCourseBySlug(courseSlug);
    if (foundCourse) {
      setCourse(foundCourse);
      syncSections(null, foundCourse.id);
    } else {
      navigate("/admin/courses");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug, navigate]);

  const handleDeleteSection = (sectionId) => {
    if (
      window.confirm(
        "Xóa phân học này? (Tất cả bài học bên trong cũng sẽ bị xóa!)"
      )
    ) {
      lessonService.deleteSection(sectionId);
      syncSections(selectedLesson);
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
      if (!courseId) return;
      lessonService.addSection({ courseId, ...formData });
    }
    syncSections(selectedLesson);
    setShowModal(false);
  };

  if (!courseSlug) {
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

  const activeBadgeClass =
    selectedLesson?.lesson?.type === "video"
      ? styles.badgeVideo
      : selectedLesson?.lesson?.type === "document"
      ? styles.badgeDocument
      : selectedLesson?.lesson?.type === "quiz"
      ? styles.badgeQuiz
      : "";

  const { toggleSidebar } = useOutletContext() || {};

  return (
    <div className={styles.page}>
      <AdminHeader
        title={`Quản lý nội dung cho: ${course.title}`}
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
          <div className={styles.sectionList}>
            {sections.map((section) => {
              const isExpanded = expandedSections.includes(section.id);
              const lessonCount =
                lessonService.getLessonsBySectionId(section.id).length;
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
                      onClick={() => handleToggleSection(section.id)}
                    >
                      <div className={styles.sectionToggleInfo}>
                        <span className={styles.sectionName}>
                          {section.title}
                        </span>
                        <span className={styles.sectionMeta}>
                          {lessonCount} bài học
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
                      sectionId={section.id}
                      onSelectLesson={(lesson) =>
                        handleSelectLesson(section, lesson)
                      }
                      selectedLessonId={selectedLesson?.lesson?.id}
                      onLessonsChange={handleLessonsChange}
                    />
                  )}
                </div>
              );
            })}

            {sections.length === 0 && (
              <div className={styles.sectionEmpty}>
                <p>Chưa có phân học nào. Hãy thêm một phân học mới.</p>
              </div>
            )}
          </div>
        </aside>

        <section className={styles.contentDetail}>
          {selectedLesson ? (
            <div className={styles.detailWrapper}>
              <div className={styles.detailHeader}>
                <div>
                  <span className={styles.detailSectionLabel}>
                    {selectedLesson.section.title}
                  </span>
                  <h2 className={styles.detailTitle}>
                    {selectedLesson.lesson.title}
                  </h2>
                </div>
                <span
                  className={`${styles.lessonTypeBadge} ${activeBadgeClass}`}
                >
                  {formatTypeLabel(selectedLesson.lesson.type)}
                </span>
              </div>

              {selectedLesson.lesson.description && (
                <p className={styles.detailDescription}>
                  {selectedLesson.lesson.description}
                </p>
              )}

              <div className={styles.detailBody}>
                {renderLessonContent(selectedLesson.lesson)}
              </div>
            </div>
          ) : (
            <div className={styles.detailPlaceholder}>
              <h3>Chọn một bài học để xem chi tiết</h3>
              <p>
                Hãy chọn một bài học từ danh sách bên trái để xem nội dung, mô
                tả và tài liệu đính kèm.
              </p>
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
