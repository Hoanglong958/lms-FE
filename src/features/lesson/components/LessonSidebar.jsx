export default function LessonSidebar() {
  const topics = [
    { id: 1, title: "Mục tiêu bài học" },
    { id: 2, title: "Nội dung chính" },
    { id: 3, title: "Ví dụ minh họa" },
    { id: 4, title: "Bài tập luyện tập" },
  ];

  return (
    <div>
      <h3 style={{ marginBottom: "15px", color: "#333" }}>Nội dung bài học</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {topics.map((topic) => (
          <li
            key={topic.id}
            style={{
              padding: "8px 0",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
            }}
          >
            {topic.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
