// Đường dẫn: features/Admin/Dashboard/components/StatCard.jsx

import React from "react";
import "../Dashboard.css";

const StatCard = ({ title, value, change, description }) => {
  // Convert change thành string để tránh lỗi startsWith
  const changeStr = change !== undefined && change !== null ? String(change) : "";

  const isPositive = changeStr.startsWith("+");

  const changeColorClass = isPositive
    ? "stat-card-change-positive"
    : "stat-card-change-negative";

  return (
    <div className="dashboard-card">
      <div>
        <p className="stat-card-title">{title}</p>
        <p className="stat-card-value">{value}</p>

        {change && (
          <p className={`stat-card-change ${changeColorClass}`}>
            {changeStr}
          </p>
        )}

        {description && (
          <p className="stat-card-description">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
