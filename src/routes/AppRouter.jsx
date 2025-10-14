import { Routes, Route } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";
import LessonLayout from "@layouts/LessonLayout";
import AuthLayout from "@layouts/AuthLayout";
import ScrollToTop from "@components/common/ScrollToTop";
import HomePage from "@pages/HomePage";
import LessonPage from "@features/lesson/pages/LessonPage";
import Login from "@features/login/pages/login";
import BlogList from "@features/baiviet/pages/BlogList";
import Posts from "@features/baiviet/pages/Posts";
import BlogDetail from "@features/baiviet/pages/BlogDetail";
import SearchPage from "@features/search/pages/SearchPage";
import QuizExamPage from "@features/lesson/components/QuizExamPage";

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Login - không header/footer */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Home - có header/footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/bai-viet" element={<BlogList />} />
          <Route path="/bai-viet/:id" element={<BlogDetail />} />
          <Route path="/baiviet" element={<Posts />} />
          <Route path="/search" element={<SearchPage />} />
        </Route>

        {/* Lesson - có sidebar, không footer */}
        <Route path="/lessons/:courseId" element={<LessonLayout />}>
          <Route index element={<LessonPage />} />
          <Route path=":lessonId" element={<LessonPage />} />
        </Route>
        <Route path="/quiz-exam/:quizId" element={<QuizExamPage />} />
      </Routes>
    </>
  );
}
