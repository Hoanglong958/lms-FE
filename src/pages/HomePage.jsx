// HomePage.jsx
import React from "react";
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
            cùng. Giang, với hơn 10 năm kinh nghiệm giảng dạy và luyện thi JLPT,
            mong muốn giúp các bạn rút ngắn thời gian, vượt qua khó khăn trong
            việc học tiếng Nhật, và chinh phục tấm bằng JLPT. Hãy biến học tập
            thành không chỉ là mục tiêu phát triển bản thân mà còn là hành trình
            hạnh phúc để hiện thực hóa những giấc mơ.
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
      {/* Course Grid */}
      <section className="courses">
        <h2 className="courses-title">TẤT CẢ KHÓA HỌC</h2>

        <div className="course-grid">
          {[N1ChillClass, N2ChillClass, PhatAmJVoice, ITTalk].map(
            (img, index) => {
              const courseTitles = [
                "N1 Chill Class",
                "N2 Chill Class",
                "Phát Âm J-Voice",
                "IT Talk",
              ];

              return (
                <div className="course-row" key={index}>
                  {[0, 1, 2].map((_, subIndex) => (
                    <div className="course-card" key={subIndex}>
                      {/* Course Image */}
                      <div className="course-image-wrapper">
                        <img
                          src={img}
                          alt={`Course ${index + 1}`}
                          className="course-image"
                        />
                      </div>

                      <div className="course-content">
                        {/* Level Badge */}
                        <img src={Level} alt="level" className="level-badge" />

                        {/* Course Info */}
                        <div className="course-info">
                          <div className="course-meta">
                            <div className="meta-item duration">
                              <img
                                src={clockIcon}
                                alt="clock"
                                className="meta-icon"
                              />
                              <span>360 phút</span>
                            </div>

                            <div className="divider"></div>

                            <div className="meta-item lessons">
                              <img
                                src={bookIcon}
                                alt="book"
                                className="meta-icon"
                              />
                              <span>32 Chương</span>
                            </div>

                            <div className="divider"></div>

                            <div className="meta-item teacher">
                              <img
                                src={profileIcon}
                                alt="teacher"
                                className="meta-icon"
                              />
                              <span>Giang Sensei</span>
                            </div>
                          </div>

                          <h3 className="course-title">
                            {courseTitles[index]}
                          </h3>
                        </div>

                        {/* Learn Now Button */}
                        <button className="btn-learn">
                          <span>Học Ngay</span>
                          <img
                            src={arrowUpRight}
                            alt="arrow up right"
                            className="btn-icon"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* Pagination */}
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
