import React from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { courseService } from "@utils/courseService";
import "./Breadcrumb.css";

// Mapping từ route path đến tên hiển thị
const routeLabels = {
  admin: "Admin",
  dashboard: "Dashboard",
  "dashboard/details": "Báo Cáo Chi Tiết",
  courses: "Quản lý khóa học",
  "courses/part": "Quản lý nội dung",
  quiz: "Quản lý Quiz",
  "quiz/create": "Tạo Quiz",
  "quiz/report": "Báo cáo",
  exam: "Quản lý Thi thử",
  "exam/create": "Tạo Thi thử",
  "exam/detail": "Chi tiết",
  "exam/preview": "Xem trước",
  "question-bank": "Ngân hàng câu hỏi",
  "question-bank/create": "Tạo câu hỏi",
  exercises: "Quản lý Bài tập",
  home: "Trang chủ",
};

/**
 * Component Breadcrumb động dựa trên route
 * Tự động tạo breadcrumb từ URL path và có thể click để điều hướng
 */
export default function Breadcrumb({ customItems }) {
  const location = useLocation();
  const params = useParams();

  // Nếu có customItems, sử dụng nó
  if (customItems && Array.isArray(customItems)) {
    return (
      <nav className="breadcrumb" aria-label="breadcrumb">
        {customItems.map((item, index) => {
          const isLast = index === customItems.length - 1;
          return (
            <React.Fragment key={index}>
              {isLast ? (
                <span className="breadcrumb-item breadcrumb-active">
                  {item.label}
                </span>
              ) : (
                <Link to={item.path} className="breadcrumb-item breadcrumb-link">
                  {item.label}
                </Link>
              )}
              {!isLast && <span className="breadcrumb-separator">/</span>}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }

  // Parse pathname thành các segments
  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment !== "");

  const breadcrumbItems = [];
  let currentPath = "";

  const humanizeSlug = (slug) =>
    decodeURIComponent(slug || "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) || slug;

  let index = 0;
  while (index < pathSegments.length) {
    const segment = pathSegments[index];
    const nextSegment = pathSegments[index + 1];

    if (segment === "courses" && nextSegment === "part" && params.courseSlug) {
      currentPath += `/${segment}`;
      breadcrumbItems.push({
        path: currentPath,
        label: routeLabels["courses"] || "Quản lý khóa học",
        isLast: false,
      });

      const coursePath = `${currentPath}/part/${params.courseSlug}`;
      const course = courseService.getCourseBySlug(params.courseSlug);
      const isLast = index + 2 === pathSegments.length - 1;

      breadcrumbItems.push({
        path: coursePath,
        label: course ? course.title : humanizeSlug(params.courseSlug),
        isLast,
      });

      currentPath = coursePath;
      index += 3; // skip "courses", "part", and slug segments
      continue;
    }

    currentPath += `/${segment}`;

    let label = routeLabels[segment] || segment;

    if (params.quizId && segment === "report") {
      label = routeLabels["quiz/report"] || "Báo cáo";
    } else if (params.examId) {
      if (segment === "detail") {
        label = routeLabels["exam/detail"] || "Chi tiết";
      } else if (segment === "preview") {
        label = routeLabels["exam/preview"] || "Xem trước";
      }
    }

    if (index > 0) {
      const parentSegment = pathSegments[index - 1];
      const combinedKey = `${parentSegment}/${segment}`;
      if (routeLabels[combinedKey]) {
        label = routeLabels[combinedKey];
      }
    }

    breadcrumbItems.push({
      path: currentPath,
      label,
      isLast: index === pathSegments.length - 1,
    });

    index += 1;
  }

  // Nếu không có items, trả về null
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {item.isLast ? (
            <span className="breadcrumb-item breadcrumb-active">
              {item.label}
            </span>
          ) : (
            <Link to={item.path} className="breadcrumb-item breadcrumb-link">
              {item.label}
            </Link>
          )}
          {!item.isLast && <span className="breadcrumb-separator">/</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

