// @/data/mockdata.js

export const mockCourses = [
  {
    id: "c1",
    title: "Khóa học ReactJS từ A-Z",
    description: "Học ReactJS và các khái niệm cốt lõi như Hooks, Redux.",
  },
  {
    id: "c2",
    title: "Chuyên sâu NodeJS & Express",
    description: "Xây dựng backend API mạnh mẽ với NodeJS, Express và MongoDB.",
  },
  {
    id: "c3",
    title: "Làm chủ Javascript ES6+",
    description: "Nắm vững các tính năng hiện đại của Javascript.",
  },
];

// MỚI: Dữ liệu cho Phân học (Sections)
export const mockSections = [
  // Khóa ReactJS (c1)
  { id: "s1", courseId: "c1", title: "Chương 1: Bắt đầu" },
  { id: "s2", courseId: "c1", title: "Chương 2: Khái niệm cốt lõi" },

  // Khóa NodeJS (c2)
  { id: "s3", courseId: "c2", title: "Phần 1: Cài đặt" },
];

// CẬP NHẬT: Bài học (Lessons) giờ sẽ thuộc về Phân học
export const mockLessons = [
  // Bài học cho Phân học s1 (React)
  { id: "l1", sectionId: "s1", title: "Giới thiệu ReactJS" },
  { id: "l2", sectionId: "s1", title: "Cài đặt môi trường" },

  // Bài học cho Phân học s2 (React)
  { id: "l3", sectionId: "s2", title: "Components và Props" },
  { id: "l4", sectionId: "s2", title: "State và Lifecycle" },

  // Bài học cho Phân học s3 (NodeJS)
  { id: "l5", sectionId: "s3", title: "Cài đặt NodeJS" },
  { id: "l6", sectionId: "s3", title: "Chạy server đầu tiên" },
];
