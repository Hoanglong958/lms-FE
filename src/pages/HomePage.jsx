import React from "react";
import useWindowSize from "@hooks/useWindowSize"; // Đảm bảo đường dẫn này đúng
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
  const { width } = useWindowSize();

  const originalCourses = [
    {
      img: N1ChillClass,
      title: "N1 Chill Class",
      level: "Beginner",
      duration: "360 phút",
      lessons: "32 Chương",
      teacher: "Giang Sensei",
    },
    {
      img: N2ChillClass,
      title: "N2 Chill Class",
      level: "Intermediate",
      duration: "420 phút",
      lessons: "40 Chương",
      teacher: "Giang Sensei",
    },
    {
      img: PhatAmJVoice,
      title: "Phát Âm J-Voice",
      level: "Beginner",
      duration: "180 phút",
      lessons: "15 Chương",
      teacher: "Giang Sensei",
    },
    {
      img: ITTalk,
      title: "IT Talk",
      level: "Advanced",
      duration: "240 phút",
      lessons: "20 Chương",
      teacher: "Giang Sensei",
    },
  ];

  let repetitions;
  if (width > 1024) {
    repetitions = 3; // Desktop: 3 bản sao
  } else if (width > 819) {
    repetitions = 2; // Tablet: 2 bản sao
  } else {
    repetitions = 1; // Mobile: 1 bản sao
  }
  const repetitionArray = Array.from({ length: repetitions });

  return (
    <div className="home-page">
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
            còn là hành trình hạnh phúc để hiện thực hóa những giấc mơ.
          </p>
          <span>Giang Sensei</span>
        </div>
        <div className="hero-img">
          <img src={heroImg} alt="Giang Sensei" />
        </div>
        <div className="pagination-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
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
                <div className="course-card" key={subIndex}>
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
                    <button className="btn-learn">
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
        {/* Previous button */}
        <button className="page-btn prev">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.8332 7.00008H1.1665M1.1665 7.00008L6.99984 12.8334M1.1665 7.00008L6.99984 1.16675"
              stroke="#848484"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span>Trước</span>
        </button>

        {/* Page Numbers */}
        <div className="pagination">
          {[1, 2, 3].map((num) => (
            <button key={num} className="page-number">
              {num}
            </button>
          ))}

          <span className="dots">…</span>

          {[8, 9, 10].map((num) => (
            <button key={num} className="page-number">
              {num}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button className="page-btn next">
          <span>Sau</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.1665 7.00008H12.8332M12.8332 7.00008L6.99984 1.16675M12.8332 7.00008L6.99984 12.8334"
              stroke="#848484"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </section>
    </div>
  );
}
