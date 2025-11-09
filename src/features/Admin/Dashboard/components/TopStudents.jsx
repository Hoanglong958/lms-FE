import React, { useState } from "react";
import styles from "../Dashboard.module.css";
import Pagination from "./Pagination";

export default function TopStudents({ students }) {
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const paginatedStudents = students.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div>
      <h3 className={styles.topListsHeader}>Top Students</h3>
      <ul className={styles.topListsUl}>
        {paginatedStudents.map((s, idx) => (
          <li key={idx} className={styles.topListsLi}>
            {s.name} - {s.course} ({s.completionRate}%)
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
