// src/features/lesson/components/TaskComponent.jsx
import React from "react";

const TaskComponent = ({ item }) => {
  return (
    <div className="task-wrapper">
      <h3>Bài tập: {item.title}</h3>
      <p>Nội dung bài tập sẽ được hiển thị ở đây.</p>
    </div>
  );
};

export default TaskComponent;
