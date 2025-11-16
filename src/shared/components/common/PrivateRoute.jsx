import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ role }) {
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  // ❌ Không đăng nhập → về /login
  if (!storedUser) return <Navigate to="/login" replace />;

  // ❌ Sai role → chặn vào
  if (role && storedUser.role !== role) {
    if (storedUser.role === "ROLE_ADMIN")
      return <Navigate to="/admin" replace />;
    if (storedUser.role === "ROLE_USER") return <Navigate to="/home" replace />;
    return <Navigate to="/login" replace />;
  }

  // ✅ Hợp lệ → cho qua
  return <Outlet />;
}
