import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ role }) {
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  // ❌ Không đăng nhập → về /login
  if (!storedUser) return <Navigate to="/login" replace />;

  // ❌ Sai role → chặn vào
  if (role && storedUser.role !== role) {
    return storedUser.role === "admin"
      ? <Navigate to="/admin" replace />
      : <Navigate to="/home" replace />;
  }

  // ✅ Hợp lệ → cho qua
  return <Outlet />;
}
