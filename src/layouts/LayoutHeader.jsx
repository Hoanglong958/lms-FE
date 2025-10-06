import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import mankaiLogo from "@assets/logos/mankai-logo.svg";
import homeIcon from "@assets/icons/home-icon.svg";
import bookIcon from "@assets/icons/book-icon.svg";
import searchIcon from "@assets/icons/search-icon.svg";
import notiIcon from "@assets/icons/noti-icon.svg";
import avatar from "@assets/images/avatar.svg";
import avatarDropDown from "@assets/images/avatar-dropdown.svg";
import logoutIcon from "@assets/icons/logout-icon.svg";

export default function Header() {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(false);
  return (
    <header className="header-container">
      <div className="header-left">
        <div onClick={() => navigate("/")} className="logo">
          <img src={mankaiLogo} alt="Mankai Logo" className="logo-img" />
        </div>

        <nav className="menu">
          <div className="logo-divider"></div>
          <div className="menu-items">
            <div className="menu-items">
              <div className="menu-item" onClick={() => navigate("/")}>
                <img src={homeIcon} alt="Home" />
                <span>Trang Chủ</span>
              </div>

              <div className="menu-item" onClick={() => navigate("/posts")}>
                <img src={bookIcon} alt="Posts" />
                <span>Bài Viết</span>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="header-right">
        <button className="icon-btn">
          <img src={searchIcon} alt="Search" />
        </button>

        <button className="icon-btn">
          <img src={notiIcon} alt="Notification" />
        </button>

        <div className="avatar-dropdown">
          <button
            className="avatar-btn"
            onClick={() => setOpenDropdown((prev) => !prev)}
          >
            <img src={avatar} alt="Avatar" />
          </button>

          {openDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <div className="avatar">
                  <img src={avatarDropDown} alt="Avatar" />
                </div>
                <div className="user-info">
                  <div className="name">Nguyễn Ánh Viên</div>
                  <div className="email">vien@gmail.com</div>
                </div>
              </div>
              <div className="divider"></div>

              <div className="dropdown-item">Hồ sơ của tôi</div>
              <div className="dropdown-item">Khóa học của tôi</div>
              <div className="divider"></div>
              <div
                className="dropdown-item logout"
                onClick={() => navigate("/login")}
              >
                <img src={logoutIcon} alt="Logout" className="logout-icon" />
                <span>Đăng xuất</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
