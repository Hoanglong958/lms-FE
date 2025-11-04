import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { courseService } from "@utils/courseService.js";
import styles from "./ManageCourses.module.css";

// Giá trị khởi tạo cho form
const initialFormData = {
  title: "",
  description: "",
  isPrerequisite: false, // THÊM MỚI: Trạng thái (Bắt buộc/Không)
};

export default function ManageCourses() {
  const [courses, setCourses] = useState(() => courseService.getCourses());
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const { courseId } = useParams();

  // CẬP NHẬT: Xử lý cả text input và checkbox
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Nếu là checkbox, lấy 'checked'. Nếu là input, lấy 'value'.
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleAdd = () => {
    setCurrentCourse(null);
    setFormData(initialFormData); // CẬP NHẬT: Dùng giá trị khởi tạo
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setCurrentCourse(course);
    // CẬP NHẬT: Tải tất cả dữ liệu vào form
    setFormData({
      title: course.title,
      description: course.description,
      isPrerequisite: course.isPrerequisite,
    });
    setShowModal(true);
  };

  const handleDelete = (courseId) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa khóa học này? (Toàn bộ nội dung bên trong sẽ bị xóa)"
      )
    ) {
      courseService.deleteCourse(courseId);
      setCourses(courseService.getCourses());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentCourse) {
      // CẬP NHẬT: Gộp formData vào currentCourse
      courseService.updateCourse({ ...currentCourse, ...formData });
    } else {
      // Logic thêm mới đã đúng, vì formData đã chứa tất cả trường
      courseService.addCourse(formData);
    }
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
            {/* THÊM MỚI */}
            <th>Tiến độ</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.title}</td>
              <td>{course.description}</td>

              {/* THÊM MỚI: Hiển thị tiến độ */}
              <td>
                <span className={styles.progress}>{course.progress || 0}%</span>
              </td>

              {/* THÊM MỚI: Hiển thị trạng thái */}
              <td>
                {course.isPrerequisite ? (
                  <span className={`${styles.status} ${styles.statusRequired}`}>
                    Bắt buộc
                  </span>
                ) : (
                  <span className={`${styles.status} ${styles.statusOptional}`}>
                    Không
                  </span>
                )}
              </td>

              <td className={styles.actions}>
                <Link
                  to={`/admin/courses/part/${course.id}`}
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

              {/* THÊM MỚI: Checkbox cho Trạng thái */}
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
