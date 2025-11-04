import React, { useState, useEffect } from "react";
// Bỏ useLocation, chỉ cần useParams, useNavigate, Link
import { useParams, useNavigate, Link } from "react-router-dom";
// Import cả 2 service
import { courseService, lessonService } from "@utils/courseService.js";
import styles from "./ManageLessons.module.css";

/**
 * ============================================
 * Component con quản lý Bài học (Lesson)
 * ============================================
 */
function LessonManager({ sectionId }) {
  // 1. Đọc dữ liệu từ service
  const [lessons, setLessons] = useState(() =>
    lessonService.getLessonsBySectionId(sectionId)
  );

  const handleAddLesson = () => {
    const title = prompt("Nhập tên bài học mới:");
    if (title) {
      // 2. Ghi vào service
      lessonService.addLesson({ sectionId: sectionId, title });
      // 3. Đọc lại từ service
      setLessons(lessonService.getLessonsBySectionId(sectionId));
    }
  };

  const handleEditLesson = (lesson) => {
    const newTitle = prompt("Nhập tên bài học mới:", lesson.title);
    if (newTitle && newTitle !== lesson.title) {
      // 2. Ghi vào service
      lessonService.updateLesson({ ...lesson, title: newTitle });
      // 3. Đọc lại từ service
      setLessons(lessonService.getLessonsBySectionId(sectionId));
    }
  };

  const handleDeleteLesson = (lessonId) => {
    if (window.confirm("Xóa bài học này?")) {
      // 2. Ghi vào service
      lessonService.deleteLesson(lessonId);
      // 3. Đọc lại từ service
      setLessons(lessonService.getLessonsBySectionId(sectionId));
    }
  };

  return (
    <ul className={styles.lessonList}>
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <span>{lesson.title}</span>
          <div className={styles.lessonActions}>
            <button onClick={() => handleEditLesson(lesson)}>Sửa</button>
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

  /**
   * CẬP NHẬT LOGIC:
   * Chỉ cần đọc từ service. Sẽ không bao giờ thất bại.
   */
  useEffect(() => {
    if (courseId) {
      const foundCourse = courseService.getCourseById(courseId);
      if (foundCourse) {
        setCourse(foundCourse);
        setSections(lessonService.getSectionsByCourseId(courseId));
      } else {
        // Nếu ai đó nhập URL bậy, văng về
        navigate("/admin/courses");
      }
    }
  }, [courseId, navigate]);

  // --- CRUD cho PHÂN HỌC (Section) ---

  const handleDeleteSection = (sectionId) => {
    if (
      window.confirm(
        "Xóa phân học này? (Tất cả bài học bên trong cũng sẽ bị xóa!)"
      )
    ) {
      lessonService.deleteSection(sectionId);
      setSections(lessonService.getSectionsByCourseId(courseId)); // Đọc lại
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
    setSections(lessonService.getSectionsByCourseId(courseId)); // Đọc lại
    setShowModal(false);
  };

  // Render thông báo nếu vào từ sidebar
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

  // Tránh lỗi render (chỉ xảy ra trong 1 frame)
  if (!course) {
    return (
      <div className={styles.page}>
        <p>Đang tải...</p>
      </div>
    );
  }

  // Render trang quản lý
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

      {/* Danh sách các Phân học */}
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
            {/* Quản lý Bài học lồng bên trong */}
            <LessonManager sectionId={section.id} />
          </div>
        ))}
        {sections.length === 0 && (
          <p>Chưa có phân học nào. Hãy thêm một phân học mới.</p>
        )}
      </div>

      {/* Modal Thêm/Sửa Phân học */}
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
