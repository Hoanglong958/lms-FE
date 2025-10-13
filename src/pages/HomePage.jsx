import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import useWindowSize from "@hooks/useWindowSize";
import "./HomePage.css";

// Import các hình ảnh của bạn
import heroImg from "@assets/images/HeroImg.svg";
import quotes1 from "@assets/icons/quotes1.svg";
import quotes2 from "@assets/icons/quotes2.svg";
import N1ChillClass from "@assets/images/N1ChillClass.svg";
import N2ChillClass from "@assets/images/N2ChillClass.svg";
import PhatAmJVoice from "@assets/images/PhatAmJVoice.svg";
import ITTalk from "@assets/images/ITTalk.svg";
import clockIcon from "@assets/icons/clock-icon.svg";
import bookIcon from "@assets/icons/book2-icon.svg";
import profileIcon from "@assets/icons/profile-icon.svg";
import Level from "@assets/images/Level.svg";
import arrowUpRight from "@assets/icons/arrow-up-right-icon.svg";
import pattern from "@assets/pattern/clip-path-group.svg";

export default function HomePage() {
  const navigate = useNavigate();
  const handleNavigate = (path) => {
    navigate(path);
  };
  const { width } = useWindowSize();

  const originalCourses = [
    {
      id: "n1-chill-class",
      img: N1ChillClass,
      title: "N1 Chill Class",
    },
    {
      id: "n2-chill-class",
      img: N2ChillClass,
      title: "N2 Chill Class",
    },
    {
      id: "phat-am-j-voice",
      img: PhatAmJVoice,
      title: "Phát Âm J-Voice",
    },
    {
      id: "it-talk",
      img: ITTalk,
      title: "IT Talk",
    },
  ];

  let repetitions;
  if (width > 820) {
    repetitions = 3; // Desktop: 3 bản sao
  } else if (width > 375) {
    repetitions = 2; // Tablet: 2 bản sao
  } else {
    repetitions = 1; // Mobile: 1 bản sao
  }
  const repetitionArray = Array.from({ length: repetitions });

  const [searchQuery, setSearchQuery] = useState("");

  const courses = [
    { id: 1, title: "N1 Chill Class", image: N1ChillClass },
    { id: 2, title: "N2 Chill Class", image: N2ChillClass },
    { id: 3, title: "Phát Âm J-Voice", image: PhatAmJVoice },
    { id: 4, title: "IT Talk", image: ITTalk },
    {
      id: 5,
      title: "Authentication & Authorization trong ReactJS",
      image: N1ChillClass,
    },
  ];

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="pattern">
          <img src={pattern} alt="Pattern" />
        </div>
        <img src={quotes1} alt="Quote Start" className="quote quote1" />
        <img src={quotes2} alt="Quote End" className="quote quote2" />

        <div className="hero-text">
          <p>
            Hạnh phúc là điểm khởi đầu của giáo dục và cũng là đích đến cuối
            cùng. Giang, với <b>hơn 10 năm kinh nghiệm giảng dạy</b> và luyện
            thi JLPT, mong muốn giúp các bạn rút ngắn thời gian, vượt qua khó
            khăn trong việc học tiếng Nhật, và <b>chinh phục tấm bằng JLPT</b>.
            Hãy biến học tập thành không chỉ là mục tiêu phát triển bản thân mà
            còn là hành trình hạnh phúc để hiện thực hóa những giấc mơ. Hạnh
            phúc là điểm khởi đầu của giáo dục và cũng là đích đến cuối cùng...
          </p>
          <span>Giang Sensei</span>
        </div>
        <div className="hero-img">
          <img src={heroImg} alt="Giang Sensei" />
        </div>
      </section>

      {/* --- Course Grid --- */}
      <section className="courses">
        <h2 className="courses-title">TẤT CẢ KHÓA HỌC</h2>
        <div className="course-grid">
          {/* Cấu trúc này sẽ nhóm các bài học giống nhau vào cùng 1 hàng */}
          {originalCourses.map((course, index) => (
            <div className="course-row" key={index}>
              {/* Lặp 3 lần để tạo 3 bản sao trên cùng 1 hàng */}
              {repetitionArray.map((_, subIndex) => (
                <div
                  className="course-card"
                  key={subIndex}
                  onClick={() => navigate(`/lessons/${course.id}`)}
                >
                  <div className="course-image-wrapper">
                    <img
                      src={course.img}
                      alt={course.title}
                      className="course-image"
                    />
                  </div>
                  <div className="course-content">
                    <img src={Level} alt="level" className="level-badge" />
                    <div className="course-info">
                      <div className="course-meta">
                        <div className="meta-item">
                          <img
                            src={clockIcon}
                            alt="clock"
                            className="meta-icon"
                          />
                          <span>360 phút</span>
                        </div>
                        <div className="divider"></div>
                        <div className="meta-item">
                          <img
                            src={bookIcon}
                            alt="book"
                            className="meta-icon"
                          />
                          <span>32 Chương</span>
                        </div>
                        <div className="divider"></div>
                        <div className="meta-item">
                          <img
                            src={profileIcon}
                            alt="teacher"
                            className="meta-icon"
                          />
                          <span>Giang Sensei</span>
                        </div>
                      </div>
                      <h3 className="course-title-card">{course.title}</h3>
                    </div>
                    <button
                      className="btn-learn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(`/lessons/${course.id}`);
                      }}
                    >
                      <span>HỌC NGAY</span>
                      <img
                        src={arrowUpRight}
                        alt="arrow"
                        className="btn-icon"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* --- Pagination --- */}
      <section className="pagination-container">
        <button className="page-btn prev">← Trước</button>
        <div className="pagination">
          {[1, 2, 3, 4, 5].map((num) => (
            <button key={num} className="page-number">
              {num}
            </button>
          ))}
        </div>
        <button className="page-btn next">Sau →</button>
      </section>
    </div>
  );
}
