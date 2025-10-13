import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "user@example.com" && password === "password123") {
      alert("Đăng nhập thành công!");
      navigate("@pages/HomePage");
    } else {
      alert("Email hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <img src="/logo.png" alt="Mankai Academy Logo" className="logo" />
          <h1>Đăng nhập</h1>
          <p className="description">
            Đăng nhập để bắt đầu với tài liệu học tập của Mankai Academy
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
              Khóa học giúp mình phát triển bản thân và tìm được việc làm nhanh
              chóng!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
