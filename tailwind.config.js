/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind sẽ scan tất cả các file trong src (js, ts, jsx, tsx) + index.html
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // Bạn có thể extend theme ở đây
  theme: {
    extend: {
      colors: {
        primary: "#1e40af", // ví dụ thêm màu chủ đạo
        secondary: "#f59e0b",
      },
    },
  },

  // Plugins (nếu muốn dùng forms, typography, line-clamp,…)
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
