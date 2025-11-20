import React, { useEffect, useState } from "react";
import { lessonVideoService } from "@utils/lessonVideoService.js";
import LessonVideoEditor from "./LessonVideoEditor.jsx";
import LessonVideoCreate from "./LessonVideoCreate.jsx";

import { lessonQuizService } from "@utils/lessonQuizService.js";
import LessonQuizEditor from "./LessonQuizEditor.jsx";
import LessonQuizCreate from "./LessonQuizCreate.jsx";

import { quizQuestionService } from "@utils/quizQuestionService.js";
import { questionService } from "@utils/questionService.js";

import { lessonDocumentService } from "@utils/lessonDocumentService.js";
import LessonDocumentEditor from "./LessonDocumentEditor.jsx";
import LessonDocumentCreate from "./LessonDocumentCreate.jsx";

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

  // Load tất cả câu hỏi
  async function loadAllQuestions() {
    try {
      const res = await questionService.getAll();
      const processed = (res.data || []).map((q) => ({
        questionId: q.questionId ?? q.id,
        question_text: q.question_text ?? q.title ?? "Không có tên câu hỏi",
        type: q.type ?? "N/A",
      }));
      setAllQuestions(processed);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (!lesson) return;

    // VIDEO
    if (lesson.type === "VIDEO") {
      (async () => {
        const res = await lessonVideoService.getVideosByLesson(lesson.id);
        const list = res.data || [];
        setVideos(list);
        setSelectedVideo(list[0] || null);
      })();
    }

    // QUIZ
    if (lesson.type === "QUIZ") {
      (async () => {
        const res = await lessonQuizService.getQuizzesByLesson(lesson.id);
        const list = res.data || [];
        setQuizzes(list);
        setSelectedQuiz(list[0] || null);
      })();
    }

    // DOCUMENT
    if (lesson.type === "DOCUMENT") {
      (async () => {
        const res = await lessonDocumentService.getDocumentsByLesson(lesson.id);
        const list = res.data || [];
        setDocuments(list);
        setSelectedDocument(list[0] || null);
      })();
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
        <div key={`lesson-video-${lesson.id}`}>
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
                const newVideos = videos.map((v) =>
                  v.videoId === updated.videoId ? updated : v
                );
                setVideos(newVideos);
                setSelectedVideo(updated);
              }}
            />
          )}
        </div>
      )}

      {/* QUIZ */}
      {lesson.type === "QUIZ" && (
        <div key={`lesson-quiz-${lesson.id}`}>
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
                const newQuizzes = quizzes.map((q) =>
                  q.quizId === updated.quizId ? updated : q
                );
                setQuizzes(newQuizzes);
                setSelectedQuiz(updated);
              }}
            />
          )}

          {selectingQuestions && (
            <div
              style={{ marginTop: 10, border: "1px solid #ccc", padding: 10 }}
            >
              <h4>Chọn câu hỏi (cần chọn {selectedQuiz.questionCount})</h4>
              {allQuestions.map((q) => (
                <div key={`all-question-${q.questionId}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(q.questionId)}
                      onChange={() =>
                        setSelectedQuestions((prev) =>
                          prev.includes(q.questionId)
                            ? prev.filter((id) => id !== q.questionId)
                            : [...prev, q.questionId]
                        )
                      }
                    />{" "}
                    {q.question_text} - <i>{q.type}</i>
                  </label>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={async () => {
                    if (
                      selectedQuestions.length !== selectedQuiz.questionCount
                    ) {
                      alert(
                        `Cần chọn đúng ${selectedQuiz.questionCount} câu hỏi. Hiện tại: ${selectedQuestions.length}`
                      );
                      return;
                    }
                    const payload = selectedQuestions.map(
                      (questionId, index) => ({
                        quizId: selectedQuiz.quizId,
                        questionId,
                        orderIndex: index + 1,
                      })
                    );
                    await quizQuestionService.addBatch(payload);
                    alert("Đã gắn câu hỏi vào quiz");
                    setSelectingQuestions(false);
                  }}
                >
                  Lưu danh sách câu hỏi
                </button>
                <button
                  style={{ marginLeft: 10 }}
                  onClick={() => setSelectingQuestions(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT */}
      {lesson.type === "DOCUMENT" && (
        <div key={`lesson-document-${lesson.id}`}>
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
                const newDocs = documents.map((d) =>
                  d.documentId === updated.documentId ? updated : d
                );
                setDocuments(newDocs);
                setSelectedDocument(updated);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
