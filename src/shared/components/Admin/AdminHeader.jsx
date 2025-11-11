// Đường dẫn: @components/Admin/AdminHeader.jsx
// (PHIÊN BẢN NÂNG CẤP)

import React from "react";
import Breadcrumb from "@components/common/Breadcrumb";
// Import file CSS của nó
import "./AdminHeader.css";

// Thêm 'subtitle' vào props
export default function AdminHeader({
  title,
  subtitle, // <-- Thêm prop này
  breadcrumb, // Có thể là customItems array hoặc null để dùng auto
  actions,
  onMenuToggle, // Callback để toggle sidebar
}) {
  // Luôn render button, CSS sẽ điều khiển việc hiển thị
  return (
    // Dùng class .admin-header
    <header className="admin-header">
      {/* CỘT BÊN TRÁI (chứa title, subtitle, breadcrumb) */}
      <div className="admin-header-left">
        {/* Hamburger menu button cho mobile - luôn render, CSS sẽ ẩn/hiện */}
        <button
          className="admin-menu-toggle"
          onClick={onMenuToggle || (() => {})}
          aria-label="Toggle menu"
          type="button"
          title="Menu"
        >
          <span className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        {/* Sử dụng Breadcrumb component động */}
        <Breadcrumb customItems={breadcrumb} />
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
  breadcrumb: null, // null = tự động, hoặc array customItems
  actions: null,
};
