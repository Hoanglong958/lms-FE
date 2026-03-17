import React, { useState } from "react";
import "./Footer.css";
import mankaiLogo from "@assets/logos/mankai-logo.svg";
import facebookIcon from "@assets/icons/facebook-icon.svg";
import youtubeIcon from "@assets/icons/youtube-icon.svg";
import copyrightIcon from "@assets/icons/copyright-icon.svg";
import buildingIcon from "@assets/icons/building-icon.svg";
import phoneIcon from "@assets/icons/phone-icon.svg";
import mailIcon from "@assets/icons/mail-icon.svg";
import abstractBanner from "@assets/images/anh1.png";

export default function LayoutFooter() {
  return (
    <footer className="footer-container">
      <div className="footer-bg-banner">
        <img src={abstractBanner} alt="Gradient Banner" />
      </div>

      {/* Frame 52: Container logo + title + divider */}
      <div className="footer-top">
        {/* Frame 54: Logo box */}
        <div className="footer-logo-box">
          <div className="logo-background">
            <img src={mankaiLogo} alt="Mankai Logo" className="footer-logo" />
          </div>
        </div>

        {/* Title */}
        <h2 className="footer-title">
          LMS ACADEMY - HỌC VIỆN ĐÀO TẠO THỰC CHIẾN GIỎI NHẤT THẾ GIỚI
        </h2>

        {/* Divider */}
        <div className="footer-divider"></div>
      </div>

      {/* Group middle sections for layout control */}
      <div className="footer-content">
        {/* Footer Contact Info */}
        <div className="footer-contact">
          <h3 className="contact-heading-main">THÔNG TIN LIÊN HỆ</h3>
          <div className="contact-item">
            <img src={buildingIcon} alt="Address" className="contact-icon" />
            <p className="contact-detail-inline">
              <span className="contact-label">Địa chỉ:</span>
              <span className="contact-value">
                Tòa Sông Đà, Đường Phạm Hùng, Mỹ Đình, Nam Từ Liêm, Hà Nội
              </span>
            </p>
          </div>
          <div className="contact-item">
            <img src={phoneIcon} alt="Hotline" className="contact-icon" />
            <p className="contact-detail-inline">
              <span className="contact-label">Hotline:</span>
              <span className="contact-value">0835 626 538</span>
            </p>
          </div>
          <div className="contact-item">
            <img src={mailIcon} alt="Email" className="contact-icon" />
            <p className="contact-detail-inline">
              <span className="contact-label">Email:</span>
              <span className="contact-value">support@lms.edu.vn</span>
            </p>
          </div>
        </div>

        {/* Frame 58: Social */}
        <div className="footer-social">
          <h3 className="footer-heading">THEO DÕI CHÚNG TÔI TẠI</h3>
          <div className="social-icons">
            <div className="social-icon">
              <a href="https://www.facebook.com/reel/1376240206860384" target="_blank" rel="noopener noreferrer">
                <img src={facebookIcon} alt="Facebook" />
              </a>
            </div>
            <div className="social-icon">
              <a
                href="https://youtu.be/dQw4w9WgXcQ?si=N3eNOxQg-NBFLHmj"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={youtubeIcon} alt="YouTube" />
              </a>
            </div>
          </div>
        </div>

        {/* Quote section */}
        <div className="footer-quote-section">
          <div className="footer-quote">
            <p className="quote-text">
              “Hạnh phúc là điểm khởi đầu của giáo dục và cũng là đích đến cuối
              cùng. Lâm, với hơn 10 năm kinh nghiệm giảng dạy và luyện thi
              , mong muốn giúp các bạn rút ngắn thời gian, vượt qua khó khăn
              trong việc học. Hãy biến
              học tập thành không chỉ là mục tiêu phát triển bản thân mà còn là
              hành trình hạnh phúc để hiện thực hóa những giấc mơ.”
            </p>
          </div>

          <div className="footer-quote-2">
            <p className="quote-text-2">
              Anh Nguyễn Viết Lâm – CEO MANKAI Academy
            </p>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="footer-bottom">
        <div className="footer-copyright-icon">
          <img src={copyrightIcon} alt="Copyright" />
        </div>
        <p className="footer-copyright-text">
          2026 By MANKAI Academy - All rights reserved.
        </p>
      </div>
    </footer>
  );
}
