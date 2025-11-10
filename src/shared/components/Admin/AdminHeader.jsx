// AdminHeader.jsx
import React from "react";
import "./AdminHeader.css";

export default function AdminHeader({ title, breadcrumb, actions }) {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        {breadcrumb && <nav className="admin-breadcrumb">{breadcrumb}</nav>}
        {title && <h1 className="admin-title">{title}</h1>}
      </div>

      <div className="admin-header-right">{actions}</div>
    </header>
  );
}

// Default props nếu không truyền
AdminHeader.defaultProps = {
  title: "",
  breadcrumb: null,
  actions: null,
};
