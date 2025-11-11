import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@components/Admin/AdminSidebar";
import "@pages/admin.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Đóng sidebar khi resize lên desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Overlay cho mobile */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main area */}
      <div className="admin-main">
        {/* Outlet render page: header + content */}
        <Outlet context={{ toggleSidebar }} />
      </div>
    </div>
  );
}
