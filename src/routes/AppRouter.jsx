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
// Dashboard
import DashboardPage from "@features/Admin/Dashboard/DashboardPage";
import Dashboard from "@features/Admin/Dashboard/Dashboard";
import DashboardDetails from "@features/Admin/Dashboard/dashboarddetails";

// Quản lý khóa học
import ManageCourses from "@admin/Courses/ManageCourses";
import ManageLessons from "@admin/Courses/ManageLessons";
import AdminHomePage from "@pages/AdminHomePage";

// Quản lý Quiz/Exam
import QuizManagement from "@features/Admin/ExamManagement/QuizManagement";
import QuizCreate from "@features/Admin/ExamManagement/QuizCreate";
import QuizUpdate from "@features/Admin/ExamManagement/QuizUpdate";
import ExamManagement from "@features/Admin/ExamManagement/ExamManagement";
import ExamCreate from "@features/Admin/ExamManagement/ExamCreate";
import ExamDetail from "@features/Admin/ExamManagement/ExamDetail";
import ExamReport from "@features/Admin/ExamManagement/ExamReport";
import ExamPreview from "@features/Admin/ExamManagement/ExamPreview";
import AssignmentManagement from "@features/Admin/ExamManagement/AssignmentManagement";

// Ngân hàng câu hỏi
import QuestionBank from "@features/Admin/ExamManagement/QuestionBank";
import QuestionCreate from "@features/Admin/ExamManagement/QuestionCreate";
import QuestionBankCreate from "@features/Admin/ExamManagement/QuestionBankCreate";

// Quản lý người dùng và lớp
import UserManagement from "@features/Admin/UserManagement/user";
import ClassManagement from "@features/Admin/ClassManagement/class";

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ===== MẶC ĐỊNH ===== */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ===== AUTH ===== */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ===== USER ===== */}
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

        {/* ===== ADMIN ===== */}
        <Route element={<PrivateRoute role="ROLE_ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Default /admin -> dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<DashboardPage />}>
              <Route index element={<Dashboard />} />
              <Route path="details" element={<DashboardDetails />} />
            </Route>

            {/* Quản lý người dùng & lớp */}
            <Route path="users" element={<UserManagement />} />
            <Route path="classes" element={<ClassManagement />} />

            {/* Admin Home */}
            <Route path="home" element={<AdminHomePage />} />

            {/* Quản lý Quiz */}
            <Route path="quiz" element={<QuizManagement />} />
            <Route path="quiz/create" element={<QuizCreate />} />
            <Route path="quiz/:quizId/update" element={<QuizUpdate />} />
            <Route path="quiz/:quizId/report" element={<ExamReport />} />

            {/* Quản lý Exam */}
            <Route path="exam" element={<ExamManagement />} />
            <Route path="exam/create" element={<ExamCreate />} />
            <Route path="exam/:examId/detail" element={<ExamDetail />} />
            <Route path="exam/:examId/preview" element={<ExamPreview />} />

            {/* Assignment */}
            <Route path="exercises" element={<AssignmentManagement />} />

            {/* Ngân hàng câu hỏi */}
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="question-bank/create" element={<QuestionCreate />} />
            <Route path="question-bank/add" element={<QuestionBankCreate />} />

            {/* Quản lý khóa học */}
            <Route path="courses" element={<ManageCourses />} />
            <Route path="courses/part/:courseSlug" element={<ManageLessons />} />
          </Route>
        </Route>

        {/* ===== Fallback ===== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
