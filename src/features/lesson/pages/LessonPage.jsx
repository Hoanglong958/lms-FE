import React, { useState } from "react";

export default function LessonPage() {
  const [completed, setCompleted] = useState(false);

  return (
    <div>
      <h1>Bài học: Giới thiệu React</h1>
      <p>
        React là một thư viện JavaScript giúp xây dựng giao diện người dùng linh
        hoạt và hiệu quả. Nó cho phép bạn chia nhỏ ứng dụng thành các component
        để dễ tái sử dụng và quản lý.
      </p>

      {!completed ? (
        <button
          onClick={() => setCompleted(true)}
          style={{
            background: "#007bff",
            color: "#fff",
            padding: "10px 18px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Hoàn thành bài học
        </button>
      ) : (
        <p style={{ color: "green", fontWeight: "bold", marginTop: "20px" }}>
          ✅ Bạn đã hoàn thành bài học này!
        </p>
      )}
    </div>
  );
}
