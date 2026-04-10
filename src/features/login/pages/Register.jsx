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
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
    }

    if (!email) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (phone && !/^\d+$/.test(phone)) {
      newErrors.phone = "Số điện thoại chỉ được chứa chữ số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    const payload = { fullName, gmail: email, password, phone, role: "ROLE_USER" };

    try {
      await authService.register(payload); // dùng service
      showNotification("Thành công", "Đăng ký thành công! Hãy đăng nhập.", "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Đăng ký lỗi:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;

      let errorMessage = "Có lỗi xảy ra, vui lòng thử lại!";

      if (status === 409) {
        errorMessage = "Email này đã được sử dụng. Vui lòng chọn email khác.";
        setErrors({ email: errorMessage });
      } else if (data) {
        errorMessage = typeof data === "string" ? data : (data.message || data.error || errorMessage);
        showNotification("Đăng ký thất bại", errorMessage, "error");
      } else if (err.message) {
        errorMessage = err.message;
        showNotification("Đăng ký thất bại", errorMessage, "error");
      }
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

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: "" });
                }}
                placeholder="Nguyen Van A"
                required
                className={errors.fullName ? "input-error" : ""}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="you@company.com"
                required
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  placeholder="••••••••"
                  required
                  className={errors.password ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                placeholder="0123456789"
                className={errors.phone ? "input-error" : ""}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
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
