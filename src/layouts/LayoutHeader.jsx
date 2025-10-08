import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

// Import tất cả các icon cần thiết
import mankaiLogo from "@assets/logos/mankai-logo.svg";
import homeIcon from "@assets/icons/home-icon.svg";
import bookIcon from "@assets/icons/book-icon.svg";
import searchIcon from "@assets/icons/search-icon.svg";
import notiIcon from "@assets/icons/noti-icon.svg";
import avatar from "@assets/images/avatar.svg";
import avatarDropDown from "@assets/images/avatar-dropdown.svg";
import logoutIcon from "@assets/icons/logout-icon.svg";
import lessonIcon from "@assets/icons/lesson-icon.svg";
import menuIcon from "@assets/icons/menu-icon.svg";
import logoutIcon2 from "@assets/icons/logout-icon-2.svg";

export default function Header() {
  const navigate = useNavigate();
  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* HEADER CHÍNH */}
      <header className="header-container">
        {/* Phần bên trái (Desktop) */}
        <div className="header-left">
          <img
            src={mankaiLogo}
            alt="Mankai Logo"
            className="logo-img"
            onClick={() => handleNavigate("/")}
          />
          <nav className="menu-desktop">
            <div className="logo-divider"></div>
            <div className="menu-items">
              <div className="menu-item" onClick={() => handleNavigate("/")}>
                <img src={homeIcon} alt="Home" />
                <span>Trang Chủ</span>
              </div>
              <div
                className="menu-item"
                onClick={() => handleNavigate("/posts")}
              >
                <img src={bookIcon} alt="Posts" />
                <span>Bài Viết</span>
              </div>
            </div>
          </nav>
        </div>

        {/* Phần bên phải (Desktop) */}
        <div className="header-right-desktop">
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
                  onClick={() => handleNavigate("/login")}
                >
                  <img src={logoutIcon} alt="Logout" className="logout-icon" />
                  <span>Đăng xuất</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nút Hamburger (Chỉ hiển thị trên Mobile) */}
        <button
          className="hamburger-menu"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <img src={menuIcon} alt="Menu" />
        </button>
      </header>

      {/* MENU OVERLAY (Chỉ hiển thị trên Mobile khi được kích hoạt) */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <img
            src={mankaiLogo}
            alt="Mankai Logo"
            className="mobile-menu-logo"
          />
          <div className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            &times;
          </div>
        </div>
        <div className="mobile-menu-content">
          <nav className="mobile-menu-nav">
            <a onClick={() => handleNavigate("/")}>
              <img src={homeIcon} alt="Trang chủ" /> Trang chủ
            </a>
            <a onClick={() => handleNavigate("/lessons")}>
              <img src={lessonIcon} alt="Bài học" /> Bài học
            </a>
            <a onClick={() => handleNavigate("/posts")}>
              <img src={bookIcon} alt="Bài viết" /> Bài viết
            </a>
          </nav>
          <div className="divider-mobile"></div>
          <div className="mobile-menu-user-links">
            <a>Hồ sơ của tôi</a>
            <a>Khóa học của tôi</a>
          </div>
          <div className="mobile-menu-footer">
            <div className="user-info-mobile">
              <div className="avatarlablegroup">
                <img
                  src={avatarDropDown}
                  alt="Avatar"
                  className="avatar-mobile"
                />
                <div className="text-info">
                  <div className="name">Nguyễn Ánh Viên</div>
                  <div className="email">vien@gmail.com</div>
                </div>
              </div>
              <img
                src={logoutIcon2}
                alt="Logout"
                onClick={() => handleNavigate("/login")}
                className="logout-icon-mobile"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
