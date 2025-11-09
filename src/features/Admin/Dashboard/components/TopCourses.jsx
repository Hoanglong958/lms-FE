import React, { useState } from "react";
import styles from "../Dashboard.module.css";
import Pagination from "./Pagination";

export default function TopCourses({ courses }) {
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  const paginatedCourses = courses.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div>
      <h3 className={styles.topListsHeader}>Top Courses</h3>
      <ul className={styles.topListsUl}>
        {paginatedCourses.map((c, idx) => (
          <li key={idx} className={styles.topListsLi}>
            {c.name} - {c.students} students
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
