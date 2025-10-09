import { Outlet } from "react-router-dom";
import LessonSidebar from "@features/lesson/components/LessonSidebar";
import LayoutHeader from "./LayoutHeader";
import "./Lesson.css";

export default function LessonLayout() {
  return (
    <div className="lesson-layout">
      {/* Header */}
      <LayoutHeader />

      {/* Phần nội dung chính + sidebar */}
      <div className="lesson-body">
        <main className="lesson-content">
          <Outlet />
        </main>

        {/* Sidebar bên phải */}
        <aside className="lesson-sidebar-container">
          <LessonSidebar />
        </aside>
      </div>
    </div>
  );
}
