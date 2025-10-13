// src/features/lesson/components/LessonContentDisplay.jsx
import React from "react";
import VideoPlayer from "./VideoPlayer";
import QuizComponent from "./QuizComponent";
import TaskComponent from "./TaskComponent";

const LessonContentDisplay = ({ item }) => {
  // Dùng switch-case để lựa chọn component dựa trên item.type
  switch (item.type) {
    case "video":
      return <VideoPlayer item={item} />;
    case "quiz":
      return <QuizComponent item={item} />;
    case "task":
      return <TaskComponent item={item} />;
    default:
      // Trả về một component mặc định nếu không khớp
      return <div>Loại nội dung này chưa được hỗ trợ.</div>;
  }
};

export default LessonContentDisplay;
