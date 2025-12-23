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

  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      try {
        if (mounted) setLoading(true);

        // 1. Fetch Master List of Courses (Contains full info: imageUrl, description, etc.)
        const courseRes = await courseService.getCourses();
        const allCoursesRaw = courseRes.data?.data?.content || courseRes.data?.data || courseRes.data || [];
        const fullCourses = Array.isArray(allCoursesRaw) ? allCoursesRaw : [];

        const userStr = localStorage.getItem("loggedInUser");
        let userId = null;
        if (userStr) {
          try {
            userId = JSON.parse(userStr).id;
          } catch (e) { }
        }

        let displayCourses = [];

        if (userId) {
          // LOGGED IN: Identify enrolled course IDs, then pick from master list

          // A. Fetch all classes
          const classRes = await classService.getClasses();
          const allClasses = classRes.data?.data?.content || classRes.data?.data || classRes.data || [];

          // B. Filter enrolled classes
          const enrollmentChecks = await Promise.all(
            (Array.isArray(allClasses) ? allClasses : []).map(async (cls) => {
              try {
                const sRes = await classStudentService.getClassStudents(cls.id);
                const students = sRes.data?.data || sRes.data || [];
                const isEnrolled = Array.isArray(students) && students.some(s =>
                  String(s.studentId) === String(userId) || String(s.id) === String(userId)
                );
                return isEnrolled ? cls : null;
              } catch (err) {
                return null;
              }
            })
          );
          const myClasses = enrollmentChecks.filter(c => c !== null);

          // C. Collect Course IDs from these classes
          const coursePromises = myClasses.map(cls => classCourseService.getClassCourses(cls.id));
          const courseResponses = await Promise.all(coursePromises);

          const enrolledCourseIds = new Set();
          courseResponses.forEach(res => {
            const cList = res.data?.data || res.data || [];
            if (Array.isArray(cList)) {
              cList.forEach(c => {
                // c might be a ClassCourse link or a Course object. Ensure we get the Course ID.
                enrolledCourseIds.add(String(c.courseId || c.id));
              });
            }
          });

          // D. Filter the Master List
          // This ensures we display the "Full" course object with proper images
          displayCourses = fullCourses.filter(c => enrolledCourseIds.has(String(c.id)));

        } else {
          // NOT LOGGED IN: Show all courses
          displayCourses = fullCourses;
        }

        // Map for display
        const mapped = displayCourses.map(c => ({
          ...c,
          title: c.title || c.courseName || "Khóa học",
          slug: c.slug || c.courseSlug || slugify(c.title || ""),
          // Prioritize imageUrl, allow generic fallback in JSX
          imageUrl: c.imageUrl || c.image || null,
          durationMinutes: c.duration || 360,
          totalSessions: c.totalSessions || c.sessions || 32,
          teacherName: c.teacherName || "Giang Sensei",
          level: c.level || "Beginner"
        }));

        if (mounted) setCourses(mapped);

      } catch (err) {
        console.error("Home load error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCourses();
    return () => { mounted = false; };
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleCourseClick = (course) => {
    const slug = course.slug || slugify(course.title);
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
          {filteredCourses.map((course, index) => (
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
