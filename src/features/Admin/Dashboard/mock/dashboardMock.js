/**
 * Hàng 1: 4 thẻ thống kê chính
 */
export const overviewStatCardsRow1 = [
  {
    title: "Tổng số học viên",
    value: "2,847",
    change: "+12% (+342 so với tháng trước)",
  },
  {
    title: "Khóa học",
    value: "42",
    change: "+3",
    description: "3 khóa học mới",
  },
  {
    title: "Bài thi hoàn thành",
    value: "5,678",
    change: "+23% (+1,045 lượt thi)",
  },
];

/**
 * Hàng 2: 4 thẻ thống kê phụ
 */
export const overviewStatCardsRow2 = [
  {
    title: "Điểm trung bình",
    value: "8.5/10",
    change: "+0.3",
  },
  {
    title: "Tỷ lệ hoàn thành khóa học",
    value: "87%",
    change: "+5%",
  },

  {
    title: "Tổng số lớp học",
    value: "21",
    change: "+2",
  },
];

/**
 * Tab "Báo cáo chi tiết"
 */
export const detailedReports = [
  {
    id: "users",
    title: "Báo cáo người dùng",
    description: "Danh sách user, role, thời gian đăng ký",
  },
  {
    id: "courses",
    title: "Báo cáo khóa học",
    description: "Số lượng khóa, học viên, % hoàn thành",
  },
  {
    id: "progress",
    title: "Báo cáo tiến độ học viên",
    description: "Điểm, tiến độ từng user theo khóa",
  },
  {
    id: "quizzes",
    title: "Báo cáo bài thi/quiz",
    description: "Kết quả chi tiết, điểm TB, tỉ lệ pass/fail",
  },
  {
    id: "revenue",
    title: "Báo cáo doanh thu",
    description: "Doanh thu, đơn đăng ký, top khóa học",
  },
];

// --- Dữ liệu cho các biểu đồ và bảng ---

/**
 * Biểu đồ Line: Tăng trưởng người dùng
 */
export const userGrowthData = [
  { month: "T1", "Người dùng": 1300 },
  { month: "T2", "Người dùng": 1500 },
  { month: "T3", "Người dùng": 1750 },
  { month: "T4", "Người dùng": 2000 },
  { month: "T5", "Người dùng": 2250 },
  { month: "T6", "Người dùng": 2950 },
];

/**
 * Biểu đồ Bar: Tiến độ khóa học
 */
export const courseProgressData = [
  { name: "Node.js", "Hoàn thành": 240, "Đang học": 150 },
  { name: "Backend", "Hoàn thành": 185, "Đang học": 90 },
  { name: "UI/UX", "Hoàn thành": 160, "Đang học": 130 },
  { name: "Design", "Hoàn thành": 140, "Đang học": 80 },
];

/**
 * Biểu đồ Donut: Phân bổ vai trò
 */
export const userRolesData = [
  { name: "Học viên", value: 2156 },
  { name: "Giảng viên", value: 89 },
  { name: "Admin", value: 12 },
];

/**
 * Biểu đồ Area: Doanh thu
 */
export const revenueData = [
  { month: "T1", "Doanh thu (triệu)": 42 },
  { month: "T2", "Doanh thu (triệu)": 50 },
  { month: "T3", "Doanh thu (triệu)": 45 },
  { month: "T4", "Doanh thu (triệu)": 60 },
  { month: "T5", "Doanh thu (triệu)": 70 },
  { month: "T6", "Doanh thu (triệu)": 78 },
];

/**
 * Bảng: Người dùng mới
 */
