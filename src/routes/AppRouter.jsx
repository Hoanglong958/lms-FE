// src/routes/AppRouter.jsx (ĐÃ SỬA LỖI)

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
import DashboardUser from "@pages/DashboardUser";
import BlogList from "@features/baiviet/pages/BlogList";
import BlogDetail from "@features/baiviet/pages/BlogDetail";
import Posts from "@features/baiviet/pages/Posts";
import SearchPage from "@features/search/pages/SearchPage";
import LessonPage from "@features/lesson/pages/LessonPage";
import QuizExamPage from "@features/lesson/components/QuizExamPage";
import Login from "@features/login/pages/login";
import Register from "@features/login/pages/Register";

// ===== Pages (Admin) =====
// (Import cho Dashboard)
import DashboardPage from "@features/Admin/Dashboard/DashboardPage";
import Dashboard from "@features/Admin/Dashboard/Dashboard";
import DashboardDetails from "@features/Admin/Dashboard/dashboarddetails";

// (Import cho các trang Admin khác)
import ManageCourses from "@admin/Courses/ManageCourses";
import ManageLessons from "@admin/Courses/ManageLessons";
import AdminHomePage from "@pages/AdminHomePage";
import QuizManagement from "@features/Admin/ExamManagement/QuizManagement";
import ExamManagement from "@features/Admin/ExamManagement/ExamManagement";
import ExamDetail from "@features/Admin/ExamManagement/ExamDetail";
import ExamReport from "@features/Admin/ExamManagement/ExamReport";
import AssignmentManagement from "@features/Admin/ExamManagement/AssignmentManagement";
import ExamCreate from "@features/Admin/ExamManagement/ExamCreate";
import QuizCreate from "@features/Admin/ExamManagement/QuizCreate";
import QuestionBank from "@features/Admin/ExamManagement/QuestionBank";
import QuestionCreate from "@features/Admin/ExamManagement/QuestionCreate";
import UserManagement from "@features/Admin/UserManagement/user";
import ClassManagement from "@features/Admin/ClassManagement/class";
function App() {
  return <UserManagement />;
}

import ExamPreview from "@features/Admin/ExamManagement/ExamPreview";

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
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ===== USER ROUTES ===== */}
        <Route element={<PrivateRoute role="ROLE_USER" />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardUser />} />
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

        {/* ===== ADMIN ROUTES ===== */}
        <Route element={<PrivateRoute role="ROLE_ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Route mặc định: /admin -> /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />}>
              <Route index element={<Dashboard />} />
              <Route path="details" element={<DashboardDetails />} />
            </Route>

            <Route path="users" element={<UserManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="home" element={<AdminHomePage />} />
            <Route path="quiz" element={<QuizManagement />} />
            <Route path="quiz/create" element={<QuizCreate />} />
            <Route path="quiz/:quizId/report" element={<ExamReport />} />

            {/* ✅ Trang thi thử */}
            <Route path="exam/:examId/preview" element={<ExamPreview />} />

            <Route path="exam" element={<ExamManagement />} />
            <Route path="exam/create" element={<ExamCreate />} />

            {/* ✅ NGÂN HÀNG CÂU HỎI */}
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="question-bank/create" element={<QuestionCreate />} />

            {/* ✅ Các route chi tiết, báo cáo */}
            <Route path="exam/:examId/detail" element={<ExamDetail />} />
            <Route path="exam/:quizId/report" element={<ExamReport />} />

            {/* ✅ Trang bài tập */}
            <Route path="exercises" element={<AssignmentManagement />} />

            {/* ✅ Quản lý khóa học */}
            <Route path="courses" element={<ManageCourses />} />
          </Route>

          {/* ✅ Trang quản lý bài học chi tiết (ẩn sidebar mặc định) */}
          <Route
            path="/admin/courses/:courseSlug"
            element={<ManageLessons />}
          />
        </Route>

        {/* ===== Fallback ===== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
