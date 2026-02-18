import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "@config";
import "./Header.css";

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
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Safe user parsing
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    } catch {
      return {};
    }
  })();

  const displayName = user.fullName || user.username || "Người dùng";
  const displayEmail = user.gmail || user.email || "user@example.com";

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // ✅ Hàm xử lý đăng xuất (an toàn)
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("accessToken"); // Also clear token if present
    setOpenDropdown(false);
    setIsMobileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const getAvatarSrc = (path) => {
    if (!path) return avatar;
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${SERVER_URL}${path}`;
  };

  const userAvatar = getAvatarSrc(user.imageUrl || user.avatar);

  return (
    <>
      {/* HEADER CHÍNH */}
      <header className="user-header-container">
        <div className="user-header-left">
          <img
            src={mankaiLogo}
            alt="Mankai Logo"
            className="user-header-logo-img"
            onClick={() => handleNavigate("/dashboard")}
          />
          <nav className="user-header-menu-desktop">
            <div className="user-header-logo-divider"></div>
            <div className="user-header-menu-items">
              <div className="user-header-menu-item" onClick={() => handleNavigate("/dashboard")}>
                <img src={homeIcon} alt="Home" />
                <span>Trang Chủ</span>
              </div>
              <div className="user-header-menu-item" onClick={() => navigate("/bai-viet")}>
                <img src={bookIcon} alt="Posts" />
                <span>Bài Viết</span>
              </div>
              <div className="user-header-menu-item" onClick={() => handleNavigate("/chat")}>
                <img src={notiIcon} alt="Chat" style={{ filter: 'hue-rotate(180deg)' }} />
                <span>Trò chuyện</span>
              </div>
            </div>
          </nav>
        </div>

        <div className="user-header-right-desktop">
          <button className="user-header-icon-btn" onClick={() => navigate("/search")}>
            <img src={searchIcon} alt="Search" />
          </button>
          <button className="user-header-icon-btn">
            <img src={notiIcon} alt="Notification" />
          </button>
          <div
            className="user-header-avatar-dropdown"
            onMouseLeave={() => setOpenDropdown(false)}
          >
            <button
              className="user-header-avatar-btn"
              onClick={() => setOpenDropdown((prev) => !prev)}
            >
              <img src={userAvatar} alt="Avatar" style={{ borderRadius: '50%', objectFit: 'cover' }} />
            </button>
            {openDropdown && (
              <div className="user-header-dropdown-menu">
                <div className="user-header-dropdown-header">
                  <div className="user-header-avatar">
                    <img src={userAvatar} alt="Avatar" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div className="user-header-user-info">
                    <div className="user-header-name">{displayName}</div>
                    <div className="user-header-email">{displayEmail}</div>
                  </div>
                </div>

                <div
                  className="user-header-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(false);
                    navigate("/profile/edit");
                  }}
                >
                  Hồ sơ của tôi
                </div>
                <div className="user-header-dropdown-item" onClick={() => handleNavigate("/home")}>
                  Khóa học của tôi
                </div>

                {/* 🔒 Đăng xuất */}
                <div className="user-header-dropdown-item user-header-logout" onClick={handleLogout}>
                  <img src={logoutIcon} alt="Logout" className="user-header-logout-icon" />
                  <span>Đăng xuất</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MENU MOBILE */}
        <button
          className="user-header-hamburger-menu"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <img src={menuIcon} alt="Menu" />
        </button>
      </header>

      {/* OVERLAY MENU MOBILE */}
      <div className={`user-header-mobile-menu-overlay ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="user-header-mobile-menu-header">
          <img
            src={mankaiLogo}
            alt="Mankai Logo"
            className="user-header-mobile-menu-logo"
          />
          <div className="user-header-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
            &times;
          </div>
        </div>
        <div className="user-header-mobile-menu-content">
          <nav className="user-header-mobile-menu-nav">
            <a onClick={() => handleNavigate("/dashboard")}>
              <img src={homeIcon} alt="Trang chủ" /> Trang chủ
            </a>
            <a onClick={() => handleNavigate("/lessons")}>
              <img src={lessonIcon} alt="Bài học" /> Bài học
            </a>
            <a onClick={() => handleNavigate("/bai-viet")}>
              <img src={bookIcon} alt="Bài viết" /> Bài viết
            </a>
            <a onClick={() => handleNavigate("/chat")}>
              <img src={notiIcon} alt="Trò chuyện" style={{ filter: 'hue-rotate(180deg)' }} /> Trò chuyện
            </a>
          </nav>
          <div className="user-header-divider-mobile"></div>
          <div className="user-header-mobile-menu-user-links">
            <a onClick={() => handleNavigate("/profile/edit")}>Hồ sơ của tôi</a>
            <a onClick={() => handleNavigate("/dashboard")}>Khóa học của tôi</a>
          </div>
          <div className="user-header-mobile-menu-footer">
            <div className="user-header-user-info-mobile">
              <div className="user-header-avatarlablegroup">
                <img
                  src={userAvatar}
                  alt="Avatar"
                  className="user-header-avatar-mobile"
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
                <div className="user-header-text-info">
                  <div className="user-header-name">{displayName}</div>
                  <div className="user-header-email">{displayEmail}</div>
                </div>
              </div>

              {/* 🔒 Logout Mobile */}
              <img
                src={logoutIcon2}
                alt="Logout"
                onClick={handleLogout}
                className="user-header-logout-icon-mobile"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
