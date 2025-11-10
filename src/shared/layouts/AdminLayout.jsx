import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@components/Admin/AdminSidebar";
import "@pages/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Sidebar cố định */}
      <AdminSidebar />

      {/* Main area */}
      <div className="admin-main">
        {/* Outlet render page: header + content */}
        <Outlet />
      </div>
    </div>
  );
}
