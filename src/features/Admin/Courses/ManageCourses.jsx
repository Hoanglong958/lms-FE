import React, { useState } from "react";
// Dùng Link chuẩn, không cần useNavigate
import { Link } from "react-router-dom";
// Import service thay vì mock data
import { courseService } from "@utils/courseService.js";
import styles from "./ManageCourses.module.css";

export default function ManageCourses() {
  // 1. Đọc dữ liệu từ service (localStorage)
  const [courses, setCourses] = useState(() => courseService.getCourses());
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setCurrentCourse(null);
    setFormData({ title: "", description: "" });
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setCurrentCourse(course);
    setFormData({ title: course.title, description: course.description });
    setShowModal(true);
  };

  const handleDelete = (courseId) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa khóa học này? (Toàn bộ nội dung bên trong sẽ bị xóa)"
      )
    ) {
      // 2. Gọi service để xóa
      courseService.deleteCourse(courseId);
      // 3. Đọc lại dữ liệu từ service để cập nhật UI
      setCourses(courseService.getCourses());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentCourse) {
      // 2. Gọi service để cập nhật
      courseService.updateCourse({ ...currentCourse, ...formData });
    } else {
      // 2. Gọi service để thêm mới
      courseService.addCourse(formData);
    }
    // 3. Đọc lại dữ liệu từ service để cập nhật UI
    setCourses(courseService.getCourses());
    setShowModal(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Quản lý khóa học</h1>
        <button
          onClick={handleAdd}
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          Thêm khóa học mới
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tên khóa học</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.title}</td>
              <td>{course.description}</td>
              <td className={styles.actions}>
                {/* Dùng Link đơn giản. Sẽ luôn hoạt động! */}
                <Link
                  to={`/admin/parts/${course.id}`}
                  className={`${styles.btn} ${styles.btnDetail}`}
                >
                  Nội dung
                </Link>
                <button
                  onClick={() => handleEdit(course)}
                  className={`${styles.btn} ${styles.btnEdit}`}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className={`${styles.btn} ${styles.btnDelete}`}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Thêm/Sửa */}
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
