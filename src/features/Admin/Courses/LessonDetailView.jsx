import React, { useState, useEffect } from "react";
import { lessonVideoService as videoService } from "@utils/lessonVideoService.js";
import { lessonQuizService as quizService } from "@utils/lessonQuizService.js";
import LessonVideoEditor from "./LessonVideoEditor.jsx";
// import LessonQuizEditor from "./LessonQuizEditor.jsx"; // nếu có quiz

export default function LessonDetailView({ lesson }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    if (!lesson) return;

    async function loadContent() {
      if (lesson.type === "VIDEO") {
        const res = await videoService.getVideoByLesson(lesson.id);
        setVideoUrl(res.data[0]?.videoUrl || "");
      } else if (lesson.type === "QUIZ") {
        const res = await quizService.getQuizzesByLesson(lesson.id);
        setQuizQuestions(res.data || []);
      }
    }

    loadContent();
  }, [lesson]);

  if (!lesson) return <div>Chọn một bài học để xem nội dung</div>;

  return (
    <div>
      <h2>{lesson.title}</h2>
      {lesson.type === "VIDEO" && <LessonVideoEditor lesson={lesson} />}
      {lesson.type === "QUIZ" && <LessonQuizEditor lesson={lesson} />}
    </div>
  );
}
