import { Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "@components/common/ScrollToTop";
import PrivateRoute from "@components/common/PrivateRoute";

import MainLayout from "@layouts/MainLayout";
import LessonLayout from "@layouts/LessonLayout";
import AuthLayout from "@layouts/AuthLayout";
import AdminLayout from "@layouts/AdminLayout";

// User Pages
import HomePage from "@pages/HomePage";
import DashboardUser from "@pages/DashboardUser";
import ProfileEdit from "@features/userProfile/ProfileEdit";
import BlogList from "@features/baiviet/pages/BlogList";
import BlogDetail from "@features/baiviet/pages/BlogDetail";
import Posts from "@features/baiviet/pages/Posts";
import SearchPage from "@features/search/pages/SearchPage";
import LessonPage from "@features/lesson/pages/LessonPage";
import QuizExamPage from "@features/lesson/components/QuizExamPage";
import Login from "@features/login/pages/login";
import Register from "@features/login/pages/Register";

// ⭐ USER CLASS PAGE
import ClassesPage from "@pages/ClassesPage";
import ClassDetailPage from "@pages/ClassDetailPage";
import ClassCalendarPage from "@pages/ClassCalendarPage";
import ClassRoadmapPage from "@pages/ClassRoadmapPage";

// ⭐⭐ THÊM ROUTE MỚI
import JavaExamPage from "@pages/JavaExamPage";
import JavaExamResult from "@pages/JavaExamResult";
import JavaExamCard from "@pages/JavaExamCard";

// ================= ADMIN =================
import DashboardPage from "@features/Admin/Dashboard/DashboardPage";
import Dashboard from "@features/Admin/Dashboard/Dashboard";
import DashboardDetails from "@features/Admin/Dashboard/dashboarddetails";

import ManageCourses from "@admin/Courses/ManageCourses";
import ManageLessons from "@admin/Courses/ManageLessons";
import AdminHomePage from "@pages/AdminHomePage";

import ExamManagement from "@features/Admin/ExamManagement/ExamManagement";
import ExamDetail from "@features/Admin/ExamManagement/ExamDetail";
import ExamPreview from "@features/Admin/ExamManagement/ExamPreview";
import AssignmentManagement from "@features/Admin/ExamManagement/AssignmentManagement";

import QuestionBank from "@features/Admin/ExamManagement/QuestionBank";
import QuestionCreate from "@features/Admin/ExamManagement/QuestionCreate";
import QuestionBankCreate from "@features/Admin/ExamManagement/QuestionBankCreate";
import QuestionBankBulk from "@features/Admin/ExamManagement/QuestionBankBulk";

import UserManagement from "@features/Admin/UserManagement/user";
import ClassManagement from "@features/Admin/ClassManagement/class";
import ClassDetail from "@features/Admin/ClassManagement/ClassDetail";

// Quản lý thời khóa biểu
import CalendarManagement from "@features/Admin/CalendarManagement/Calendar";

// Quản lý lộ trình
import Roadmap from "@features/Admin/Roadmap/Roadmap";
import PostManagement from "@features/Admin/PostManagement/PostManagement";
import PostCreate from "@features/Admin/PostManagement/PostCreate";
import PostEdit from "@features/Admin/PostManagement/PostEdit";

// ================= TEACHER =================
import TeacherLayout from "@layouts/TeacherLayout";
import TeacherDashboard from "@features/Teacher/Dashboard/TeacherDashboard";
import TeacherClassList from "@features/Teacher/ClassManagement/TeacherClassList";
import TeacherClassDetail from "@features/Teacher/ClassManagement/TeacherClassDetail";

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* REDIRECT ROOT → LOGIN */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ================= AUTH ROUTES ================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ================= USER ROUTES ================= */}
        <Route element={<PrivateRoute role="ROLE_USER" />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardUser />} />

            {/* USER CLASS */}
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/classes/:id" element={<ClassDetailPage />} />
            <Route path="/classes/:id/calendar" element={<ClassCalendarPage />} />
            <Route path="/classes/:id/roadmap" element={<ClassRoadmapPage />} />

            {/* BLOG */}
            <Route path="/bai-viet" element={<BlogList />} />
            <Route path="/bai-viet/:id" element={<BlogDetail />} />
            <Route path="/baiviet" element={<Navigate to="/bai-viet" replace />} />

            <Route path="/search" element={<SearchPage />} />

            {/* ⭐ BÀI KIỂM TRA (đưa nội dung thi thử vào đây) */}
            <Route path="/exam" element={<JavaExamPage />} />
            <Route path="/exam/:examId" element={<JavaExamPage />} />
            <Route path="/exam/result" element={<JavaExamResult />} />
            {/* ⭐⭐ JAVA EXAM PAGE */}
            <Route path="/java-exam" element={<JavaExamCard />} />
            <Route path="/java-exam/start" element={<JavaExamPage />} />
            <Route path="/java-exam/result" element={<JavaExamResult />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
          </Route>

          {/* COURSE LESSONS */}
          <Route path="/courses/:courseSlug" element={<LessonLayout />}>
            <Route index element={<LessonPage />} />
            <Route path=":lessonId" element={<LessonPage />} />
          </Route>

          {/* QUIZ */}
          <Route path="/quiz-exam/:quizId" element={<QuizExamPage />} />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route element={<PrivateRoute role="ROLE_ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<DashboardPage />}>
              <Route index element={<Dashboard />} />
              <Route path="details" element={<DashboardDetails />} />
            </Route>

            <Route path="users" element={<UserManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="classes/:id" element={<ClassDetail />} />

            {/* Admin Home */}
            <Route path="home" element={<AdminHomePage />} />

            {/* EXAM MANAGEMENT */}
            <Route path="exam" element={<ExamManagement />} />
            <Route path="exam/:examId/detail" element={<ExamDetail />} />
            <Route path="exam/:examId/preview" element={<ExamPreview />} />

            <Route path="exercises" element={<AssignmentManagement />} />

            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="question-bank/create" element={<QuestionCreate />} />
            <Route path="question-bank/add" element={<QuestionBankCreate />} />
            <Route path="question-bank/bulk" element={<QuestionBankBulk />} />

            <Route path="courses" element={<ManageCourses />} />
            <Route
              path="courses/part/:courseSlug"
              element={<ManageLessons />}
            />

            {/* Quản lý thời khóa biểu */}
            <Route path="calendar" element={<CalendarManagement />} />

            {/* Quản lý lộ trình */}
            <Route path="roadmap" element={<Roadmap />} />

            {/* Quản lý bài viết */}
            <Route path="posts" element={<PostManagement />} />
            <Route path="posts/create" element={<PostCreate />} />
            <Route path="posts/:id/edit" element={<PostEdit />} />
          </Route>

          {/* ADMIN MANAGE LESSONS FROM OUTSIDE */}
          <Route
            path="/admin/courses/:courseSlug"
            element={<ManageLessons />}
          />
        </Route>

        {/* ================= TEACHER ROUTES ================= */}
        <Route element={<PrivateRoute role="ROLE_TEACHER" />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />

            {/* Class Management */}
            <Route path="classes" element={<TeacherClassList />} />
            <Route path="classes/:id" element={<TeacherClassDetail />} />

            {/* Lesson Management */}
            <Route path="lessons/:courseId" element={<ManageLessons />} />

            {/* Reuse Admin components for compatible features */}
            <Route path="exam" element={<ExamManagement />} />
            <Route path="question-bank" element={<QuestionBank />} />
            <Route path="posts" element={<PostManagement />} />
            <Route path="posts/create" element={<PostCreate />} />
            <Route path="posts/:id/edit" element={<PostEdit />} />
          </Route>
        </Route>

        {/* NOT FOUND → LOGIN */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
