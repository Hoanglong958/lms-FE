// Đường dẫn: @components/Admin/AdminHeader.jsx
// (PHIÊN BẢN NÂNG CẤP - nút Quay lại là 1 div riêng, nằm trước bên trái của title và breadcrumb)

import React from "react";
import Breadcrumb from "@components/common/Breadcrumb";
// Import file CSS của nó
import "./AdminHeader.css";

// Thêm 'subtitle' vào props
export default function AdminHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  onMenuToggle,
  onBack, // <-- Thêm prop này
}) {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        {/* Back button ở 1 div riêng, nằm ở trước (bên trái) của title và breadcrumb */}
        <div className="admin-back-wrap">
          {onBack ? (
            <button
              className="admin-back-button"
              onClick={onBack}
              type="button"
              title="Quay lại"
            >
              ← Quay lại
            </button>
          ) : (
            <div className="admin-back-placeholder" />
          )}
        </div>

        {/* Phần chính chứa hamburger, title, breadcrumb và subtitle */}
        <div className="admin-header-main">
          <div className="admin-header-top">
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

            {title && <h1 className="admin-title">{title}</h1>}
          </div>

          {/* Breadcrumb vẫn dưới title */}
          <Breadcrumb customItems={breadcrumb} />

          {subtitle && <p className="admin-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="admin-header-right">{actions}</div>
    </header>
  );
}

// Default props
AdminHeader.defaultProps = {
  title: "",
  subtitle: null,
  breadcrumb: null,
  actions: null,
  onBack: null, // <-- Default null
};
