import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@utils/authService"; // import service
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Nếu đã login → redirect
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (storedUser) {
      if (storedUser.role === "ROLE_ADMIN") navigate("/admin");
      else if (storedUser.role === "ROLE_USER") navigate("/dashboard");
      else navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { gmail: email.trim().toLowerCase(), password };
      console.log("Login payload:", payload);
      const response = await authService.login(payload); // backend dùng 'gmail'
      const { accessToken, user } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      if (user.role === "ROLE_ADMIN") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      console.error("Đăng nhập lỗi:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message =
        data?.message || data?.error || err.message || "Lỗi không xác định";
      alert(`Đăng nhập lỗi! Status: ${status || "n/a"}. Message: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <img
            src="/logo.png"
            alt="Mankai Academy Logo"
            className="Login-logo"
          />
          <h1>Đăng nhập</h1>
          <p className="description">
            Khám phá kho tàng kiến thức bất tận cùng bộ tài liệu độc quyền với
            Mankai Academy
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <p className="forgot-password">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </p>

            <p className="register-link">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
          </form>
        </div>

        <div className="login-image">
          <img
            src="/students.jpg"
            alt="Mankai Students"
            className="login-image-photo"
          />
          <div className="image-caption">
            <p>
              Kho học liệu miễn phí giúp bạn phát triển bản thân và tìm được
              việc làm nhanh chóng!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
