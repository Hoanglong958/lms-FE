import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@components/Admin/AdminSidebar";
import AdminHeader from "@components/Admin/AdminHeader";
import "@pages/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <div className="admin-content">
          <Outlet /> {/* Hiển thị trang con như Dashboard, Users,... */}
        </div>
      </div>
    </div>
  );
}
