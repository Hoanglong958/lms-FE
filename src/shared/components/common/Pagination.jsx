import React from "react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 6) {
      // Dưới 6 trang: hiển thị tất cả
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Trên 6 trang: logic phức tạp
    const pages = [];
    
    if (currentPage <= 3) {
      // Đang ở 3 trang đầu: hiển thị 3 đầu + ... + 3 cuối
      pages.push(1, 2, 3);
      pages.push("...");
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Đang ở 3 trang cuối: hiển thị 3 đầu + ... + 3 cuối
      pages.push(1, 2, 3);
      pages.push("...");
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Đang ở giữa: hiển thị 3 đầu + trang hiện tại + ... + 3 cuối
      // Ví dụ: 1 2 3 6 ... 9 10 11 (nếu currentPage = 6)
      pages.push(1, 2, 3);
      
      // Thêm ... trước trang hiện tại nếu cần
      if (currentPage > 4) {
        pages.push("...");
      }
      
      // Thêm trang hiện tại
      pages.push(currentPage);
      
      // Thêm ... sau trang hiện tại nếu cần
      if (currentPage < totalPages - 3) {
        pages.push("...");
      }
      
      // Luôn hiển thị 3 trang cuối
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    }

    // Loại bỏ duplicate và sắp xếp
    const uniquePages = [];
    const seen = new Set();
    for (const page of pages) {
      if (page === "...") {
        uniquePages.push(page);
      } else if (!seen.has(page)) {
        seen.add(page);
        uniquePages.push(page);
      }
    }

    return uniquePages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Trang trước"
      >
        ‹
      </button>

      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            className={`pagination-btn ${
              currentPage === page ? "pagination-btn-active" : ""
            }`}
            onClick={() => onPageChange(page)}
            aria-label={`Trang ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;

