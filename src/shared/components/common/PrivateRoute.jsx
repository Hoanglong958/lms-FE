import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ role }) {
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  // ❌ Không đăng nhập → về /login
  if (!storedUser) return <Navigate to="/login" replace />;

  // ✅ Admin có quyền truy cập tất cả (tất cả các role khác)
  if (storedUser.role === "ROLE_ADMIN") {
    return <Outlet />;
  }

  // ✅ Giáo viên có quyền truy cập vào route của mình và route của User
  if (storedUser.role === "ROLE_TEACHER") {
    if (role === "ROLE_TEACHER" || role === "ROLE_USER" || !role) {
      return <Outlet />;
    }
    // Nếu cố vào Admin route
    return <Navigate to="/teacher/dashboard" replace />;
  }

  // ❌ Sai role (User cố vào Admin/Teacher, hoặc role không khớp)
  if (role && storedUser.role !== role) {
    if (storedUser.role === "ROLE_USER") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  // ✅ Hợp lệ → cho qua
  return <Outlet />;
}
