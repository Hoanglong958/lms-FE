import React, { useState, useEffect, useRef } from "react";
// start
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@utils/authService"; // import service
import NotificationModal from "@components/NotificationModal/NotificationModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

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
      const response = await authService.login(payload);
      const { accessToken, user } = response.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      if (user.role === "ROLE_ADMIN") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      console.error("Đăng nhập lỗi:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;

      let message = "Đăng nhập thất bại. Vui lòng thử lại.";

      if (data) {
        if (typeof data === "string") {
          message = data;
        } else if (data.data && typeof data.data === "string") {
          message = data.data;
        } else if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        }
      }

      // Fallback only if we didn't get a specific message from backend
      if (message === "Đăng nhập thất bại. Vui lòng thử lại.") {
        if (status === 401 || status === 403 || status === 400) {
          message = "Tên đăng nhập hoặc mật khẩu không chính xác.";
        } else if (err.message) {
          message = err.message;
        }
      }

      showNotification("Đăng nhập thất bại", message, "error");
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
