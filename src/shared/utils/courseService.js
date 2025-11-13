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

const slugify = (text) => {
  if (!text) return "khoa-hoc";
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "khoa-hoc";
};

const ensureUniqueSlug = (baseSlug, courses, excludeId) => {
  const base = baseSlug || "khoa-hoc";
  let slug = base;
  let counter = 1;
  while (courses.some((c) => c.slug === slug && c.id !== excludeId)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
};

const assignSlug = (course, courses) => {
  const baseSlug = slugify(course.title || "khoa-hoc");
  const uniqueSlug = ensureUniqueSlug(baseSlug, courses, course.id);
  if (course.slug !== uniqueSlug) {
    course.slug = uniqueSlug;
  }
  return course;
};

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
    const courses = getStorage("courses");
    let updated = false;
    courses.forEach((course) => {
      if (!course.slug) {
        assignSlug(course, courses);
        updated = true;
      }
    });
    if (updated) {
      setStorage("courses", courses);
    }
    return courses;
  },

  getCourseById: (id) => {
    return courseService.getCourses().find((c) => c.id === id);
  },

  getCourseBySlug: (slug) => {
    if (!slug) return undefined;
    return courseService.getCourses().find((c) => c.slug === slug);
  },

  /**
   * ĐÃ CẬP NHẬT:
   * Thêm "progress: 0" làm giá trị mặc định cho khóa học mới
   */
  addCourse: (courseData) => {
    const courses = getStorage("courses");
    const newCourse = {
      id: `c${Date.now()}`,
      progress: 0,
      ...courseData,
    };
    courses.unshift(newCourse);
    assignSlug(newCourse, courses);
    setStorage("courses", courses);
    return newCourse;
  },

  updateCourse: (updatedCourse) => {
    const courses = getStorage("courses");
    let mergedCourse = null;
    const updatedCourses = courses.map((course) => {
      if (course.id === updatedCourse.id) {
        mergedCourse = { ...course, ...updatedCourse };
        return mergedCourse;
      }
      return course;
    });
    if (mergedCourse) {
      assignSlug(mergedCourse, updatedCourses);
      setStorage("courses", updatedCourses);
    }
    return mergedCourse;
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
