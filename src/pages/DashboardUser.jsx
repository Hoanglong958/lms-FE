import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardUser.css";
import dashboardStudent from "@assets/images/dashboard-student.png";

export default function DashboardUser() {
  const navigate = useNavigate();

  // Safe user parsing
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    } catch {
      return {};
    }
  })();

  const displayName = user.fullName || user.username || "Viên";

  const learningSystemCards = [
    {
      id: 1,
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 3.93994H16C8 3.93994 4 7.93994 4 15.9399V25.9399C4 35.9399 8 37.9399 16 37.9399H17C17.56 37.9399 18.28 38.2999 18.6 38.7399L21.6 42.7399C22.92 44.4999 25.08 44.4999 26.4 42.7399L29.4 38.7399C29.78 38.2399 30.38 37.9399 31 37.9399H32C40 37.9399 44 33.9399 44 25.9399V15.9399C44 7.93994 40 3.93994 32 3.93994ZM17.06 24.3399C17.64 24.9199 17.64 25.8799 17.06 26.4599C16.76 26.7599 16.38 26.8999 16 26.8999C15.62 26.8999 15.24 26.7599 14.94 26.4599L10.94 22.4599C10.36 21.8799 10.36 20.9199 10.94 20.3399L14.94 16.3399C15.52 15.7599 16.48 15.7599 17.06 16.3399C17.64 16.9199 17.64 17.8799 17.06 18.4599L14.12 21.3999L17.06 24.3399ZM27.38 17.3199L23.38 26.6599C23.14 27.2199 22.58 27.5599 22 27.5599C21.8 27.5599 21.6 27.5199 21.4 27.4399C20.64 27.1199 20.28 26.2399 20.62 25.4599L24.62 16.1199C24.94 15.3599 25.82 14.9999 26.6 15.3399C27.36 15.6799 27.7 16.5599 27.38 17.3199ZM37.06 22.4599L33.06 26.4599C32.76 26.7599 32.38 26.8999 32 26.8999C31.62 26.8999 31.24 26.7599 30.94 26.4599C30.36 25.8799 30.36 24.9199 30.94 24.3399L33.88 21.3999L30.94 18.4599C30.36 17.8799 30.36 16.9199 30.94 16.3399C31.52 15.7599 32.48 15.7599 33.06 16.3399L37.06 20.3399C37.64 20.9199 37.64 21.8799 37.06 22.4599Z" fill="#DD673C" />
        </svg>
      ),
      title: "LMS",
      description: "Nền tảng quản lý học tập trực tuyến giúp tổ chức, theo dõi, và đánh giá các khóa học và tài liệu học tập",
      path: "/home"
    },
    {
      id: 3,
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M36 26C30.48 26 26 30.48 26 36C26 41.52 30.48 46 36 46C41.52 46 46 41.52 46 36C46 30.48 41.52 26 36 26ZM34.32 38.54C34.82 39.04 34.82 39.86 34.32 40.38C34.06 40.64 33.74 40.76 33.4 40.76C33.06 40.76 32.74 40.64 32.48 40.38L29.02 36.92C28.52 36.42 28.52 35.6 29.02 35.08L32.48 31.62C32.98 31.12 33.8 31.12 34.32 31.62C34.82 32.12 34.82 32.94 34.32 33.46L31.78 36L34.32 38.54ZM42.96 36.92L39.5 40.38C39.24 40.64 38.92 40.76 38.58 40.76C38.24 40.76 37.92 40.64 37.66 40.38C37.16 39.88 37.16 39.06 37.66 38.54L40.22 36L37.68 33.46C37.18 32.96 37.18 32.14 37.68 31.62C38.18 31.12 39 31.12 39.52 31.62L42.98 35.08C43.46 35.6 43.46 36.4 42.96 36.92Z" fill="#F37142" />
          <path d="M42 14.0001V22.9401C42 23.6401 41.32 24.1201 40.68 23.8801C38.46 23.0201 35.98 22.7401 33.38 23.2601C28.18 24.3001 24.04 28.5601 23.18 33.8001C22.66 37.0001 23.3 40.0201 24.76 42.4801C25.16 43.1601 24.68 44.0001 23.9 44.0001H16C9 44.0001 6 40.0001 6 34.0001V14.0001C6 8.68009 8.36 4.94009 13.78 4.16009C14.36 4.08009 14.88 4.54009 14.9 5.14009L14.96 7.16009C15.02 10.3601 17.72 13.0001 20.96 13.0001H27C30.3 13.0001 33 10.3001 33 7.00009V5.14009C33 4.54009 33.52 4.06009 34.1 4.14009C39.6 4.88009 42 8.64009 42 14.0001Z" fill="#F37142" />
          <path d="M30.0002 6V7C30.0002 8.64 28.6402 10 27.0002 10H20.9402C19.3202 10 17.9802 8.7 17.9402 7.08L17.9202 6.06C17.8802 4.92 18.7802 4 19.9202 4H28.0002C29.1002 4 30.0002 4.9 30.0002 6Z" fill="#F37142" />
        </svg>
      ),
      title: "Bài kiểm tra",
      description: "Các bài kiểm tra được thiết kế để đánh giá trình độ và hiệu biết của người học trong một lĩnh vực cụ thể",
      path: "/exam"
    },
    {
      id: 4,
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_classes)">
            <path d="M40 8H30L28 6H20L18 8H8C6.9 8 6 8.9 6 10V38C6 39.1 6.9 40 8 40H40C41.1 40 42 39.1 42 38V10C42 8.9 41.1 8 40 8ZM24 34C19.58 34 16 30.42 16 26C16 21.58 19.58 18 24 18C28.42 18 32 21.58 32 26C32 30.42 28.42 34 24 34Z" fill="#F37142" />
            <circle cx="24" cy="26" r="6" fill="#FF8C42" />
          </g>
          <defs>
            <clipPath id="clip0_classes">
              <rect width="48" height="48" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      title: "Lớp học",
      description: "Xem danh sách các lớp học, thời khoá biểu và theo dõi tiến độ học tập của bạn",
      path: "/classes"
    },
    {
      id: 5,
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M42 12V32C42 38 40 40 34 40H14C8 40 6 38 6 32V12C6 6 8 4 14 4H34C40 4 42 6 42 12Z" fill="#F37142" />
          <path d="M16 18H32" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 26H26" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
      title: "Đăng ký khóa học",
      description: "Đăng ký các khóa học mới và quản lý học phí của bạn",
      path: "/registrations"
    },
  ];

  return (
    <div className="dashboard-user">
      <div className="dashboard-banner">
        <div className="banner-content">
          <h1 className="banner-title">Xin chào {displayName} ♥</h1>
          <p className="banner-subtitle">
            Cùng khám phá kho tàng kiến thức bất tận cùng bộ tài liệu độc quyền với Rikkei Education nhé!
          </p>
        </div>

        <div className="banner-image">
          <img src={dashboardStudent} alt="Dashboard illustration" />
        </div>
      </div>

      <div className="learning-system-section">
        <h2 className="section-title">Hệ thống học tập</h2>

        <div className="learning-cards-grid">
          {learningSystemCards.map((card) => (
            <div
              key={card.id}
              className="learning-card"
              onClick={() => navigate(card.path)}
            >
              <div className="card-icon">{card.icon}</div>

              <div className="card-content">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
