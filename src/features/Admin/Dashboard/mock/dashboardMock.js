const categories = ["Frontend", "Backend", "Design"];
const instructors = ["Nguyễn Văn A", "Lê Văn C", "Trần Thị B"];
const months = ["Jan", "Feb", "Mar", "Apr"];

// 100 courses
const topCourses = Array.from({ length: 100 }, (_, i) => {
  const name = `Course ${i + 1}`;
  const category = categories[i % categories.length];
  const instructor = instructors[i % instructors.length];
  const month = months[i % months.length];
  const students = Math.floor(Math.random() * 15) + 5;
  const revenue = students * (Math.floor(Math.random() * 150000) + 80000);
  return { name, category, instructor, month, students, revenue };
});

// 100 students
const topStudents = Array.from({ length: 100 }, (_, i) => {
  const course = topCourses[i % topCourses.length].name;
  const name = `Student ${i + 1}`;
  const coursesCompleted = Math.floor(Math.random() * 3) + 1;
  const completionRate = Math.floor(Math.random() * 31) + 70; // 70-100%
  const hours = Math.floor(Math.random() * 11) + 5; // 5-15h
  const month = months[i % months.length];
  return { name, course, coursesCompleted, completionRate, hours, month };
});

// topInstructors
const topInstructors = instructors.map((i, idx) => ({
  name: i,
  courses: Math.floor(Math.random() * 10) + 1,
  students: Math.floor(Math.random() * 200) + 20,
  rating: +(Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
}));

// recentActivity 20 bản ghi
const recentActivity = Array.from({ length: 20 }, (_, i) => {
  const student = topStudents[i % topStudents.length].name;
  const course = topCourses[i % topCourses.length].name;
  return {
    id: i + 1,
    type: "student",
    content: `${student} vừa hoàn thành khóa '${course}'`,
  };
});

export const dashboardMock = {
  topCourses,
  topStudents,
  topInstructors,
  charts: {
    studentGrowth: [],
    revenue: [],
    completionRate: [],
    courseType: [],
  },
  recentActivity,
};
