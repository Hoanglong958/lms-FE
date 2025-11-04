import { mockCourses, mockSections, mockLessons } from "@data/mockData.js";

// --- Khởi tạo ---
// Tự động chép dữ liệu mock vào localStorage nếu chưa có
(function initStorage() {
  if (!localStorage.getItem("courses")) {
    localStorage.setItem("courses", JSON.stringify(mockCourses));
  }
  if (!localStorage.getItem("sections")) {
    localStorage.setItem("sections", JSON.stringify(mockSections));
  }
  if (!localStorage.getItem("lessons")) {
    localStorage.setItem("lessons", JSON.stringify(mockLessons));
  }
})();

// Hàm lấy dữ liệu (helper)
const getStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setStorage = (key, data) =>
  localStorage.setItem(key, JSON.stringify(data));

// --- API cho Bài học (Lessons) ---
// (Phải định nghĩa trước để courseService có thể gọi)
export const lessonService = {
  getSectionsByCourseId: (courseId) => {
    return getStorage("sections").filter((s) => s.courseId === courseId);
  },

  addSection: (sectionData) => {
    const sections = getStorage("sections");
    const newSection = { id: `s${Date.now()}`, ...sectionData };
    sections.push(newSection);
    setStorage("sections", sections);
    return newSection;
  },

  updateSection: (updatedSection) => {
    let sections = getStorage("sections");
    sections = sections.map((s) =>
      s.id === updatedSection.id ? updatedSection : s
    );
    setStorage("sections", sections);
  },

  deleteSection: (sectionId) => {
    let sections = getStorage("sections");
    sections = sections.filter((s) => s.id !== sectionId);
    setStorage("sections", sections);

    // Xóa lồng: Xóa tất cả bài học thuộc về phân học này
    let lessons = getStorage("lessons");
    lessons = lessons.filter((l) => l.sectionId !== sectionId);
    setStorage("lessons", lessons);
  },

  getLessonsBySectionId: (sectionId) => {
    return getStorage("lessons").filter((l) => l.sectionId === sectionId);
  },

  addLesson: (lessonData) => {
    const lessons = getStorage("lessons");
    const newLesson = { id: `l${Date.now()}`, ...lessonData };
    lessons.push(newLesson);
    setStorage("lessons", lessons);
    return newLesson;
  },

  updateLesson: (updatedLesson) => {
    let lessons = getStorage("lessons");
    lessons = lessons.map((l) =>
      l.id === updatedLesson.id ? updatedLesson : l
    );
    setStorage("lessons", lessons);
  },

  deleteLesson: (lessonId) => {
    let lessons = getStorage("lessons");
    lessons = lessons.filter((l) => l.id !== lessonId);
    setStorage("lessons", lessons);
  },
};

// --- API cho Khóa học (Courses) ---
export const courseService = {
  getCourses: () => {
    return getStorage("courses");
  },

  getCourseById: (id) => {
    return getStorage("courses").find((c) => c.id === id);
  },

  /**
   * ĐÃ CẬP NHẬT:
   * Thêm "progress: 0" làm giá trị mặc định cho khóa học mới
   */
  addCourse: (courseData) => {
    const courses = getStorage("courses");
    const newCourse = {
      id: `c${Date.now()}`,
      progress: 0, // Giá trị mặc định cho tiến độ
      ...courseData, // Bao gồm title, description, isPrerequisite từ form
    };
    const newCourses = [newCourse, ...courses];
    setStorage("courses", newCourses);
    return newCourse;
  },

  updateCourse: (updatedCourse) => {
    let courses = getStorage("courses");
    courses = courses.map((c) =>
      c.id === updatedCourse.id ? updatedCourse : c
    );
    setStorage("courses", courses);
    return updatedCourse;
  },

  deleteCourse: (courseId) => {
    let courses = getStorage("courses");
    courses = courses.filter((c) => c.id !== courseId);
    setStorage("courses", courses);

    // Xóa lồng: Xóa tất cả phân học (và bài học) thuộc khóa học này
    const sectionsToDelete = lessonService.getSectionsByCourseId(courseId);
    sectionsToDelete.forEach((section) => {
      lessonService.deleteSection(section.id);
    });
  },
};
