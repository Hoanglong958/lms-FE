import React, { useState, useEffect } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { courseService } from "@utils/courseService.js";
import { userService } from "@utils/userService";
import styles from "./ManageCourses.module.css";
import AdminHeader from "@components/Admin/AdminHeader";
import { slugify } from "@utils/slugify";

// Giá trị khởi tạo form
const initialFormData = {
  title: "",
  description: "",
  instructorId: "",
  level: "",
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
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [instructors, setInstructors] = useState([]);

  // Load giảng viên
  useEffect(() => {
    userService
      .getAllUsers({
        role: "ROLE_TEACHER",
        isActive: true,
        size: 999,
        page: 0,
      })
      .then((res) => {
        console.log("INSTRUCTORS RAW:", res.data);

        const listRaw = res.data?.data?.content || [];

        // TỰ LỌC CHẮC ĂN
        const teachers = listRaw.filter(
          (u) => u.role === "ROLE_TEACHER" && u.isActive
        );

        console.log("INSTRUCTORS PARSED:", teachers);

        setInstructors(teachers);
      })
      .catch((err) => console.error(err));
  }, []);

  // Load courses
  const loadCourses = async () => {
    try {
      const res = await courseService.getCourses();
      setCourses(res.data);
    } catch {}
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "instructorId" ? Number(value) : value,
    }));
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
      instructorId: course.instructorId || "",
      level: course.level || "",
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
    } catch {}
  };

  // Filtering
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const displayedCourses = courses.filter((course) => {
    if (!normalizedSearch) return true;
    return [course.title, course.description]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(normalizedSearch));
  });

  let toggleSidebar = () => {};
  try {
    toggleSidebar = useOutletContext()?.toggleSidebar || (() => {});
  } catch {}

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
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Giảng viên</label>

                  <select
                    id="instructorId"
                    name="instructorId"
                    value={formData.instructorId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn giảng viên --</option>

                    {instructors.map((user) => (
                      <option key={user.id} value={String(user.id)}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Cấp độ</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Chọn cấp độ</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Inrmediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
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
