import React, { useState, useEffect, useRef } from "react";
// start
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@utils/authService"; // import service
import NotificationModal from "@components/NotificationModal/NotificationModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [errors, setErrors] = useState({});
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};
    if (!email) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const slides = [
    {
      src: "/students.jpg",
      title: "Kho học liệu miễn phí",
      description:
        "Miễn phí truy cập kho tài liệu khổng lồ, bao gồm bài giảng, video và tài liệu đọc phù hợp với mọi đối tượng.",
    },
    {
      src: "/ảnh 6.png",
      title: "Học chủ động",
      description: "Nội dung cập nhật liên tục theo lộ trình rõ ràng.",
    },
    {
      src: "/ảnh 7.png",
      title: "Cộng đồng sôi động",
      description: "Mentor hỗ trợ tận tâm.",
    },
  ];
  const [slideIndex, setSlideIndex] = useState(0);
  const dragStartXRef = useRef(0);
  const draggingRef = useRef(false);
  const handleTouchStart = (e) => {
    dragStartXRef.current = e.touches?.[0]?.clientX || 0;
    draggingRef.current = true;
  };
  const handleTouchEnd = (e) => {
    if (!draggingRef.current) return;
    const endX = e.changedTouches?.[0]?.clientX || 0;
    const dx = endX - dragStartXRef.current;
    draggingRef.current = false;
    if (dx > 50) setSlideIndex((i) => Math.max(0, i - 1));
    else if (dx < -50) setSlideIndex((i) => Math.min(slides.length - 1, i + 1));
  };
  const mouseDownRef = useRef(0);
  const handleMouseDown = (e) => { mouseDownRef.current = e.clientX || 0; draggingRef.current = true; };
  const handleMouseUp = (e) => {
    if (!draggingRef.current) return;
    const dx = (e.clientX || 0) - mouseDownRef.current;
    draggingRef.current = false;
    if (dx > 50) setSlideIndex((i) => Math.max(0, i - 1));
    else if (dx < -50) setSlideIndex((i) => Math.min(slides.length - 1, i + 1));
  };

  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  // Nếu đã login → redirect
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (storedUser) {
      if (storedUser.role === "ROLE_ADMIN") navigate("/admin");
      else if (storedUser.role === "ROLE_TEACHER") navigate("/teacher");
      else if (storedUser.role === "ROLE_USER") navigate("/dashboard");
      else navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const payload = { gmail: email.trim().toLowerCase(), password };
      console.log("Login payload:", payload);
      const response = await authService.login(payload);
      const { accessToken, user } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      if (user.role === "ROLE_ADMIN") navigate("/admin");
      else if (user.role === "ROLE_TEACHER") navigate("/teacher");
      else navigate("/dashboard");
    } catch (err) {
      console.error("Đăng nhập lỗi:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;

      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";

      if (data) {
        if (typeof data === "string") {
          errorMessage = data;
        } else if (data.data && typeof data.data === "string") {
          errorMessage = data.data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      }

      // Fallback only if we didn't get a specific message from backend
      if (errorMessage === "Đăng nhập thất bại. Vui lòng thử lại.") {
        if (status === 401 || status === 403) {
          errorMessage = "Tên đăng nhập hoặc mật khẩu không chính xác.";
        } else if (status === 400) {
          errorMessage = "Thông tin đăng nhập không hợp lệ.";
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      if (status === 401 || status === 403) {
        setErrors({ auth: errorMessage });
      } else {
        showNotification("Đăng nhập thất bại", errorMessage, "error");
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
          <h1>Đăng nhập</h1>
          <p className="description">
            Khám phá kho tàng kiến thức bất tận cùng bộ tài liệu độc quyền với
            Mankai Academy
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                  if (errors.auth) setErrors({ ...errors, auth: "" });
                }}
                placeholder="you@company.com"
                required
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="password-input-container1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                    if (errors.auth) setErrors({ ...errors, auth: "" });
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

            {errors.auth && <span className="error-message" style={{ marginBottom: "10px", textAlign: "center" }}>{errors.auth}</span>}

            <button type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <p className="forgot-password">
              <button
                type="button"
                className="link-button" // Add style if needed or reuse existing
                onClick={() => setShowForgotModal(true)}
                style={{ background: "none", border: "none", color: "#f28c38", cursor: "pointer", padding: 0, fontSize: "14px", fontWeight: "500" }}
              >
                Quên mật khẩu?
              </button>
            </p>

            <p className="register-link">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
          </form>
        </div>

        <div className="login-image"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div className="login-image-slider" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
            {slides.map((s, idx) => (
              <div className="login-slide" key={idx}>
                <img src={s.src} alt={`Slide ${idx + 1}`} className="login-image-photo" />
              </div>
            ))}
          </div>
          <div className="image-caption">
            <h3 className="image-caption-title">{slides[slideIndex]?.title}</h3>
            <p className="image-caption-desc">{slides[slideIndex]?.description}</p>
          </div>
          <div className="login-image-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={"login-dot" + (i === slideIndex ? " active" : "")}
                onClick={() => setSlideIndex(i)}
                aria-label={`Chuyển ảnh ${i + 1}`}
              />
            ))}
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
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}
