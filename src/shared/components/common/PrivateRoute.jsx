import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ role }) {
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  // ❌ Không đăng nhập → về /login
  if (!storedUser) return <Navigate to="/login" replace />;

  // ✅ Admin có quyền truy cập tất cả (bao gồm routes của User)
  if (storedUser.role === "ROLE_ADMIN") {
    return <Outlet />;
  }

  // ❌ Sai role (User cố vào Admin, hoặc role khác không khớp)
  if (role && storedUser.role !== role) {
    if (storedUser.role === "ROLE_USER") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  // ✅ Hợp lệ → cho qua
  return <Outlet />;
}
