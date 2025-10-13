import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courses } from "@data/courseData";
import LessonContentDisplay from "@features/lesson/components/LessonContentDisplay";
import "./lesson.css";

const Breadcrumbs = ({ courseTitle }) => (
  <nav className="breadcrumbs" aria-label="breadcrumb">
    <a href="/">Trang chủ</a>

    <span className="breadcrumb-divider">/</span>

    <span className="breadcrumb-active">{courseTitle}</span>
  </nav>
);

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const currentCourse = courses[courseId];

  const allItems = useMemo(() => {
    if (!currentCourse) return [];
    return currentCourse.sessions.flatMap((session) =>
      session.lessons.flatMap((lesson) => lesson.items)
    );
  }, [currentCourse]);

  useEffect(() => {
    if (!lessonId && currentCourse && allItems.length > 0) {
      const firstItemId = allItems[0].id;
      navigate(`/lessons/${courseId}/${firstItemId}`, { replace: true });
    }
  }, [courseId, lessonId, navigate, currentCourse, allItems]);

  const currentItemIndex = allItems.findIndex((item) => item.id === lessonId);
  const currentItem = allItems[currentItemIndex];

  const handleNavigation = (direction) => {
    const newIndex = currentItemIndex + direction;
    if (newIndex >= 0 && newIndex < allItems.length) {
      const nextItemId = allItems[newIndex].id;
      navigate(`/lessons/${courseId}/${nextItemId}`);
    }
  };

  if (!currentItem) {
    return <div>Đang tải bài học...</div>;
  }

  return (
    <div className="lesson-detail-container">
      <div className="lesson-page-header">
        <Breadcrumbs courseTitle={currentCourse.courseTitle} />

        <div className="lesson-navigation">
          <button
            className="nav-button prev"
            onClick={() => handleNavigation(-1)}
            disabled={currentItemIndex === 0}
          >
            <svg
              className="nav-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.8332 10H4.1665M4.1665 10L9.99984 15.8333M4.1665 10L9.99984 4.16666"
                stroke="currentColor"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Bài trước</span>
          </button>

          <button
            className="nav-button next"
            onClick={() => handleNavigation(1)}
            disabled={currentItemIndex === allItems.length - 1}
          >
            <span>Bài tiếp theo</span>
            <svg
              className="nav-icon"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.1665 10H15.8332M15.8332 10L9.99984 4.16666M15.8332 10L9.99984 15.8333"
                stroke="currentColor"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <LessonContentDisplay item={currentItem} />

      <div className="lesson-header">
        <div className="lesson-title-group">
          <h2>{currentItem.title}</h2>
          <span>24 tháng 6 năm 2023</span>
        </div>
        <div className="lesson-progress">
          {currentItemIndex + 1}/{allItems.length} Bài học
        </div>
      </div>

      <div className="lesson-description">
        <h3>Mô tả</h3>
        <p>{currentItem.Descriptions || "Nội dung đang được cập nhật..."}</p>
        <a href="#">Xem thêm</a>
      </div>
    </div>
  );
};

export default LessonPage;
