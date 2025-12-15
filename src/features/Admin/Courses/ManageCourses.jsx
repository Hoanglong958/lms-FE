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
  level: "",
  totalSessions: 0,
};

// Component dòng khóa học
function CourseRow({ course, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleRowClick = (e) => {
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
      <td className={styles.colDesc}>
        {course.description && course.description.length > 50
          ? course.description.substring(0, 50) + "..."
          : course.description || "—"}
      </td>
      <td>{course.totalSessions || 0}</td>
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
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});


  // Load courses
  const loadCourses = async () => {
    try {
      const res = await courseService.getCourses();
      setCourses(res.data);
    } catch { }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Keep value as string to control input completely (like class management)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAdd = () => {
    setCurrentCourse(null);
    setFormData(initialFormData);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setCurrentCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      level: course.level || "",
      totalSessions: course.totalSessions || 0,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (course) => {
    if (!window.confirm("Bạn có chắc muốn xóa khóa học này?")) return;

    try {
      await courseService.deleteCourse(course.id);
      loadCourses();
    } catch { }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tên khóa học";
    if (!formData.description || !formData.description.trim()) newErrors.description = "Vui lòng nhập mô tả";
    if (!formData.level) newErrors.level = "Vui lòng chọn cấp độ";
    if (formData.totalSessions === "" || formData.totalSessions <= 0) newErrors.totalSessions = "Tổng số buổi phải lớn hơn 0";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      slug: slugify(formData.title),
    };

    try {
      if (currentCourse) {
        await courseService.updateCourse(currentCourse.id, payload);
      } else {
        await courseService.addCourse(payload);
      }

      loadCourses();
      setShowModal(false);
    } catch { }
  };

  // Filtering
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const displayedCourses = courses.filter((course) => {
    if (!normalizedSearch) return true;
    return [course.title, course.description]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(normalizedSearch));
  });

  let toggleSidebar = () => { };
  try {
    toggleSidebar = useOutletContext()?.toggleSidebar || (() => { });
  } catch { }

  return (
    <div className={styles.page}>
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
        <div className={styles.filterBar}>
          <div className={styles.searchInput}>
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.courseTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.colTitle}>Tên khóa học</th>
                <th className={styles.colDesc}>Mô tả</th>
                <th>Tổng buổi</th>
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

        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>{currentCourse ? "Sửa khóa học" : "Thêm khóa học mới"}</h2>

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Tên khóa học</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}

                    onChange={handleInputChange}
                    className={errors.title ? styles.inputError : ""}
                  />
                  {errors.title && <div className={styles.error}>{errors.title}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={errors.description ? styles.inputError : ""}
                  />
                  {errors.description && <div className={styles.error}>{errors.description}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label>Tổng số buổi học</label>
                  <input
                    type="number"
                    name="totalSessions"
                    value={formData.totalSessions}
                    onChange={handleInputChange}
                    min="1"
                    className={errors.totalSessions ? styles.inputError : ""}
                  />
                  {errors.totalSessions && <div className={styles.error}>{errors.totalSessions}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label>Cấp độ</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                    className={errors.level ? styles.inputError : ""}
                  >
                    <option value="">Chọn cấp độ</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Inrmediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                  {errors.level && <div className={styles.error}>{errors.level}</div>}
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => setShowModal(false)}
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
