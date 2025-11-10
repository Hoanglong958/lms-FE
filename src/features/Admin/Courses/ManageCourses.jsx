import React, { useState } from "react";
import { Link } from "react-router-dom";
import { courseService } from "@utils/courseService.js";
import styles from "./ManageCourses.module.css";
import AdminHeader from "@components/Admin/AdminHeader"; // chỉ chỉnh import header

// Giá trị khởi tạo cho form
const initialFormData = {
  title: "",
  description: "",
  isPrerequisite: false,
};

// Component Card Khóa học (dùng nội bộ)
function CourseCard({ course, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isPublic = !course.isPrerequisite;

  return (
    <div className={styles.courseCard}>
      {/* Nút Sửa/Xóa (dấu "...") */}
      <div className={styles.cardActions}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={styles.actionMenuBtn}
        >
          ...
        </button>
        {menuOpen && (
          <div className={styles.actionMenuDropdown}>
            <a
              onClick={() => {
                onEdit();
                setMenuOpen(false);
              }}
            >
              Sửa khóa học
            </a>
            <a
              onClick={() => {
                onDelete();
                setMenuOpen(false);
              }}
              className={styles.deleteAction}
            >
              Xóa khóa học
            </a>
          </div>
        )}
      </div>

      {/* ẢNH BÌA (placeholder) VÀ LINK ĐẾN TRANG PART */}
      <Link
        to={`/admin/courses/part/${course.id}`}
        className={styles.cardImageLink}
      >
        <div className={styles.cardImagePlaceholder}>📊</div>
      </Link>

      {/* NỘI DUNG CARD VÀ LINK ĐẾN TRANG PART */}
      <div className={styles.cardContent}>
        <Link
          to={`/admin/courses/part/${course.id}`}
          className={styles.cardTitleLink}
        >
          <h3 className={styles.cardTitle}>{course.title}</h3>
        </Link>
        <div className={styles.cardTags}>
          <span
            className={`${styles.cardTag} ${
              isPublic ? styles.tagPublic : styles.tagRequired
            }`}
          >
            {isPublic ? "Tùy chọn" : "Bắt buộc"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Component Trang Chính
export default function ManageCourses() {
  const [courses, setCourses] = useState(() => courseService.getCourses());
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  // --- Các hàm xử lý ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleAdd = () => {
    setCurrentCourse(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setCurrentCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      isPrerequisite: course.isPrerequisite,
    });
    setShowModal(true);
  };

  const handleDelete = (courseId) => {
    if (window.confirm("Bạn có chắc muốn xóa khóa học này?")) {
      courseService.deleteCourse(courseId);
      setCourses(courseService.getCourses());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentCourse) {
      courseService.updateCourse({ ...currentCourse, ...formData });
    } else {
      courseService.addCourse(formData);
    }
    setCourses(courseService.getCourses());
    setShowModal(false);
  };

  // --- Dữ liệu cho thẻ Stats ---
  const totalCourses = courses.length;
  const publicCourses = courses.filter((c) => !c.isPrerequisite).length;
  const totalStudents = 1690;
  const avgProgress = 67;

  return (
    <div className={styles.page}>
      {/* Header của page */}
      <AdminHeader
        title="Quản lý khóa học"
        breadcrumb={<span>Admin / Courses</span>}
        actions={
          <button
            onClick={handleAdd}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            + Thêm khóa học
          </button>
        }
      />

      {/* 4 Thẻ thống kê */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBgOrange}`}>📚</div>
          <div className={styles.statInfo}>
            <p>Tổng khóa học</p>
            <span>{totalCourses}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBgBlue}`}>👥</div>
          <div className={styles.statInfo}>
            <p>Tổng học viên</p>
            <span>{totalStudents.toLocaleString("vi-VN")}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBgGreen}`}>📈</div>
          <div className={styles.statInfo}>
            <p>Tiến độ TB</p>
            <span>{avgProgress}%</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBgYellow}`}>🌍</div>
          <div className={styles.statInfo}>
            <p>Đã công khai</p>
            <span>{publicCourses}</span>
          </div>
        </div>
      </div>

      {/* Thanh Tìm kiếm và Lọc */}
      <div className={styles.filterBar}>
        <div className={styles.searchInput}>
          <input type="text" placeholder="🔍 Tìm kiếm khóa học..." />
        </div>
        <div className={styles.selectDropdown}>
          <select>
            <option value="">Tất cả danh mục ▼</option>
          </select>
        </div>
      </div>

      {/* Lưới các khóa học */}
      <div className={styles.courseGrid}>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={() => handleEdit(course)}
            onDelete={() => handleDelete(course.id)}
          />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{currentCourse ? "Sửa khóa học" : "Thêm khóa học mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Tên khóa học</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className={`${styles.formGroup} ${styles.formGroupCheck}`}>
                <input
                  type="checkbox"
                  id="isPrerequisite"
                  name="isPrerequisite"
                  checked={formData.isPrerequisite}
                  onChange={handleInputChange}
                />
                <label htmlFor="isPrerequisite">
                  Đây là khóa học bắt buộc (tiên quyết)?
                </label>
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
