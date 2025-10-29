import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminHeader.css"; // nếu bạn muốn style riêng

export default function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ✅ Xóa toàn bộ thông tin đăng nhập
    localStorage.removeItem("loggedInUser");

    // ✅ Chuyển về trang login
    navigate("/login", { replace: true });

    // ✅ Reload nhẹ để reset PrivateRoute
    window.location.reload();
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1 className="admin-title">Bảng điều khiển quản trị</h1>
      </div>

      <div className="admin-header-right">
        <span className="admin-welcome">
          Xin chào, <strong>Admin</strong>
        </span>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
