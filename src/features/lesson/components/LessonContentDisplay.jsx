// src/features/lesson/components/LessonContentDisplay.jsx
import React from "react";
import VideoPlayer from "./VideoPlayer";
import QuizComponent from "./QuizComponent";
import TaskComponent from "./TaskComponent";
import DocumentComponents from "./DocumentComponents";

const LessonContentDisplay = ({ item }) => {
  switch (item.type) {
    case "video":
      return <VideoPlayer item={item} />;
    case "quiz":
      return <QuizComponent item={item} />;
    case "task":
      return <TaskComponent item={item} />;
    case "document":
      return <DocumentComponents item={item} />;
    default:
      return <div>Loại nội dung này chưa được hỗ trợ.</div>;
  }
};

export default LessonContentDisplay;
