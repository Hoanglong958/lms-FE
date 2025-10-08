import { Routes, Route } from "react-router-dom";
import MainLayout from "@layouts/MainLayout";
import HomePage from "@pages/HomePage";
import Login from "@features/login/pages/login";
import LessonLayout from "@layouts/LessonLayout";
import LessonPage from "@features/lesson/pages/lessonPage";
import ScrollToTop from "@components/common/ScrollToTop";

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Login không có layout */}
        <Route path="/login" element={<Login />} />

        {/* Các trang có header/footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* Lesson page có sidebar riêng */}
          <Route
            path="/lesson"
            element={
              <LessonLayout>
                <LessonPage />
              </LessonLayout>
            }
          />
        </Route>
      </Routes>
    </>
  );
}
