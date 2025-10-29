import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">Mankai Admin</div>
      <nav>
        <ul>
          <li className={pathname.includes("/dashboard") ? "active" : ""}>
            <Link to="/admin/dashboard">📊 Dashboard</Link>
          </li>
          <li className={pathname.includes("/users") ? "active" : ""}>
            <Link to="/admin/users">👥 Quản lý người dùng</Link>
          </li>
          <li className={pathname.includes("/settings") ? "active" : ""}>
            <Link to="/admin/settings">⚙️ Cài đặt</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
