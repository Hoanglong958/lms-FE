import { useState } from "react";
import LessonSidebar from "@features/lesson/components/LessonSidebar";

export default function LessonLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "row", minHeight: "80vh" }}>
      {/* Nội dung bài học */}
      <main style={{ flex: 1, padding: "30px", transition: "all 0.3s" }}>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          style={{
            background: "#007bff",
            color: "#fff",
            padding: "8px 14px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          {showSidebar ? "Ẩn Sidebar" : "Hiện Sidebar"}
        </button>

        {children}
      </main>

      {/* Sidebar bên phải */}
      {showSidebar && (
        <aside
          style={{
            width: "280px",
            backgroundColor: "#f9f9f9",
            borderLeft: "1px solid #ddd",
            padding: "20px",
            transition: "width 0.3s",
          }}
        >
          <LessonSidebar />
        </aside>
      )}
    </div>
  );
}
