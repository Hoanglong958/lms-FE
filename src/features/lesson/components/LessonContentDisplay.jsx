// src/features/lesson/components/LessonContentDisplay.jsx
import React from "react";
import VideoPlayer from "./VideoPlayer";
import QuizComponent from "./QuizComponent";
import TaskComponent from "./TaskComponent";
import DocumentViewer from "./DocumentViewer";

const LessonContentDisplay = ({ item, progress }) => {
  switch (item.type) {
    case "video":
    case "VIDEO":
      return <VideoPlayer item={item} progress={progress} />;
    case "quiz":
    case "QUIZ":
      return <QuizComponent item={item} progress={progress} />;
    case "task":
    case "TASK":
      return <TaskComponent item={item} progress={progress} />;
    case "document":
    case "DOCUMENT":
      return <DocumentViewer item={item} progress={progress} />;
    default:
      return <div>Loại nội dung này chưa được hỗ trợ.</div>;
  }
};

export default LessonContentDisplay;
