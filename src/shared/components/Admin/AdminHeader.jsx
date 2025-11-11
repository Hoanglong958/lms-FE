// Đường dẫn: @components/Admin/AdminHeader.jsx
// (PHIÊN BẢN NÂNG CẤP)

import React from "react";
// Import file CSS của nó
import "./AdminHeader.css";

// Thêm 'subtitle' vào props
export default function AdminHeader({
  title,
  subtitle, // <-- Thêm prop này
  breadcrumb,
  actions,
}) {
  return (
    // Dùng class .admin-header
    <header className="admin-header">
      {/* CỘT BÊN TRÁI (chứa title, subtitle, breadcrumb) */}
      <div className="admin-header-left">
        {breadcrumb && <nav className="admin-breadcrumb">{breadcrumb}</nav>}
        {title && <h1 className="admin-title">{title}</h1>}

        {/* Thêm 'subtitle' vào đây */}
        {subtitle && <p className="admin-subtitle">{subtitle}</p>}
      </div>

      {/* CỘT BÊN PHẢI (chứa actions/tabs) */}
      <div className="admin-header-right">{actions}</div>
    </header>
  );
}

// Cập nhật Default props
AdminHeader.defaultProps = {
  title: "",
  subtitle: null, // <-- Thêm
  breadcrumb: null,
  actions: null,
};
