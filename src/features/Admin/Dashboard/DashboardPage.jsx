// Đường dẫn: src/features/Admin/Dashboard/DashboardPage.jsx
// (SỬA LẠI ĐỂ TRUYỀN TABS VÀO ACTIONS)

import React from "react";
import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import AdminHeader from "@components/Admin/AdminHeader";
import "./Dashboard.css"; // Import file CSS chung

const DashboardPage = () => {
  const { toggleSidebar } = useOutletContext() || {};

  return (
    <div className="dashboard-main">
      <AdminHeader
        title="Dashboard"
        onMenuToggle={toggleSidebar}
        actions={
          // Dùng class "dashboard-nav-in-header"
          <nav className="dashboard-nav-in-header">
            <NavLink
              to="/admin/dashboard" // Link cho 'index' route
              end
              className={({ isActive }) =>
                isActive ? "dashboard-nav-link active" : "dashboard-nav-link"
              }
            >
              Tổng Quan
            </NavLink>
            <NavLink
              to="/admin/dashboard/details" // Link đến trang Chi Tiết
              className={({ isActive }) =>
                isActive ? "dashboard-nav-link active" : "dashboard-nav-link"
              }
            >
              Báo Cáo Chi Tiết
            </NavLink>
          </nav>
        }
      />

      <div className="admin-main-content">
        <div className="dashboard-content-outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