export const newUsersData = [
  {
    id: "U001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    role: "Học viên",
    date: "8/11/2025",
  },
  {
    id: "U002",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    role: "Học viên",
    date: "8/11/2025",
  },
  {
    id: "U003",
    name: "Lê Văn C",
    email: "levanc@email.com",
    role: "Giảng viên",
    date: "7/11/2025",
  },
  {
    id: "U004",
    name: "Phạm Thị D",
    email: "phamthid@email.com",
    role: "Học viên",
    date: "7/11/2025",
  },
  {
    id: "U005",
    name: "Võ Minh E",
    email: "vominhe@email.com",
    role: "Học viên",
    date: "6/11/2025",
  },
  {
    id: "U006",
    name: "Hoàng Thị F",
    email: "hoangthif@email.com",
    role: "Học viên",
    date: "6/11/2025",
  },
  {
    id: "U007",
    name: "Đinh Văn G",
    email: "dinhvang@email.com",
    role: "Giảng viên",
    date: "6/11/2025",
  },
  {
    id: "U008",
    name: "Phan Thị H",
    email: "phanthih@email.com",
    role: "Học viên",
    date: "5/11/2025",
  },
  {
    id: "U009",
    name: "Ngô Văn I",
    email: "ngovani@email.com",
    role: "Học viên",
    date: "5/11/2025",
  },
  {
    id: "U010",
    name: "Đặng Thị K",
    email: "dangthik@email.com",
    role: "Học viên",
    date: "5/11/2025",
  },
  {
    id: "U011",
    name: "Bùi Văn L",
    email: "buivanl@email.com",
    role: "Giảng viên",
    date: "4/11/2025",
  },
  {
    id: "U012",
    name: "Trịnh Thị M",
    email: "trinhthim@email.com",
    role: "Học viên",
    date: "4/11/2025",
  },
  {
    id: "U013",
    name: "Đoàn Văn N",
    email: "doann@email.com",
    role: "Học viên",
    date: "3/11/2025",
  },
  {
    id: "U014",
    name: "Lý Thị O",
    email: "lythio@email.com",
    role: "Giảng viên",
    date: "3/11/2025",
  },
  {
    id: "U015",
    name: "Nguyễn Văn P",
    email: "nguyenvanp@email.com",
    role: "Học viên",
    date: "3/11/2025",
  },
  {
    id: "U016",
    name: "Trần Thị Q",
    email: "tranthiq@email.com",
    role: "Học viên",
    date: "2/11/2025",
  },
  {
    id: "U017",
    name: "Phạm Văn R",
    email: "phamvanr@email.com",
    role: "Giảng viên",
    date: "2/11/2025",
  },
  {
    id: "U018",
    name: "Vũ Thị S",
    email: "vuthis@email.com",
    role: "Học viên",
    date: "1/11/2025",
  },
  {
    id: "U019",
    name: "Lâm Văn T",
    email: "lamvant@email.com",
    role: "Học viên",
    date: "1/11/2025",
  },
  {
    id: "U020",
    name: "Trương Thị U",
    email: "truongthiu@email.com",
    role: "Giảng viên",
    date: "1/11/2025",
  },
];

/**
 * Bảng: Khóa học mới tạo
 */
export const newCoursesData = [
  {
    id: "C001",
    title: "React Nâng cao 2025",
    category: "Lập trình",
    instructor: "Lê Văn C",
    status: "Công khai",
  },
  {
    id: "C002",
    title: "Node.js Microservices",
    category: "Backend",
    instructor: "Hoàng Văn E",
    status: "Công khai",
  },
  {
    id: "C003",
    title: "AI with TensorFlow",
    category: "AI/ML",
    instructor: "Lê Văn C",
    status: "Nháp",
  },
];

/**
 * Bảng: Bài thi / Quiz gần đây
 */
export const recentQuizzesData = [
  {
    name: "Thi cuối kỳ React",
    course: "React Nâng cao",
    participants: 234,
    passRate: 87,
  },
  {
    name: "Quiz Node.js cơ bản",
    course: "Node.js Backend",
    participants: 189,
    passRate: 92,
  },
  {
    name: "Đánh giá Python",
    course: "Python cho AI",
    participants: 167,
    passRate: 78,
  },
];

/**
 * Danh sách: Top học viên
 */
export const topStudentsData = [
  { id: 1, name: "Nguyễn Văn A", courses: 12, score: 98.5 },
  { id: 2, name: "Trần Thị B", courses: 10, score: 96.8 },
  { id: 3, name: "Lê Văn C", courses: 11, score: 95.2 },
  { id: 4, name: "Phạm Thị D", courses: 9, score: 94.7 },
  { id: 5, name: "Hoàng Văn E", courses: 8, score: 93.5 },
];
