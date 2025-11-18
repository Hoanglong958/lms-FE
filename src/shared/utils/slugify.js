// utils/slugify.js
export function slugify(text) {
  return text
    .toString()
    .toLowerCase() // chữ thường
    .trim() // bỏ khoảng trắng đầu cuối
    .replace(/\s+/g, "-") // thay khoảng trắng bằng dấu -
    .replace(/[^\w\-]+/g, "") // bỏ ký tự đặc biệt
    .replace(/\-\-+/g, "-"); // thay nhiều dấu - liên tiếp bằng 1 dấu -
}
