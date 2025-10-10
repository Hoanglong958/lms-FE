import React, { useState } from "react";
import "./HomePage.css";
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
  const [searchQuery, setSearchQuery] = useState("");

  const courses = [
    { id: 1, title: "N1 Chill Class", image: N1ChillClass },
    { id: 2, title: "N2 Chill Class", image: N2ChillClass },
    { id: 3, title: "Phát Âm J-Voice", image: PhatAmJVoice },
    { id: 4, title: "IT Talk", image: ITTalk },
    { id: 5, title: "Authentication & Authorization trong ReactJS", image: N1ChillClass },
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
            Hạnh phúc là điểm khởi đầu của giáo dục và cũng là đích đến cuối cùng...
          </p>
          <span>Giang Sensei</span>
        </div>
        <div className="hero-img">
          <img src={heroImg} alt="Giang Sensei" />
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <h1 className="search-title">Tìm kiếm</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm khóa học..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">Tìm kiếm</button>
        </div>
      </section>

      {/* Course Grid */}
      <section className="courses">
        <h2 className="courses-title">TẤT CẢ KHÓA HỌC</h2>
        <div className="course-grid">
          {(searchQuery ? filteredCourses : courses).map((course) => (
            <div className="course-card" key={course.id}>
              <div className="course-image-wrapper">
                <img src={course.image} alt={course.title} className="course-image" />
              </div>

              <div className="course-content">
                <img src={Level} alt="level" className="level-badge" />
                <div className="course-info">
                  <div className="course-meta">
                    <div className="meta-item">
                      <img src={clockIcon} alt="clock" className="meta-icon" />
                      <span>360 phút</span>
                    </div>
                    <div className="meta-item">
                      <img src={bookIcon} alt="book" className="meta-icon" />
                      <span>32 chương</span>
                    </div>
                    <div className="meta-item">
                      <img src={profileIcon} alt="teacher" className="meta-icon" />
                      <span>Giang Sensei</span>
                    </div>
                  </div>
                  <h3 className="course-title">{course.title}</h3>
                </div>
                <button className="btn-learn">
                  <span>Học Ngay</span>
                  <img src={arrowUpRight} alt="arrow" className="btn-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pagination */}
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
