import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { courseService } from "@utils/courseService.js";
import styles from "./ManageCourses.module.css";
import AdminHeader from "@components/Admin/AdminHeader"; // chỉ chỉnh import header

// Giá trị khởi tạo cho form
const initialFormData = {
  title: "",
  description: "",
  isPrerequisite: false,
};

// Component dòng khóa học (table row)
function CourseRow({ course, onEdit, onDelete }) {
  const isPublic = !course.isPrerequisite;

  return (
    <tr className={styles.tableRow}>
      <td className={styles.colTitle}>
        <Link
          to={`/admin/courses/part/${course.slug}`}
          className={styles.titleLink}
        >
          {course.title}
        </Link>
      </td>
      <td className={styles.colDesc}>{course.description || "—"}</td>
      <td className={styles.colType}>
        <span
          className={`${styles.cardTag} ${
            isPublic ? styles.tagPublic : styles.tagRequired
          }`}
        >
          {isPublic ? "Miễn phí" : "Trả phí"}
        </span>
      </td>
      <td className={styles.colActions}>
        <div className={styles.rowActions}>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            onClick={onEdit}
          >
            Sửa
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={onDelete}
          >
            Xóa
          </button>
        </div>
      </td>
    </tr>
  );
}

// Component Trang Chính
export default function ManageCourses() {
  const [courses, setCourses] = useState(() => courseService.getCourses());
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [filterPaid, setFilterPaid] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  // --- Lọc theo học phí (miễn phí / trả phí) ---
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const displayedCourses = courses.filter((course) => {
    const matchesPaid =
      filterPaid === ""
        ? true
        : filterPaid === "paid"
        ? !!course.isPrerequisite
        : !course.isPrerequisite;
    const matchesSearch =
      normalizedSearch === ""
        ? true
        : [course.title, course.description]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(normalizedSearch));
    return matchesPaid && matchesSearch;
  });

  const { toggleSidebar } = useOutletContext() || {};

  return (
    <div className={styles.page}>
      {/* Header của page */}
      <AdminHeader
        title="Quản lý khóa học"
        onMenuToggle={toggleSidebar}
        actions={
          <button
            onClick={handleAdd}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            + Thêm khóa học
          </button>
        }
      />

      <div className={styles.courseContentWrapper}>
        {/* 4 Thẻ thống kê */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconBgOrange}`}>
              📚
            </div>
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
              <p>Tiến độ hoàn thành TB</p>
              <span>{avgProgress}%</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconBgYellow}`}>
              🌍
            </div>
            <div className={styles.statInfo}>
              <p>Khóa học miễn phí</p>
              <span>{publicCourses}</span>
            </div>
          </div>
        </div>

        {/* Thanh Tìm kiếm và Lọc */}
        <div className={styles.filterBar}>
          <div className={styles.searchInput}>
            <span className={styles.searchIcon}></span>
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Tìm kiếm khóa học"
            />
          </div>
          <div className={styles.selectDropdown}>
            <select
              value={filterPaid}
              onChange={(e) => setFilterPaid(e.target.value)}
              aria-label="Lọc theo học phí"
            >
              <option value="">Tất cả khóa học ▼</option>
              <option value="free">Miễn phí</option>
              <option value="paid">Trả phí</option>
            </select>
          </div>
        </div>

        {/* Danh sách khóa học dạng bảng */}
        <div className={styles.tableWrapper}>
          <table className={styles.courseTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.colTitle}>Tên khóa học</th>
                <th className={styles.colDesc}>Mô tả</th>
                <th className={styles.colType}>Loại</th>
                <th className={styles.colActions}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedCourses.map((course) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  onEdit={() => handleEdit(course)}
                  onDelete={() => handleDelete(course.id)}
                />
              ))}
            </tbody>
          </table>
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
                    Đây là khóa học trả phí?
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
    </div>
  );
}
