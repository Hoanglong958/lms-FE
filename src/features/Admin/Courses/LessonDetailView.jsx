import React, { useEffect, useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";
import LessonVideoEditor from "./LessonVideoEditor.jsx";

export default function LessonDetailView({ lesson }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    if (!lesson || lesson.type !== "VIDEO") return;

    async function load() {
      const res = await lessonVideoService.getVideoByLesson(lesson.id);
      setVideos(res.data || []);
      setSelectedVideo(res.data?.[0] || null);
    }

    load();
  }, [lesson]);

  if (!lesson) return <div>Chọn bài học để xem nội dung</div>;

  return (
    <div>
      <h2>{lesson.title}</h2>

      {selectedVideo && (
        <LessonVideoEditor
          video={selectedVideo}
          onUpdated={(updated) => {
            // update lại list + selected video
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
