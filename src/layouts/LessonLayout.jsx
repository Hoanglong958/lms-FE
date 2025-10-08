import { Outlet } from "react-router-dom";
import LessonSidebar from "@features/lesson/components/LessonSidebar";

export default function LessonLayout() {
  return (
    <div className="lesson-layout">
      {/* Header */}

      {/* Phần nội dung chính + sidebar */}
      <div className="lesson-body">
        <main className="lesson-content">
          <Outlet />
        </main>

        {/* Sidebar bên phải */}
        <aside className="lesson-sidebar">
          <LessonSidebar />
        </aside>
      </div>
    </div>
  );
}
