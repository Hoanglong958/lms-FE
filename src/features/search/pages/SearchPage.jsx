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
import AdminHomePage from "@pages/AdminHomePage";
import QuizManagement from "@features/Admin/Dashboard/ExamManagement/QuizManagement";
import ExamManagement from "@features/Admin/Dashboard/ExamManagement/ExamManagement";
import ExamDetail from "@features/Admin/Dashboard/ExamManagement/ExamDetail";
import ExamReport from "@features/Admin/Dashboard/ExamManagement/ExamReport";
import AssignmentManagement from "@features/Admin/Dashboard/ExamManagement/AssignmentManagement";
import ManageCourses from "@admin/Courses/ManageCourses";
import ManageLessons from "@admin/Courses/ManageLessons";

// ✅ Import mới cho trang tạo bài kiểm tra
import ExamCreate from "@features/Admin/Dashboard/ExamManagement/ExamCreate";

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

        {/* ===== ADMIN ROUTES ===== */}
        <Route element={<PrivateRoute role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Trang chính */}
            <Route index element={<Dashboard />} />
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="home" element={<AdminHomePage />} />
            <Route path="quiz" element={<QuizManagement />} />

            {/* ===== Phần bài kiểm tra ===== */}
            <Route path="exam" element={<ExamManagement />} />
            <Route path="exam/create" element={<ExamCreate />} /> {/* ✅ Trang tạo bài kiểm tra */}
            <Route path="exam/:examId/detail" element={<ExamDetail />} /> {/* ✅ Chi tiết */}
            <Route path="exam/:quizId/report" element={<ExamReport />} /> {/* ✅ Báo cáo */}

            {/* ===== Khóa học & bài học ===== */}
            <Route path="courses" element={<ManageCourses />} />
            <Route path="courses/part/:courseId" element={<ManageLessons />} />

            {/* ===== Bài tập ===== */}
            <Route path="exercises" element={<AssignmentManagement />} />

            {/* Route trùng quiz/report vẫn giữ */}
            <Route path="quiz/:quizId/report" element={<ExamReport />} />
          </Route>
        </Route>

        {/* ===== Fallback ===== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
