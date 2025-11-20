import React, { useEffect, useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";
import LessonVideoEditor from "./LessonVideoEditor.jsx";
import LessonVideoCreate from "./LessonVideoCreate.jsx";

import { lessonQuizService } from "@utils/lessonQuizService.js";
import LessonQuizEditor from "./LessonQuizEditor.jsx";
import LessonQuizCreate from "./LessonQuizCreate.jsx";

import { questionService } from "@utils/questionService.js";

import "../Courses/CoursesCSS/LessonDetailView.css"

export default function LessonDetailView({ lesson }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const [selectingQuestions, setSelectingQuestions] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);

  async function loadAllQuestions() {
    const res = await questionService.getQuestions();
    setAllQuestions(res.data || []);
  }

  useEffect(() => {
    if (!lesson) return;

    if (lesson.type === "VIDEO") {
      async function loadVideos() {
        const res = await lessonVideoService.getVideosByLesson(lesson.id);
        const list = res.data || [];
        setVideos(list);
        setSelectedVideo(list[0] || null);
      }
      loadVideos();
    }

    if (lesson.type === "QUIZ") {
      async function loadQuizzes() {
        const res = await lessonQuizService.getQuizzesByLesson(lesson.id);
        const list = res.data || [];
        setQuizzes(list);
        setSelectedQuiz(list[0] || null);
      }
      loadQuizzes();
    }

    if (lesson.type === "DOCUMENT") {
      async function loadDocuments() {
        const res = await lessonDocumentService.getDocumentsByLesson(lesson.id);
        const list = res.data || [];
        setDocuments(list);
        setSelectedDocument(list[0] || null);
      }
      loadDocuments();
    }
  }, [lesson]);

  if (!lesson) return <div className="guide-action">
  <span className="guide-icon">📘</span>
  Chọn một bài học để xem nội dung
</div>
;

  return (
    <div>
      <h2 className="lesson-title">{lesson.title}</h2>

      {/* VIDEO */}
      {lesson.type === "VIDEO" && (
        <>
          {!selectedVideo && (
            <LessonVideoCreate
              lesson={lesson}
              onCreated={(createdVideo) => {
                setVideos([createdVideo]);
                setSelectedVideo(createdVideo);
              }}
            />
          )}
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
        </>
      )}

      {/* QUIZ */}

      {lesson.type === "QUIZ" && (
        <>
          {!selectedQuiz && (
            <LessonQuizCreate
              lesson={lesson}
              onCreated={(createdQuiz) => {
                setQuizzes([createdQuiz]);
                setSelectedQuiz(createdQuiz);
              }}
            />
          )}
          {selectedQuiz && (
            <LessonQuizEditor
              quiz={selectedQuiz}
              onUpdated={(updated) => {
                const newList = quizzes.map((q) =>
                  q.quizId === updated.quizId ? updated : q
                );
                setQuizzes(newList);
                setSelectedQuiz(updated);
              }}
            />
          )}
          {/* NÚT CHỌN CÂU HỎI */}
          {lesson.type === "QUIZ" && selectedQuiz && (
            <div style={{ marginTop: "20px" }}>
              {!selectingQuestions && (
                <button
                  onClick={async () => {
                    await loadAllQuestions();
                    setSelectingQuestions(true);
                  }}
                >
                  Chọn câu hỏi
                </button>
              )}

              {/* MÀN CHỌN CÂU HỎI */}
              {selectingQuestions && (
                <div
                  style={{
                    marginTop: "10px",
                    border: "1px solid #ccc",
                    padding: "10px",
                  }}
                >
                  <h3>Chọn câu hỏi (cần chọn {selectedQuiz.questionCount})</h3>

                  {allQuestions.map((q) => (
                    <div key={q.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(q.id)}
                          onChange={() => {
                            if (selectedQuestions.includes(q.id)) {
                              setSelectedQuestions(
                                selectedQuestions.filter((id) => id !== q.id)
                              );
                            } else {
                              setSelectedQuestions([
                                ...selectedQuestions,
                                q.id,
                              ]);
                            }
                          }}
                        />{" "}
                        {q.questionText}
                      </label>
                    </div>
                  ))}

                  <div style={{ marginTop: "12px" }}>
                    <button
                      onClick={() => {
                        if (
                          selectedQuestions.length !==
                          selectedQuiz.questionCount
                        ) {
                          alert(
                            `Cần chọn đúng ${selectedQuiz.questionCount} câu hỏi. Hiện tại: ${selectedQuestions.length}`
                          );
                          return;
                        }

                        // TODO: GỌI API GẮN CÂU HỎI VÀO QUIZ – bạn đưa swagger tôi viết luôn
                        console.log("Danh sách câu hỏi:", selectedQuestions);

                        setSelectingQuestions(false);
                      }}
                    >
                      Lưu danh sách câu hỏi
                    </button>

                    <button
                      style={{ marginLeft: "10px" }}
                      onClick={() => setSelectingQuestions(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* DOCUMENT */}
      {lesson.type === "DOCUMENT" && (
        <>
          {!selectedDocument && (
            <LessonDocumentCreate
              lesson={lesson}
              onCreated={(createdDoc) => {
                setDocuments([createdDoc]);
                setSelectedDocument(createdDoc);
              }}
            />
          )}
          {selectedDocument && (
            <LessonDocumentEditor
              document={selectedDocument}
              onUpdated={(updated) => {
                const newList = documents.map((d) =>
                  d.id === updated.id ? updated : d
                );
                setDocuments(newList);
                setSelectedDocument(updated);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
