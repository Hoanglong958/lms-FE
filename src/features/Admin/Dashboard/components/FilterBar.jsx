import React from "react";
import styles from "../Dashboard.module.css";

export default function FilterBar({ filters, setFilters, data }) {
  const categories = [
    "All",
    ...new Set(data.topCourses.map((c) => c.category)),
  ];
  const instructors = [
    "All",
    ...new Set(data.topCourses.map((c) => c.instructor)),
  ];

  return (
    <div className={styles.filterBar}>
      <div>
        <label className={styles.filterLabel}>Category:</label>
        <select
          className={styles.filterSelect}
          value={filters.category}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, category: e.target.value }))
          }
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={styles.filterLabel}>Instructor:</label>
        <select
          className={styles.filterSelect}
          value={filters.instructor}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, instructor: e.target.value }))
          }
        >
          {instructors.map((ins) => (
            <option key={ins} value={ins}>
              {ins}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
