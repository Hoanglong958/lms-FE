import React, { useState } from "react";
import styles from "../Dashboard.module.css";
import Pagination from "./Pagination"; // dùng component mới

export default function RecentActivity({ activities }) {
  const ITEMS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const paginatedActivities = activities.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.recentActivity}>
      <div className={styles.recentActivityHeader}>Recent Activity</div>
      <ul className={styles.recentActivityUl}>
        {paginatedActivities.map((act) => (
          <li key={act.id} className={styles.recentActivityLi}>
            {act.content}
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
