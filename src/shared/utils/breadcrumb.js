// utils/breadcrumb.js

// mapping slug → tên hiển thị có dấu
const slugMap = {
  admin: "Admin",
  "quan-ly-khoa-hoc": "Quản lý khóa học",
  "spring-boot-fundamentals123": "Spring Boot Fundamentals",
};

/**
 * Chuyển mảng slug thành breadcrumb có dấu
 * @param {string[]} slugs - mảng slug theo cấp độ route
 * @returns {string[]} - mảng breadcrumb có dấu
 */
export function getBreadcrumbs(slugs) {
  return slugs.map((slug) => slugMap[slug] || slugToReadable(slug));
}

/**
 * fallback nếu slug chưa có mapping: replace '-' bằng khoảng trắng và capitalize
 */
function slugToReadable(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// VD sử dụng:
const slugs = ["admin", "quan-ly-khoa-hoc", "spring-boot-fundamentals123"];
const breadcrumbs = getBreadcrumbs(slugs);
console.log(breadcrumbs);
// Output: ["Admin", "Quản lý khóa học", "Spring Boot Fundamentals"]
