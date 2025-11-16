import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./login.css";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      fullName,
      email,
      password,
      phone,
      role: "USER", // mặc định là USER
    };

    console.log("Payload register:", payload);

    try {
      // Gọi API register
      const res = await axios.post(
        "http://localhost:3900/api/v1/auth/register",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Register response:", res.data);

      alert("Đăng ký thành công! Hãy đăng nhập.");

      // Điều hướng về trang login
      navigate("/login");
    } catch (err) {
      console.error("Đăng ký lỗi:", err);
      if (err.response) {
        console.log("Response data:", err.response.data);
        alert(
          `Đăng ký lỗi! Code: ${err.response.status}, Message: ${JSON.stringify(
            err.response.data
          )}`
        );
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại!");
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
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
    </div>
  );
}
