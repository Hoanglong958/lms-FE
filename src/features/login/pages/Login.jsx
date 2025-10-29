import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Danh sách tài khoản có sẵn
  const accounts = [
    {
      role: "admin",
      email: "admin@mankai.com",
      password: "admin123",
    },
    {
      role: "user",
      email: "user@mankai.com",
      password: "user123",
    },
  ];

  // ✅ Kiểm tra nếu đã đăng nhập => chuyển về đúng trang
useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (storedUser) {
    // Nếu đã đăng nhập → đưa về đúng trang
    if (storedUser.role === "admin") navigate("/admin", { replace: true });
    else navigate("/home", { replace: true });
  }
  // ⚠️ Không thêm dependency nào ngoài navigate để tránh lặp
}, []);


  const handleSubmit = (e) => {
    e.preventDefault();

    const foundAccount = accounts.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (foundAccount) {
      alert(`Đăng nhập thành công với vai trò: ${foundAccount.role}!`);

      // ✅ Lưu thông tin đăng nhập
      localStorage.setItem("loggedInUser", JSON.stringify(foundAccount));

      // ✅ Điều hướng theo vai trò
      if (foundAccount.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } else {
      alert("Email hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <img src="/logo.png" alt="Mankai Academy Logo" className="Login-logo" />
          <h1>Đăng nhập</h1>
          <p className="description">
            Khám phá kho tàng kiến thức bất tận cùng bộ tài liệu độc quyền với Mankai Academy
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

            <button type="submit">Đăng nhập</button>

            <p className="forgot-password">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
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
              Kho học liệu miễn phí giúp bạn phát triển bản thân và tìm được việc làm nhanh chóng!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
