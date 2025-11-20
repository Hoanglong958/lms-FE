import React, { useEffect, useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";
import LessonVideoEditor from "./LessonVideoEditor.jsx";
import LessonVideoCreate from "./LessonVideoCreate.jsx";

export default function LessonDetailView({ lesson }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    if (!lesson || lesson.type !== "VIDEO") return;

    async function load() {
      const res = await lessonVideoService.getVideoByLesson(lesson.id);
      const list = res.data || [];
      setVideos(list);
      setSelectedVideo(list[0] || null);
    }

    load();
  }, [lesson]);

  if (!lesson) return <div>Chọn một bài học để xem nội dung</div>;

  return (
    <div>
      <h2>{lesson.title}</h2>

      {/* Nếu chưa có video → hiện form tạo mới */}
      {!selectedVideo && (
        <LessonVideoCreate
          lesson={lesson}
          onCreated={(createdVideo) => {
            setVideos([createdVideo]);
            setSelectedVideo(createdVideo);
          }}
        />
      )}

      {/* Nếu đã có video → hiện editor */}
      {selectedVideo && (
        <LessonVideoEditor
          video={selectedVideo}
          onUpdated={(updated) => {
            const newList = videos.map((v) =>
              v.videoId === updated.videoId ? updated : v
            );
            setVideos(newList);
            setSelectedVideo(updated);
          }}
        />
      )}
    </div>
  );
}
