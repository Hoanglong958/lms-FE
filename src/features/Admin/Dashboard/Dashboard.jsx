import React from "react";
import AdminHeader from "@components/Admin/AdminHeader";

export default function Dashboard() {
  return (
    <div className="admin-page-wrapper">
      {/* Header riêng cho page này */}
      <AdminHeader title="Dashboard" />

      {/* Nội dung scroll */}
      <div className="admin-content">{/* Các component khác */}</div>
    </div>
  );
}
