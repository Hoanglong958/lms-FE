import React from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { slugToReadable } from "@utils/slugify";
import "./Breadcrumb.css";

export default function Breadcrumb({ customItems }) {
  const location = useLocation();
  const params = useParams();

  // Nếu có customItems (từ API), hiển thị luôn
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
                <Link
                  to={item.to || item.path || `/${item.slug}`}
                  className="breadcrumb-item breadcrumb-link"
                >
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

  // Nếu không có customItems, fallback từ path
  const pathSegments = location.pathname.split("/").filter(Boolean);
  let currentPath = "";
  const breadcrumbItems = pathSegments.map((segment, idx) => {
    currentPath += `/${segment}`;
    const isLast = idx === pathSegments.length - 1;

    return {
      path: currentPath,
      label: slugToReadable(segment), // convert slug -> label có dấu
      isLast,
    };
  });

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
