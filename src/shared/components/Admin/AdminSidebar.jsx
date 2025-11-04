import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminSidebar.css"; // Import file CSS

// Danh sách các mục menu, dễ dàng quản lý  
const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/admin/users", label: "Quản lý người dùng", icon: "👥" },
  { path: "/admin/courses", label: "Quản lý khóa học", icon: "📚" },
  { path: "/admin/parts", label: "Phân học & Bài học", icon: "📑" },
  { path: "/admin/question-bank", label: "Ngân hàng câu hỏi", icon: "❓" },
  { path: "/admin/quizzes", label: "Quản lý Quiz", icon: "📝" },
  { path: "/admin/exams", label: "Quản lý bài thi", icon: "✍️" },
  { path: "/admin/assignments", label: "Bài tập & Nộp bài", icon: "📤" },
  { path: "/admin/progress", label: "Tiến độ học viên", icon: "📈" },
  { path: "/admin/reports", label: "Báo cáo thống kê", icon: "📉" },
  { path: "/admin/settings", label: "Cấu hình hệ thống", icon: "⚙️" },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();

  // Hàm kiểm tra active state, hỗ trợ cả các route con
  const isActive = (path) => {
    // Trường hợp đặc biệt cho dashboard
    if (path === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    // Các trường hợp khác
    return pathname.startsWith(path);
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span>M</span>
        </div>
        <h2>Admin LMS</h2>
        <button className="collapse-btn">{"<"}</button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className={isActive(item.path) ? "active" : ""}>
              <Link to={item.path}>
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="sidebar-footer">
        <p>© 2024 Admin LMS</p>
        <p>Version 1.0.0</p>
      </footer>
    </aside>
  );
}
