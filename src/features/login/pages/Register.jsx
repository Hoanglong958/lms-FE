import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@utils/authService"; // import service
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const navigate = useNavigate();

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { fullName, gmail: email, password, phone, role: "ROLE_USER" };

    try {
      await authService.register(payload); // dùng service
      showNotification("Thành công", "Đăng ký thành công! Hãy đăng nhập.", "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Đăng ký lỗi:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;

      let message = "Có lỗi xảy ra, vui lòng thử lại!";

      if (status === 409) {
        message = "Email này đã được sử dụng. Vui lòng chọn email khác.";
      } else if (data) {
        message = typeof data === "string" ? data : (data.message || data.error || message);
      } else if (err.message) {
        message = err.message;
      }

      showNotification("Đăng ký thất bại", message, "error");
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
          <h1>Đăng ký</h1>
          <p className="description">
            Tạo tài khoản để truy cập kho học liệu và các khóa học miễn phí!
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyen Van A"
                required
              />
            </div>

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
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0123456789"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <p className="forgot-password">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
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
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
