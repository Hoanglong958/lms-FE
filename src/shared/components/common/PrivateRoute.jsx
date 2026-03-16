import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ role }) {
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!storedUser) return <Navigate to="/login" replace />;

  if (storedUser.role === "ROLE_ADMIN") {
    return <Outlet />;
  }

  if (storedUser.role === "ROLE_TEACHER") {
    if (role === "ROLE_TEACHER" || role === "ROLE_USER" || !role) {
      return <Outlet />;
    }
    return <Navigate to="/teacher/dashboard" replace />;
  }

  if (role && storedUser.role !== role) {
    if (storedUser.role === "ROLE_USER") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
