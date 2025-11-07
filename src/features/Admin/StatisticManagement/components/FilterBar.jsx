import React from "react";
import styles from "./FilterBar.module.css";

export default function FilterBar({ filter, onFilterChange }) {
  const handlePeriodChange = (e) => {
    onFilterChange({ ...filter, period: e.target.value });
  };

  const handleTypeChange = (e) => {
    onFilterChange({ ...filter, type: e.target.value });
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>
        <label>Khoảng thời gian:</label>
        <select value={filter.period} onChange={handlePeriodChange}>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
          <option value="year">Năm nay</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Loại thống kê:</label>
        <select value={filter.type} onChange={handleTypeChange}>
          <option value="all">Tất cả</option>
          <option value="quiz">Quiz</option>
          <option value="video">Video</option>
          <option value="document">Tài liệu</option>
        </select>
      </div>
    </div>
  );
}
