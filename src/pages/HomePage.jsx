import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { slugify } from "@utils/slugify";
import useWindowSize from "@hooks/useWindowSize";
import { SERVER_URL } from "@config";
import "./HomePage.css";

// Import các hình ảnh của bạn
import heroImg from "@assets/images/HeroImg.svg";
import quotes1 from "@assets/icons/quotes1.svg";
import quotes2 from "@assets/icons/quotes2.svg";
import clockIcon from "@assets/icons/clock-icon.svg";
import bookIcon from "@assets/icons/book2-icon.svg";
import profileIcon from "@assets/icons/profile-icon.svg";
import arrowUpRight from "@assets/icons/arrow-up-right-icon.svg";
import pattern from "@assets/pattern/clip-path-group.svg";

import { classService } from "@utils/classService";
import { classStudentService } from "@utils/classStudentService";
import { classCourseService } from "@utils/classCourseService";
import { courseService } from "@utils/courseService";

export default function HomePage() {
  const navigate = useNavigate();
  const handleNavigate = (path) => navigate(path);
  const { width } = useWindowSize();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(6); // 6 courses per page for better layout

  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      try {
        if (mounted) setLoading(true);

        const userStr = localStorage.getItem("loggedInUser");
        let userId = null;
        if (userStr) {
          try {
            userId = JSON.parse(userStr).id;
          } catch (e) { }
        }

        // Use paging API
        // If logged in, we might want to filter by enrollment. 
        // For now, let's use the paging API with basic search and pagination.
        const params = {
          page: currentPage,
          size: pageSize,
          q: searchQuery || undefined,
          regStatus: userId ? "PAID" : "ALL" // Show only enrolled if logged in, else all
        };

        const res = await courseService.getCoursesPaging(params);
        
        // Structure: res.data.data.content
        const pagedData = res.data?.data || {};
        const content = pagedData.content || [];
        
        if (mounted) {
          setTotalPages(pagedData.totalPages || 1);
          
          const mapped = content.map(c => ({
            ...c,
            title: c.title || c.courseName || "Khóa học",
            slug: c.slug || c.courseSlug || slugify(c.title || ""),
            imageUrl: c.imageUrl || c.image || null,
            durationMinutes: c.duration || 360,
            totalSessions: c.totalSessions || c.sessions || 32,
            teacherName: c.teacherName || "Giang Sensei",
            level: (c.level || "Beginner").toLowerCase()
          }));
          
          setCourses(mapped);
        }

      } catch (err) {
        console.error("Home load error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCourses();
    return () => { mounted = false; };
  }, [currentPage, searchQuery, pageSize]);

  // Reset to page 0 when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 500, behavior: "smooth" });
    }
  };

  const handleCourseClick = (course) => {
    navigate(`/courses/${course.slug || slugify(course.title)}`);
  };



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
          {courses.map((course, index) => (
            <div
              className="course-card"
              key={index}
              onClick={() => handleCourseClick(course)}
            >
              <div className="course-image-wrapper">
                <img
                  src={course.imageUrl ? (course.imageUrl.startsWith("http") ? course.imageUrl : `${SERVER_URL}${course.imageUrl}`) : "https://placehold.co/600x400?text=Khoa+hoc"}
                  alt={course.title}
                  className="course-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400?text=Khoa+hoc";
                  }}
                />
              </div>
              <div className="course-content">
                <span className={`course-level-badge ${course.level ? course.level.toLowerCase() : "beginner"}`}>{course.level || "Beginner"}</span>
                <div className="course-info">
                  <div className="course-meta">
                    <div className="meta-item">
                      <img src={bookIcon} alt="book" className="meta-icon" />
                      <span>{course.totalSessions || 32} Chương</span>
                    </div>
                  </div>
                  <h3 className="course-title-card">{course.title}</h3>
                </div>
                <button
                  className="btn-learn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseClick(course);
                  }}
                >
                  <span>HỌC NGAY</span>
                  <img src={arrowUpRight} alt="arrow" className="btn-home-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Pagination --- */}
      {totalPages > 1 && (
        <section className="pagination-container">
          <button 
            className="page-btn prev" 
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ← Trước
          </button>
          <div className="pagination">
            {[...Array(totalPages)].map((_, index) => (
              <button 
                key={index} 
                className={`page-number ${currentPage === index ? "active" : ""}`}
                onClick={() => handlePageChange(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button 
            className="page-btn next"
            disabled={currentPage === totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Sau →
          </button>
        </section>
      )}
    </div>
  );
}
