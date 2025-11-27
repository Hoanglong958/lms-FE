import React, { useState, useEffect } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { courseService } from "@utils/courseService.js";
import styles from "./ManageCourses.module.css";
import AdminHeader from "@components/Admin/AdminHeader";
import { slugify } from "@utils/slugify";
// Giá trị khởi tạo form
const initialFormData = {
  title: "",
  description: "",
  instructorName: "",
  level: "", // có thể là "Beginner", "Intermediate", "Advanced"
};

// Component dòng khóa học (table row)
function CourseRow({ course, onEdit, onDelete }) {
  const navigate = useNavigate();
  const isPublic = !course.isPrerequisite;

  const handleRowClick = (e) => {
    // Tránh click vào các button không navigate
    if (e.target.closest("button")) return;
    navigate(`/admin/courses/${course.slug || slugify(course.title)}`, {
      state: { course },
    });
  };

  return (
    <tr
      className={styles.tableRow}
      onClick={handleRowClick}
      style={{ cursor: "pointer" }}
    >
      <td className={styles.colTitle}>{course.title}</td>
      <td className={styles.colDesc}>{course.description || "—"}</td>
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
  const [courses, setCourses] = useState([]); // bỏ init local
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Load danh sách từ API ---
  const loadCourses = async () => {
    try {
      const res = await courseService.getCourses();
      setCourses(res.data); // API trả về danh sách
    } catch {}
  };

  useEffect(() => {
    loadCourses();
  }, []);

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

  const handleDelete = async (course) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này?")) return;

    try {
      await courseService.deleteCourse(course.id);
      loadCourses();
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        slug: slugify(formData.title), // tạo slug
      };

      if (currentCourse) {
        await courseService.updateCourse(currentCourse.id, payload);
      } else {
        await courseService.addCourse(payload);
      }

      loadCourses(); // refresh list
      setShowModal(false);
    } catch (err) {}
  };

  // --- Dữ liệu cho thẻ Stats ---
  const totalCourses = courses.length;
  const totalStudents = 1690;
  const avgProgress = 67;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const displayedCourses = courses.filter((course) => {
    if (!normalizedSearch) return true;
    return [course.title, course.description]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(normalizedSearch));
  });

  // const { toggleSidebar } = useOutletContext() || {};
  let toggleSidebar = () => {};
  try {
    toggleSidebar = useOutletContext()?.toggleSidebar || (() => {});
  } catch {}

  return (
    <div className={styles.page}>
      {/* Header của page */}
      <AdminHeader
        title="Quản lý khóa học"
        breadcrumb={[
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "Khóa học", to: "/admin/courses" },
        ]}
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
        </div>

        {/* Danh sách khóa học dạng bảng */}
        <div className={styles.tableWrapper}>
          <table className={styles.courseTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.colTitle}>Tên khóa học</th>
                <th className={styles.colDesc}>Mô tả</th>
                <th className={styles.colActions}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedCourses.map((course) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  onEdit={() => handleEdit(course)}
                  onDelete={() => handleDelete(course)}
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
                    autoFocus
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

                <div className={styles.formGroup}>
                  <label htmlFor="instructorName">Tên giảng viên</label>
                  <input
                    type="text"
                    id="instructorName"
                    name="instructorName"
                    value={formData.instructorName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="level">Cấp độ</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn cấp độ</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
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
