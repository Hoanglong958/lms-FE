import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "@components/common/ScrollToTop";
import PrivateRoute from "@components/common/PrivateRoute";

// ===== Layouts =====
import MainLayout from "@layouts/MainLayout";
import LessonLayout from "@layouts/LessonLayout";
import AuthLayout from "@layouts/AuthLayout";
import AdminLayout from "@layouts/AdminLayout";

// ===== Pages (User) =====
import HomePage from "@pages/HomePage";
import BlogList from "@features/baiviet/pages/BlogList";
import BlogDetail from "@features/baiviet/pages/BlogDetail";
import Posts from "@features/baiviet/pages/Posts";
import SearchPage from "@features/search/pages/SearchPage";
import LessonPage from "@features/lesson/pages/LessonPage";
import QuizExamPage from "@features/lesson/components/QuizExamPage";
import Login from "@features/login/pages/login";

// ===== Pages (Admin) =====
import Dashboard from "@features/Admin/Dashboard/Dashboard";
// import AdminHomePage from "@pages/AdminHomePage"; // Route này không có trong sidebar mới
// import Users from "@features/Admin/Users/AdminUsers"; // Bạn đã bình luận dòng này

// === CÁC IMPORT MỚI CHO TRANG ADMIN ===
// (Bạn cần tạo các component này và đảm bảo đường dẫn import chính xác)
// import ManageUsers from "@admin/Users/ManageUsers";
import ManageCourses from "@admin/Courses/ManageCourses";
import ManageLessons from "@admin/Courses/ManageLessons";
// import QuestionBank from "@admin/QuestionBank/QuestionBank";
// import ManageQuizzes from "@admin/Quizzes/ManageQuizzes";
// import ManageExams from "@admin/Exams/ManageExams";
// import ManageAssignments from "@admin/Assignments/ManageAssignments";
// import StudentProgress from "@admin/Progress/StudentProgress";
// import Reports from "@admin/Reports/Reports";
// import SystemSettings from "@admin/Settings/SystemSettings";
// ======================================
import AdminHomePage from "@pages/AdminHomePage";
import QuizManagement from "@features/Admin/Dashboard/ExamManagement/QuizManagement";
import ExamManagement from "@features/Admin/Dashboard/ExamManagement/ExamManagement";
import ExamDetail from "@features/Admin/Dashboard/ExamManagement/ExamDetail";
import ExamReport from "@features/Admin/Dashboard/ExamManagement/ExamReport";
import AssignmentManagement from "@features/Admin/Dashboard/ExamManagement/AssignmentManagement"; // ✅ thêm dòng này

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ===== CHUYỂN TRANG MẶC ĐỊNH ===== */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ===== AUTH ROUTES ===== */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ===== USER ROUTES ===== */}
        <Route element={<PrivateRoute role="user" />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/bai-viet" element={<BlogList />} />
            <Route path="/bai-viet/:id" element={<BlogDetail />} />
            <Route path="/baiviet" element={<Posts />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>

          <Route path="/lessons/:courseId" element={<LessonLayout />}>
            <Route index element={<LessonPage />} />
            <Route path=":lessonId" element={<LessonPage />} />
          </Route>

          <Route path="/quiz-exam/:quizId" element={<QuizExamPage />} />
        </Route>

        {/* ===== ADMIN ROUTES (ĐÃ CẬP NHẬT) ===== */}
        <Route element={<PrivateRoute role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Routes mặc định */}
            <Route index element={<Dashboard />} />
            {/* Mặc định chuyển về dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            {/* Các trang con của admin */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="home" element={<AdminHomePage />} />
            <Route path="quiz" element={<QuizManagement />} />
            <Route path="exam" element={<ExamManagement />} />
            <Route path="exam/:quizId/report" element={<ExamReport />} />{" "}
            {/* ✅ Thêm route báo cáo */}
            {/* Các routes từ sidebar */}
            {/* <Route path="users" element={<ManageUsers />} /> */}
            <Route path="courses" element={<ManageCourses />} />
            <Route path="courses/part/:courseId" element={<ManageLessons />} />
            {/* <Route path="question-bank" element={<QuestionBank />} /> */}
            {/* <Route path="quizzes" element={<ManageQuizzes />} /> */}
            {/* <Route path="exams" element={<ManageExams />} /> */}
            {/* <Route path="assignments" element={<ManageAssignments />} /> */}
            {/* <Route path="progress" element={<StudentProgress />} /> */}
            {/* <Route path="reports" element={<Reports />} /> */}
            {/* <Route path="settings" element={<SystemSettings />} /> */}
            <Route path="exercises" element={<AssignmentManagement />} /> {/* ✅ thêm dòng này */}

            {/* ✅ Trang chi tiết bài kiểm tra */}
            <Route path="exam/:examId/detail" element={<ExamDetail />} />

            {/* ✅ Báo cáo */}
            <Route path="exam/:quizId/report" element={<ExamReport />} />
            <Route path="quiz/:quizId/report" element={<ExamReport />} />
          </Route>
        </Route>

        {/* ===== Fallback ===== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
