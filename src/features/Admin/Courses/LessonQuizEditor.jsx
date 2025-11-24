import React, { useState, useEffect } from "react";
import { lessonQuizService } from "@utils/lessonQuizService.js";
import { quizQuestionService } from "@utils/quizQuestionService.js";
import { questionService } from "@utils/questionService.js";

// IMPORT CSS RIÊNG CHO TRANG NÀY
import "./CoursesCSS/LessonQuizEditor.css";

export default function LessonQuizEditor({ quiz, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    questionCount: 0,
    maxScore: 0,
    passingScore: 0,
  });
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectingQuestions, setSelectingQuestions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Map quiz questionId với allQuestions để lấy question_text
  const mappedQuestions = questions.map((q) => {
    const id = q.questionId ?? q.id;
    const full = allQuestions.find((a) => a.questionId === id);
    return {
      questionId: id,
      question_text: full?.question_text || "Không có tên câu hỏi",
      category: full?.category ?? "N/A",
    };
  });

  // Load all questions
  useEffect(() => {
    (async () => {
      try {
        const res = await questionService.getAll();
        const processed = (res.data || []).map((q) => ({
          questionId: q.questionId ?? q.id,
          question_text:
            q.questionText ??
            q.question_text ??
            q.title ??
            "Không có tên câu hỏi",
          category: q.category ?? "N/A",
        }));
        setAllQuestions(processed);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Load quiz info + questions
  useEffect(() => {
    if (!quiz || allQuestions.length === 0) return;

    setForm({
      title: quiz.title || "",
      questionCount: quiz.questionCount || 0,
      maxScore: quiz.maxScore || 0,
      passingScore: quiz.passingScore || 0,
    });
    setEditing(false);

    (async () => {
      try {
        const res = await quizQuestionService.getByQuiz(quiz.quizId);
        const quizQs = res.data || [];

        const mapped = quizQs.map((q) => {
          const full = allQuestions.find((a) => a.questionId === q.questionId);
          return {
            recordId: q.id,
            questionId: q.questionId,
            question_text: full?.question_text ?? "Không có tên câu hỏi",
            category: full?.category ?? "N/A",
          };
        });
        setQuestions(mapped);
        setSelectedQuestions(mapped.map((q) => q.questionId));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [quiz, allQuestions]);

  // Save quiz info
  const handleSave = async () => {
    if (!form.title) return alert("Tiêu đề quiz không được để trống");

    const payload = {
      lessonId: quiz.lessonId,
      title: form.title,
      questionCount: Number(form.questionCount),
      maxScore: Number(form.maxScore),
      passingScore: Number(form.passingScore),
    };
    try {
      const res = await lessonQuizService.updateQuiz(quiz.quizId, payload);
      onUpdated(res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Không thể lưu quiz");
    }
  };

  // Save selected questions
  const handleSaveSelectedQuestions = async () => {
    const existingIds = questions.map((q) => q.questionId);
    const newQuestionIds = selectedQuestions.filter(
      (id) => !existingIds.includes(id)
    );

    if (newQuestionIds.length === 0) {
      alert("Không có câu hỏi mới để thêm");
      setSelectingQuestions(false);
      return;
    }

    if (selectedQuestions.length !== Number(form.questionCount)) {
      return alert(
        `Cần chọn đúng ${form.questionCount} câu hỏi. Hiện tại: ${selectedQuestions.length}`
      );
    }

    try {
      const payload = newQuestionIds.map((questionId, index) => ({
        quizId: quiz.quizId,
        questionId,
        orderIndex: questions.length + index + 1,
      }));

      await quizQuestionService.addBatch(payload);

      const newQuestions = allQuestions.filter((q) =>
        newQuestionIds.includes(q.questionId)
      );
      setQuestions((prev) => [...prev, ...newQuestions]);
      setSelectingQuestions(false);
    } catch (err) {
      console.error(err);
      alert("Không thể lưu danh sách câu hỏi");
    }
  };

  // Delete question
  const handleDeleteQuestion = async (q) => {
    try {
      await quizQuestionService.delete(q.recordId);
      setQuestions((prev) =>
        prev.filter((item) => item.questionId !== q.questionId)
      );
      setSelectedQuestions((prev) => prev.filter((id) => id !== q.questionId));
      alert("Đã xóa câu hỏi khỏi quiz");
    } catch (err) {
      console.error(err);
      alert("Không thể xóa câu hỏi");
    }
  };

  // Render list of questions
  const renderQuestionList = () =>
    questions.length > 0 ? (
      <ul className="lqz-question-list">
        {questions.map((q, idx) => (
          <li
            key={`quiz-question-${q.questionId}-${idx}`}
            className="lqz-question-item"
          >
            <span className="lqz-question-text">
              {q.question_text} - <i>{q.category}</i>
            </span>
            <button
              className="lqz-btn-danger"
              onClick={() => handleDeleteQuestion(q)}
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="lqz-empty">Chưa có câu hỏi nào</p>
    );

  // Render modal for selecting questions
  const renderSelectModal = () => (
    <div
      className="lqz-modal-overlay"
      onClick={() => setSelectingQuestions(false)}
    >
      <div className="lqz-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lqz-modal-header">
          <h4 className="lqz-subtitle">
            Chọn câu hỏi (cần chọn {form.questionCount})
          </h4>
          <button
            className="lqz-close"
            onClick={() => setSelectingQuestions(false)}
          >
            ×
          </button>
        </div>

        <div className="lqz-modal-body">
          {allQuestions.map((q) => {
            const already = questions.some(
              (item) => item.questionId === q.questionId
            );
            return (
              <div
                key={`modal-all-question-${q.questionId}`}
                className={`lqz-select-item ${already ? "lqz-disabled" : ""}`}
              >
                <label>
                  <input
                    type="checkbox"
                    className="lqz-checkbox"
                    checked={selectedQuestions.includes(q.questionId)}
                    disabled={already}
                    onChange={() =>
                      setSelectedQuestions((prev) =>
                        prev.includes(q.questionId)
                          ? prev.filter((id) => id !== q.questionId)
                          : [...prev, q.questionId]
                      )
                    }
                  />
                  {q.question_text} - <i>{q.category}</i>
                  {already && " (Đã có trong quiz)"}
                </label>
              </div>
            );
          })}
        </div>

        <div className="lqz-modal-footer">
          <button className="lqz-btn" onClick={handleSaveSelectedQuestions}>
            Lưu danh sách câu hỏi
          </button>
          <button
            className="lqz-btn-secondary"
            onClick={() => setSelectingQuestions(false)}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );

  // ==============================
  //          VIEW MODE
  // ==============================
  if (!editing) {
    return (
      <div className="lqz-wrapper">
        <div className="lqz-header">
          <div className="lqz-actions">
            <button
              className="lqz-btn edit-btn"
              onClick={() => setEditing(true)}
            >
              Sửa quiz
            </button>
            <button
              className="lqz-btn-secondary select-btn"
              onClick={() => setSelectingQuestions(true)}
            >
              Chọn câu hỏi
            </button>
          </div>

          <p>
            <b className="lqz-title">Tiêu đề:</b> {form.title}
          </p>
          <p className="lqz-info">
            <b>Số câu hỏi:</b> {form.questionCount}
          </p>
          <p className="lqz-info">
            <b>Điểm tối đa:</b> {form.maxScore}
          </p>
          <p className="lqz-info">
            <b>Điểm đạt:</b> {form.passingScore}
          </p>
        </div>

        <div className="lqz-questions">
          <h4 className="lqz-subtitle">Câu hỏi trong quiz:</h4>
          {renderQuestionList()}
        </div>

        {selectingQuestions && renderSelectModal()}
      </div>
    );
  }

  // ==============================
  //          EDIT MODE
  // ==============================
  return (
    <div className="lqz-wrapper">
      <h3 className="lqz-title">Sửa Quiz</h3>

      {["title", "questionCount", "maxScore", "passingScore"].map((field) => (
        <div key={field} className="lqz-form-row">
          <label className="lqz-label">
            {field === "title"
              ? "Tiêu đề:"
              : field === "questionCount"
              ? "Số câu hỏi:"
              : field === "maxScore"
              ? "Điểm tối đa:"
              : "Điểm đạt:"}
          </label>
          <input
            className="lqz-input"
            type={field === "title" ? "text" : "number"}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        </div>
      ))}

      <button className="lqz-btn" onClick={handleSave}>
        Lưu
      </button>
      <button className="lqz-btn-secondary" onClick={() => setEditing(false)}>
        Hủy
      </button>
    </div>
  );
}
