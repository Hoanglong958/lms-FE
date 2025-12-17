import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { slugify } from "@utils/slugify";
import useWindowSize from "@hooks/useWindowSize";
import "./HomePage.css";

// Import các hình ảnh của bạn
import heroImg from "@assets/images/HeroImg.svg";
import quotes1 from "@assets/icons/quotes1.svg";
import quotes2 from "@assets/icons/quotes2.svg";
import clockIcon from "@assets/icons/clock-icon.svg";
import bookIcon from "@assets/icons/book2-icon.svg";
import profileIcon from "@assets/icons/profile-icon.svg";
import Level from "@assets/images/Level.svg";
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

        const userStr = localStorage.getItem("loggedInUser");
        let userId = null;
        if (userStr) {
          try {
            userId = JSON.parse(userStr).id;
          } catch (e) { }
        }

        if (userId) {
          // 1. Fetch all classes
          const classRes = await classService.getClasses();
          const allClasses = classRes.data?.data?.content || classRes.data?.data || classRes.data || [];

          // 2. Filter enrolled classes
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

          // 3. Fetch courses for each enrolled class
          const coursePromises = myClasses.map(cls => classCourseService.getClassCourses(cls.id));
          const courseResponses = await Promise.all(coursePromises);

          let aggregatedCourses = [];
          courseResponses.forEach(res => {
            const cList = res.data?.data || res.data || [];
            if (Array.isArray(cList)) {
              aggregatedCourses = [...aggregatedCourses, ...cList];
            }
          });

          // 4. Deduplicate and map
          // Course structure from class-course API might be different from main course API
          // Usually returns { courseId, courseTitle, ... }
          const uniqueCourses = [];
          const seenIds = new Set();

          for (const c of aggregatedCourses) {
            // Determine ID and Title
            // The API might return course details or just assignment details
            const cId = c.courseId || c.id;
            if (!seenIds.has(cId)) {
              seenIds.add(cId);

              // Note: If the assignment object doesn't have full course details (like image), 
              // we might need to fetch course details separately. 
              // For now, let's assume basic info is there or map what we can.
              uniqueCourses.push({
                id: cId,
                title: c.courseTitle || c.title || c.courseName || "Khóa học",
                slug: c.courseSlug || c.slug,
                imageUrl: c.image || c.imageUrl, // Might be missing in assignment DTO
                durationMinutes: c.duration || 360,
                totalSessions: c.sessions || 32,
                teacherName: c.teacherName || "Giang Sensei",
                // Keep original object for other fields if needed
                ...c
              });
            }
          }

          if (mounted) setCourses(uniqueCourses);

        } else {
          // No user -> Show all courses
          const res = await courseService.getCourses();
          const data = res.data?.data?.content || res.data?.data || res.data || [];
          // Map standard course response
          const mapped = (Array.isArray(data) ? data : []).map(c => ({
            ...c,
            imageUrl: c.image || c.imageUrl // ensure consistency
          }));
          if (mounted) setCourses(mapped);
        }

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

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: 20 }}>Đang tải khóa học...</p>
    );
  if (loading) return <p>Đang tải khóa học...</p>;

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
                  src={course.imageUrl || Level}
                  alt={course.title}
                  className="course-image"
                />
              </div>
              <div className="course-content">
                <img src={Level} alt="level" className="level-badge" />
                <div className="course-info">
                  <div className="course-meta">
                    <div className="meta-item">
                      <img src={clockIcon} alt="clock" className="meta-icon" />
                      <span>{course.durationMinutes || 360} phút</span>
                    </div>
                    <div className="divider"></div>
                    <div className="meta-item">
                      <img src={bookIcon} alt="book" className="meta-icon" />
                      <span>{course.totalSessions || 32} Chương</span>
                    </div>
                    <div className="divider"></div>
                    <div className="meta-item">
                      <img
                        src={profileIcon}
                        alt="teacher"
                        className="meta-icon"
                      />
                      <span>{course.teacherName || "Giang Sensei"}</span>
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
                  <img src={arrowUpRight} alt="arrow" className="btn-icon" />
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
