import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./AdminSidebar.css";

export default function AdminSidebar({ isOpen, onClose }) {
  const [openSection, setOpenSection] = useState({
    evaluate: true,
    community: false,
  });

  const toggleSection = (section) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Đóng sidebar khi click vào link trên mobile
  useEffect(() => {
    if (isOpen && window.innerWidth <= 640) {
      const handleLinkClick = () => {
        if (onClose) onClose();
      };

      const links = document.querySelectorAll(
        ".admin-sidebar-item, .admin-sidebar-subitem"
      );
      links.forEach((link) => {
        link.addEventListener("click", handleLinkClick);
      });

      return () => {
        links.forEach((link) => {
          link.removeEventListener("click", handleLinkClick);
        });
      };
    }
  }, [isOpen, onClose]);

  return (
    <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div>
        {/* Header */}
        <div className="admin-sidebar-header">
          <img src="/logo.png" alt="Logo" className="admin-sidebar-logo" />
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

          {/* Quản lý người dùng - không dropdown */}
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "admin-sidebar-item active" : "admin-sidebar-item"
            }
          >
            <i className="fa-solid fa-users"></i>
            Quản lý người dùng
          </NavLink>

          {/* Nội dung khóa học - không dropdown */}
          <NavLink
            to="/admin/courses"
            className={({ isActive }) =>
              isActive ? "admin-sidebar-item active" : "admin-sidebar-item"
            }
          >
            <i className="fa-solid fa-book"></i>
            Quản lý khóa học
          </NavLink>

          {/* Quản lý lớp học - không dropdown */}
          <NavLink
            to="/admin/classes"
            className={({ isActive }) =>
              isActive ? "admin-sidebar-item active" : "admin-sidebar-item"
            }
          >
            <i className="fa-solid fa-chalkboard"></i>
            Quản lý lớp học
          </NavLink>

          {/* Bài kiểm tra - mục cấp 1 */}
          <NavLink
            to="/admin/exam"
            className={({ isActive }) =>
              isActive ? "admin-sidebar-item active" : "admin-sidebar-item"
            }
          >
            <i className="fa-solid fa-clipboard-check"></i>
            Bài kiểm tra
          </NavLink>

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

          {/* Cài đặt */}
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
      <div className="admin-sidebar-logout">
        <button
          type="button"
          className="admin-sidebar-item logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
