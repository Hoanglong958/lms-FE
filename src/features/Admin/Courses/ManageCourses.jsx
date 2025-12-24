import React, { useState, useEffect } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { courseService } from "@utils/courseService.js";
import { uploadService } from "@utils/uploadService";
import { SERVER_URL } from "@config";

import styles from "./ManageCourses.module.css";
import AdminHeader from "@components/Admin/AdminHeader";
import { slugify } from "@utils/slugify";
import {
  GraduationCap,
  Sparkles,
  X as CloseIcon,
  BookOpen,
  AlignLeft,
  Calendar,
  User,
  Users,
  Activity,
  Zap,
  Type,
  Clock,
  ChevronDown,
  Search,
  TrendingUp,
  Award,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon
} from "lucide-react";

// Giá trị khởi tạo form
const initialFormData = {
  title: "",
  description: "",
  level: "",
  totalSessions: 0,
  imageUrl: "",
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
      <td>
        <img
          src={course.imageUrl ? (course.imageUrl.startsWith("http") ? course.imageUrl : `${SERVER_URL}${course.imageUrl}`) : "https://placehold.co/60x40?text=No+Img"}
          alt=""
          style={{
            width: "60px",
            height: "40px",
            objectFit: "cover",
            borderRadius: "6px",
            border: "1px solid #e2e8f0"
          }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </td>
      <td className={styles.colTitle}>{course.title}</td>
      <td className={styles.colDesc}>
        {course.description && course.description.length > 50
          ? course.description.substring(0, 50) + "..."
          : course.description || "—"}
      </td>
      <td>
        <span style={{
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: 600,
          backgroundColor: course.level === 'BEGINNER' ? '#dcfce7' : course.level === 'INTERMEDIATE' ? '#dbeafe' : '#f3e8ff',
          color: course.level === 'BEGINNER' ? '#166534' : course.level === 'INTERMEDIATE' ? '#1e40af' : '#6b21a8',
        }}>
          {course.level || '—'}
        </span>
      </td>
      <td>{course.totalSessions || 0}</td>
      <td className={styles.colActions}>
        <div className={styles.rowActions} style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            className={styles.btnIcon}
            title="Chỉnh sửa"
            onClick={onEdit}
          >
            ✏️
          </button>
          <button
            type="button"
            className={`${styles.btnIcon} ${styles.btnIconDelete}`}
            title="Xóa"
            onClick={onDelete}
          >
            🗑️
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
  const [levelFilter, setLevelFilter] = useState("");
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      const url = res.data.url || res.data;
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      alert("Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

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
      imageUrl: course.imageUrl || "",
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
    // Filter by search term
    const matchesSearch = !normalizedSearch ||
      [course.title, course.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalizedSearch));

    // Filter by level
    const matchesLevel = !levelFilter || course.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  let toggleSidebar = () => { };
  try {
    toggleSidebar = useOutletContext()?.toggleSidebar || (() => { });
  } catch { }

  // Check if form has changes
  const isFormChanged = React.useMemo(() => {
    if (!currentCourse) {
      // Compare with initial empty state
      return (
        formData.title !== initialFormData.title ||
        formData.description !== initialFormData.description ||
        formData.level !== initialFormData.level ||
        String(formData.totalSessions) !== String(initialFormData.totalSessions) ||
        formData.imageUrl !== initialFormData.imageUrl
      );
    }
    // Compare with current course data
    return (
      formData.title !== currentCourse.title ||
      formData.description !== currentCourse.description ||
      (formData.level || "") !== (currentCourse.level || "") ||
      String(formData.totalSessions) !== String(currentCourse.totalSessions || 0) ||
      (formData.imageUrl || "") !== (currentCourse.imageUrl || "")
    );
  }, [formData, currentCourse]);

  // Stats calculation
  const stats = {
    total: courses.length,
    beginner: courses.filter(c => c.level === 'BEGINNER').length,
    intermediate: courses.filter(c => c.level === 'INTERMEDIATE').length,
    advanced: courses.filter(c => c.level === 'ADVANCED').length
  };

  return (
    <div className={styles.page}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <span className={styles.breadcrumbOrange}>Quản lý khóa học</span>
        <span className={styles.breadcrumbSeparator}> / </span>
        <span className={styles.breadcrumbGray}>Dashboard</span>
        <span className={styles.breadcrumbSeparator}> / </span>
        <span className={styles.breadcrumbDark}>Khóa học</span>
      </div>

      {/* Header */}
      <div className={styles.headerTop}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconBox}>
            <GraduationCap size={24} />
          </div>
          <div className={styles.headerTitle}>
            <h1>Quản lý khóa học</h1>
            <p>Tạo và quản lý các khóa học của bạn</p>
          </div>
        </div>
        <button className={styles.btnAdd} onClick={handleAdd}>
          + Thêm khóa học mới
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 }}>
        {[
          { label: "Tổng khóa học", value: stats.total, icon: <BookOpen size={24} />, color: "#f97316", bg: "#fff7ed" },
          { label: "Beginner", value: stats.beginner, icon: <Users size={24} />, color: "#10b981", bg: "#ecfdf5" },
          { label: "Intermediate", value: stats.intermediate, icon: <TrendingUp size={24} />, color: "#3b82f6", bg: "#eff6ff" },
          { label: "Advanced", value: stats.advanced, icon: <Award size={24} />, color: "#a855f7", bg: "#faf5ff" }
        ].map((stat, index) => (
          <div key={index} style={{
            borderRadius: 16,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minHeight: 140,
            justifyContent: "space-between",
            backgroundColor: stat.bg,
            border: "none"
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              backgroundColor: stat.color,
              color: "#fff"
            }}>
              {stat.icon}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: "1", marginBottom: 8 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 14, color: "#4b5563", fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
            <div style={{ position: "absolute", top: 24, right: 24 }}>
              <Sparkles size={20} color={stat.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm kiếm theo tên khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterWrapper}>
          <Activity className={styles.filterIcon} size={18} />
          <select
            className={styles.filterSelect}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="">Tất cả cấp độ</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <ChevronDown className={styles.selectArrow} size={16} />
        </div>

        <span className={styles.resultCount}>{displayedCourses.length} kết quả</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.courseTable}>
          <thead>
            <tr className={styles.tableHeader}>
              <th>Ảnh</th>
              <th className={styles.colTitle}>Tên khóa học</th>
              <th className={styles.colDesc}>Mô tả</th>
              <th>Cấp độ</th>
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
            {/* Header */}
            <div className={styles.modalHeader}>

              <div className={styles.headerTop}>
                <div className={styles.headerTitleArea}>
                  <div className={styles.headerIconBox}>
                    <GraduationCap />
                    <div className={styles.iconBadge}><Sparkles /></div>
                  </div>
                  <div className={styles.headerTitleText}>
                    <h2>{currentCourse ? "Cập nhật khóa học" : "Tạo khóa học mới"}</h2>
                    <p>Xây dựng khóa học chất lượng cao cho học viên</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Stats Row */}


            {/* Body */}
            <div className={styles.modalBody}>
              <form onSubmit={handleSubmit} id="courseForm">
                <div className={styles.formSection}>
                  {/* Image Upload */}
                  <div className={styles.customInputGroup}>
                    <div className={styles.customLabel}>
                      <ImageIcon />
                      Ảnh khóa học (Thumbnail)
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <label
                        className={styles.btnAdd}
                        style={{
                          width: 'fit-content',
                          cursor: 'pointer',
                          background: '#f1f5f9',
                          color: '#475569',
                          boxShadow: 'none',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        📸 Chọn ảnh
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          hidden
                        />
                      </label>
                      {formData.imageUrl && (
                        <div style={{ position: 'relative' }}>
                          <img
                            src={formData.imageUrl.startsWith("http") ? formData.imageUrl : `${SERVER_URL}${formData.imageUrl}`}
                            alt="Preview"
                            style={{ height: "60px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))}
                            style={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className={styles.customInputGroup}>
                    <div className={styles.customLabel}>
                      <BookOpen />
                      Tên khóa học
                      <span className={styles.requiredStar}>*</span>
                    </div>
                    <input
                      type="text"
                      name="title"
                      className={`${styles.customInput} ${errors.title ? styles.inputError : ""}`}
                      placeholder="VD: Khóa học lập trình Web Full-stack từ A-Z"
                      value={formData.title}
                      onChange={handleInputChange}
                      autoFocus
                    />
                    {errors.title && (
                      <div className={styles.errorMessage}>
                        <Activity size={12} /> {errors.title}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className={styles.customInputGroup}>
                    <div className={styles.customLabel}>
                      <AlignLeft />
                      Mô tả khóa học
                      <span className={styles.requiredStar}>*</span>
                      <span className={styles.characterCount}>
                        {formData.description ? formData.description.length : 0} / 500 ký tự
                      </span>
                    </div>
                    <textarea
                      name="description"
                      className={`${styles.customTextarea} ${errors.description ? styles.inputError : ""}`}
                      placeholder="Mô tả chi tiết về nội dung khóa học, mục tiêu đào tạo..."
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                    {errors.description && (
                      <div className={styles.errorMessage}>
                        <Activity size={12} /> {errors.description}
                      </div>
                    )}
                  </div>

                  {/* Row 2 Cols */}
                  <div className={styles.rowTwoCols}>
                    <div className={styles.customInputGroup}>
                      <div className={styles.customLabel}>
                        <Clock />
                        Tổng số buổi học
                      </div>
                      <div className={styles.inputWrapper}>
                        <input
                          type="number"
                          name="totalSessions"
                          className={`${styles.customInput} ${errors.totalSessions ? styles.inputError : ""}`}
                          value={formData.totalSessions}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="1"
                        />

                      </div>
                      {errors.totalSessions && (
                        <div className={styles.errorMessage}>
                          <Activity size={12} /> {errors.totalSessions}
                        </div>
                      )}
                    </div>

                    <div className={styles.customInputGroup}>
                      <div className={styles.customLabel}>
                        <Activity />
                        Cấp độ khóa học
                        <span className={styles.requiredStar}>*</span>
                      </div>
                      <div className={styles.customSelectWrapper}>
                        <User size={16} className={styles.customSelectIcon} />
                        <select
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          className={`${styles.customSelect} ${errors.level ? styles.inputError : ""}`}
                        >
                          <option value="">Chọn cấp độ</option>
                          <option value="BEGINNER">Beginner</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                        </select>
                        <ChevronDown size={14} className={styles.selectArrow} />
                      </div>
                      {errors.level && (
                        <div className={styles.errorMessage}>
                          <Activity size={12} /> {errors.level}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setShowModal(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="courseForm"
                className={styles.btnSubmit}
              >
                <Sparkles size={18} />
                {currentCourse ? "Lưu thay đổi" : "Tạo khóa học ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
