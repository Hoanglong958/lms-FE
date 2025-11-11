// Đường dẫn: features/Admin/Dashboard/components/StatCard.jsx
// (ĐÃ CHUYỂN ĐỔI)

import React from "react";
// Import file CSS của bạn
import "../Dashboard.css";

const StatCard = ({ title, value, change, description }) => {
  const isPositive = change && change.startsWith("+"); // Cập nhật logic: gán class CSS thay vì class Tailwind
  const changeColorClass = isPositive
    ? "stat-card-change-positive"
    : "stat-card-change-negative";

  return (
    // Chỉ cần class .dashboard-card vì nó đã bao gồm padding, bg, v.v.
    <div className="dashboard-card">
      {" "}
      <div>
        <p className="stat-card-title">{title}</p>{" "}
        <p className="stat-card-value">{value}</p>{" "}
        {change && (
          <p className={`stat-card-change ${changeColorClass}`}>{change}</p>
        )}{" "}
        {description && <p className="stat-card-description">{description}</p>}{" "}
      </div>{" "}
    </div>
  );
};

export default StatCard;
