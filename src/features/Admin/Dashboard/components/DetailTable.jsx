// DetailTable.jsx
import React, { useState, useMemo } from "react";
import styles from "../Dashboard.module.css";
import Pagination from "./Pagination"; // import component pagination

export default function DetailTable({ data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    const students = [...data.topStudents];
    if (!sortConfig.key) return students;

    return students.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // xử lý kiểu "Student 1", "Course 10"
      if (typeof aVal === "string" && /\d+$/.test(aVal)) {
        const aNum = parseInt(aVal.match(/\d+$/)[0], 10);
        const bNum = parseInt(bVal.match(/\d+$/)[0], 10);
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }
    });
  }, [data.topStudents, sortConfig]);

  // pagination
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const displayedStudents = sortedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.detailTable}>
      <table className={styles.detailTableTable}>
        <thead>
          <tr>
            <th
              className={styles.detailTableTh}
              onClick={() => requestSort("name")}
            >
              Student{" "}
              {sortConfig.key === "name"
                ? sortConfig.direction === "asc"
                  ? "↑"
                  : "↓"
                : "⇅"}
            </th>
            <th
              className={styles.detailTableTh}
              onClick={() => requestSort("course")}
            >
              Course{" "}
              {sortConfig.key === "course"
                ? sortConfig.direction === "asc"
                  ? "↑"
                  : "↓"
                : "⇅"}
            </th>
            <th
              className={styles.detailTableTh}
              onClick={() => requestSort("hours")}
            >
              Hours{" "}
              {sortConfig.key === "hours"
                ? sortConfig.direction === "asc"
                  ? "↑"
                  : "↓"
                : "⇅"}
            </th>
            <th
              className={styles.detailTableTh}
              onClick={() => requestSort("completionRate")}
            >
              Completion %{" "}
              {sortConfig.key === "completionRate"
                ? sortConfig.direction === "asc"
                  ? "↑"
                  : "↓"
                : "⇅"}
            </th>
          </tr>
        </thead>
        <tbody>
          {displayedStudents.map((s, idx) => (
            <tr key={idx}>
              <td className={styles.detailTableTd}>{s.name}</td>
              <td className={styles.detailTableTd}>{s.course}</td>
              <td className={styles.detailTableTd}>{s.hours}</td>
              <td className={styles.detailTableTd}>{s.completionRate}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination component */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        setPage={setCurrentPage}
      />
    </div>
  );
}
