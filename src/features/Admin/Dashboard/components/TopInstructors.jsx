import React, { useState } from "react";
import styles from "../Dashboard.module.css";
import Pagination from "./Pagination";

export default function TopInstructors({ instructors }) {
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(instructors.length / ITEMS_PER_PAGE);
  const paginatedInstructors = instructors.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div>
      <h3 className={styles.topListsHeader}>Top Instructors</h3>
      <ul className={styles.topListsUl}>
        {paginatedInstructors.map((i, idx) => (
          <li key={idx} className={styles.topListsLi}>
            {i.name} - {i.courses} courses
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
