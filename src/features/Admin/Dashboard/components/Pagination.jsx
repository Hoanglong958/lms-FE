import React from "react";
import styles from "../Dashboard.module.css";

export default function Pagination({ page, totalPages, setPage }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const head = [1, 2, 3];
      const tail = [totalPages - 2, totalPages - 1, totalPages];

      if (page <= 3) {
        // trang đầu → hiển thị đầu + ellipsis + cuối
        pages.push(...head);
        pages.push("ellipsis");
        pages.push(...tail);
      } else if (page >= totalPages - 2) {
        // trang cuối → hiển thị đầu + ellipsis + cuối
        pages.push(...head);
        pages.push("ellipsis");
        pages.push(...tail);
      } else {
        // trang ở giữa → hiển thị đầu + ellipsis + trang hiện tại + ellipsis + cuối
        pages.push(...head);
        pages.push("left-ellipsis");
        pages.push(page);
        pages.push("right-ellipsis");
        pages.push(...tail);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={styles.pagination}>
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
        Prev
      </button>

      {pageNumbers.map((p, idx) =>
        typeof p === "string" ? (
          <span key={idx} className={styles.ellipsis}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={p === page ? styles.active : ""}
          >
            {p}
          </button>
        )
      )}

      <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
