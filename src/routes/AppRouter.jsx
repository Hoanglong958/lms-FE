import { Routes, Route } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";
import LessonLayout from "@layouts/LessonLayout";
import AuthLayout from "@layouts/AuthLayout";
import ScrollToTop from "@components/common/ScrollToTop";
import HomePage from "@pages/HomePage";
import LessonPage from "@features/lesson/pages/LessonPage";
import Login from "@features/login/pages/login";

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
        </Route>

        {/* Lesson - có sidebar, không footer */}
        <Route element={<LessonLayout />}>
          <Route path="/lesson" element={<LessonPage />} />
        </Route>
      </Routes>
    </>
  );
}
