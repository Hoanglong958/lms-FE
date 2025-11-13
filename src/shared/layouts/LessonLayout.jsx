import { Outlet } from "react-router-dom";
import LessonSidebar from "@features/lesson/components/LessonSidebar";
import LayoutHeader from "./LayoutHeader";
import "./LessonLayout.css";

export default function LessonLayout() {
  return (
    <div className="lesson-layout">
      {/* Header */}
      <LayoutHeader />

      {/* Phần nội dung chính + sidebar */}
      <div className="lesson-body">
        {/* Sidebar bên trái chứa toàn bộ nội dung chương/bài */}
        <aside className="lesson-sidebar-container">
          <LessonSidebar />
        </aside>

        {/* Khu vực hiển thị chi tiết bài học */}
        <main className="lesson-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
