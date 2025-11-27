// src/features/lesson/components/LessonContentDisplay.jsx
import React from "react";
import VideoPlayer from "./VideoPlayer";
import QuizComponent from "./QuizComponent";
import TaskComponent from "./TaskComponent";
import DocumentViewer from "./DocumentViewer";

const LessonContentDisplay = ({ item }) => {
  switch (item.type) {
    case "video":
    case "VIDEO":
      return <VideoPlayer item={item} />;
    case "quiz":
    case "QUIZ":
      return <QuizComponent item={item} />;
    case "task":
    case "TASK":
      return <TaskComponent item={item} />;
    case "document":
    case "DOCUMENT":
      return <DocumentViewer item={item} />;
    default:
      return <div>Loại nội dung này chưa được hỗ trợ.</div>;
  }
};

export default LessonContentDisplay;
