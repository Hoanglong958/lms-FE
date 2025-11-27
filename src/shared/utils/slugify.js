// utils/slugify.js

/**
 * Chuyển text có dấu thành slug chuẩn URL (không dấu)
 */
export function slugify(text) {
  return text
    .toString()
    .normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // khoảng trắng → "-"
    .replace(/[^\w\-]+/g, "") // bỏ ký tự đặc biệt
    .replace(/\-\-+/g, "-"); // nhiều "-" → 1 "-"
}

/**
 * Chuyển slug thành tên hiển thị có dấu
 */
export function slugToReadable(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Sinh breadcrumbs từ mảng tên đầy đủ
 * - slug: dùng cho URL (không dấu)
 * - label: dùng cho hiển thị (có dấu)
 */
export function getBreadcrumbsFromTitles(titles) {
  return titles.map((title) => ({
    slug: slugify(title), // url
    label: title, // hiển thị nguyên bản, có dấu
  }));
}
