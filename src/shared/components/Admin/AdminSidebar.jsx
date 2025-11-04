import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  const [openSection, setOpenSection] = useState({
    course: false,
    evaluate: true,
    community: false,
  });

  const toggleSection = (section) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="admin-sidebar">
      <div>
        {/* Header */}
        <div className="admin-sidebar-header">
          <img src="/logo.png" alt="Logo" className="admin-sidebar-logo" />
          <h2 className="admin-sidebar-title">Mankai Academy</h2>
          <p className="admin-sidebar-subtitle">Admin Dashboard</p>
        </div>

        {/* Menu */}
        <nav className="admin-sidebar-menu">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? "admin-sidebar-item active" : "admin-sidebar-item"
            }
          >
            <i className="fa-solid fa-chart-line"></i>
            Dashboard
          </NavLink>

          {/* Quản lý người dùng */}
          <div className="admin-sidebar-group">
            <div
              className="admin-sidebar-item"
              onClick={() => toggleSection("users")}
            >
              <i className="fa-solid fa-users"></i>
              <span>Quản lý người dùng</span>
              <i
                className={`fa-solid fa-chevron-${
                  openSection.users ? "up" : "down"
                } sidebar-arrow`}
              ></i>
            </div>
            {openSection.users && (
              <div className="admin-sidebar-submenu">
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar-subitem active"
                      : "admin-sidebar-subitem"
                  }
                >
                  Quản lý người dùng
                </NavLink>
              </div>
            )}
          </div>

          {/* Nội dung khóa học */}
          <div className="admin-sidebar-group">
            <div
              className="admin-sidebar-item"
              onClick={() => toggleSection("course")}
            >
              <i className="fa-solid fa-book"></i>
              <span>Nội dung khóa học</span>
              <i
                className={`fa-solid fa-chevron-${
                  openSection.course ? "up" : "down"
                } sidebar-arrow`}
              ></i>
            </div>
            {openSection.course && (
              <div className="admin-sidebar-submenu">
                <NavLink
                  to="/admin/courses"
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar-subitem active"
                      : "admin-sidebar-subitem"
                  }
                >
                  Khóa học
                </NavLink>
                <NavLink
                  to="/admin/lessons"
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar-subitem active"
                      : "admin-sidebar-subitem"
                  }
                >
                  Chương & Bài học
                </NavLink>
                <NavLink
                  to="/admin/classes"
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar-subitem active"
                      : "admin-sidebar-subitem"
                  }
                >
                  Lớp học
                </NavLink>
              </div>
            )}
          </div>

          {/* Đánh giá */}
          <div className="admin-sidebar-group">
            <div
              className="admin-sidebar-item"
              onClick={() => toggleSection("evaluate")}
            >
              <i className="fa-solid fa-clipboard-check"></i>
              <span>Đánh giá</span>
              <i
                className={`fa-solid fa-chevron-${
                  openSection.evaluate ? "up" : "down"
                } sidebar-arrow`}
              ></i>
            </div>
            {openSection.evaluate && (
              <div className="admin-sidebar-submenu">
                <NavLink
                  to="/admin/quiz"
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar-subitem active"
                      : "admin-sidebar-subitem"
                  }
                >
                  Quiz
                </NavLink>

                {/* 🟧 Sửa đường dẫn Bài kiểm tra */}
                <NavLink
                  to="/admin/exam"
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar-subitem active"
                      : "admin-sidebar-subitem"
                  }
                >
                  Bài kiểm tra
                </NavLink>

                <NavLink
                  to="/admin/exercises"
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar-subitem active"
                      : "admin-sidebar-subitem"
                  }
                >
                  Bài tập
                </NavLink>
              </div>
            )}
          </div>

          {/* Cộng đồng */}
          <div className="admin-sidebar-group">
            <div
              className="admin-sidebar-item"
              onClick={() => toggleSection("community")}
            >
              <i className="fa-solid fa-comments"></i>
              <span>Cộng đồng</span>
              <i
                className={`fa-solid fa-chevron-${
                  openSection.community ? "up" : "down"
                } sidebar-arrow`}
              ></i>
            </div>
            {openSection.community && (
              <div className="admin-sidebar-submenu">
                <NavLink
                  to="/admin/posts"
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar-subitem active"
                      : "admin-sidebar-subitem"
                  }
                >
                  Bài viết
                </NavLink>
                <NavLink
                  to="/admin/comments"
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar-subitem active"
                      : "admin-sidebar-subitem"
                  }
                >
                  Bình luận
                </NavLink>
              </div>
            )}
          </div>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              isActive ? "admin-sidebar-item active" : "admin-sidebar-item"
            }
          >
            <i className="fa-solid fa-gear"></i>
            Cài đặt hệ thống
          </NavLink>
        </nav>
      </div>

      {/* Footer */}
      <div className="admin-sidebar-footer">
        <div className="admin-footer-user">
          <div className="admin-user-avatar">AD</div>
          <div className="admin-user-info">
            <p className="admin-user-name">Admin User</p>
            <p className="admin-user-email">admin@lms.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
