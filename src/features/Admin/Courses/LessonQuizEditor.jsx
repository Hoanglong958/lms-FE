import React, { useState, useEffect } from "react";
import { lessonQuizService } from "@utils/lessonQuizService.js";
import { quizQuestionService } from "@utils/quizQuestionService.js";
import { questionService } from "@utils/questionService.js";

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

  // map quiz questionId với allQuestions để lấy question_text
  const mappedQuestions = questions.map((q) => {
    // q.questionId có thể là undefined, dùng q.id
    const id = q.questionId ?? q.id;

    const full = allQuestions.find((a) => a.questionId === id);
    return {
      questionId: id,
      question_text: full?.question_text || "Không có tên câu hỏi",
      type: full?.category ?? "N/A",
    };
  });

  // Load all questions on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await questionService.getAll();
        const processed = (res.data || []).map((q) => ({
          questionId: q.questionId ?? q.id, // để nguyên number
          question_text:
            q.questionText ??
            q.question_text ??
            q.title ??
            "Không có tên câu hỏi",
          category: q.category ?? q.category ?? "N/A", // đồng bộ category
        }));
        setAllQuestions(processed);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Load quiz info + questions after allQuestions loaded
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
            questionId: q.questionId, // vẫn là number
            question_text: full?.question_text ?? "Không có tên câu hỏi",
            category: full?.category ?? "N/A",
          };
        });
        setQuestions(mapped);
        setSelectedQuestions(mapped.map((q) => q.questionId)); // number luôn
      } catch (err) {
        console.error(err);
      }
    })();
  }, [quiz, allQuestions]);

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

  const handleSaveSelectedQuestions = async () => {
    if (selectedQuestions.length !== Number(form.questionCount)) {
      return alert(
        `Cần chọn đúng ${form.questionCount} câu hỏi. Hiện tại: ${selectedQuestions.length}`
      );
    }

    try {
      const payload = selectedQuestions.map((questionId, index) => ({
        quizId: quiz.quizId,
        questionId,
        orderIndex: index + 1,
      }));
      await quizQuestionService.addBatch(payload);

      const updated = allQuestions.filter((q) =>
        selectedQuestions.includes(q.questionId)
      );
      setQuestions(updated);
      setSelectingQuestions(false);
    } catch (err) {
      console.error(err);
      alert("Không thể lưu danh sách câu hỏi");
    }
  };

  if (!editing) {
    return (
      <div>
        <h3>{form.title}</h3>
        <p>
          <b>Số câu hỏi:</b> {form.questionCount}
        </p>
        <p>
          <b>Điểm tối đa:</b> {form.maxScore}
        </p>
        <p>
          <b>Điểm đạt:</b> {form.passingScore}
        </p>

        <h4>Câu hỏi trong quiz:</h4>
        {questions.length > 0 ? (
          <ul>
            {questions.map((q, idx) => (
              <li key={`quiz-question-${q.questionId}-${idx}`}>
                {q.question_text} - <i>{q.category}</i>{" "}
                <button
                  style={{ marginLeft: 10 }}
                  onClick={async () => {
                    try {
                      // Xóa question
                      await quizQuestionService.delete(q.questionId);
                      // Cập nhật lại state
                      setQuestions((prev) =>
                        prev.filter((item) => item.questionId !== q.questionId)
                      );
                      setSelectedQuestions((prev) =>
                        prev.filter((id) => id !== q.questionId)
                      );
                      alert("Đã xóa câu hỏi khỏi quiz");
                    } catch (err) {
                      console.error(err);
                      alert("Không thể xóa câu hỏi");
                    }
                  }}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có câu hỏi nào</p>
        )}

        <button onClick={() => setEditing(true)}>Sửa quiz</button>
        <button
          onClick={() => setSelectingQuestions(true)}
          style={{ marginLeft: 10 }}
        >
          Chọn câu hỏi
        </button>

        {selectingQuestions && (
          <div style={{ marginTop: 10, border: "1px solid #ccc", padding: 10 }}>
            <h4>Chọn câu hỏi (cần chọn {form.questionCount})</h4>
            {allQuestions.map((q) => {
              const alreadyInQuiz = questions.some(
                (item) => item.questionId === q.questionId
              );
              return (
                <div key={`all-question-${q.questionId}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(q.questionId)}
                      disabled={alreadyInQuiz} // disable nếu đã có trong quiz
                      onChange={() =>
                        setSelectedQuestions((prev) =>
                          prev.includes(q.questionId)
                            ? prev.filter((id) => id !== q.questionId)
                            : [...prev, q.questionId]
                        )
                      }
                    />{" "}
                    {q.question_text} - <i>{q.category}</i>
                    {alreadyInQuiz && " (Đã có trong quiz)"}
                  </label>
                </div>
              );
            })}

            <div style={{ marginTop: 12 }}>
              <button onClick={handleSaveSelectedQuestions}>
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
    );
  }

  return (
    <div>
      <h3>Sửa Quiz</h3>
      <div>
        <label>Tiêu đề:</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div>
        <label>Số câu hỏi:</label>
        <input
          type="number"
          value={form.questionCount}
          onChange={(e) => setForm({ ...form, questionCount: e.target.value })}
        />
      </div>
      <div>
        <label>Điểm tối đa:</label>
        <input
          type="number"
          value={form.maxScore}
          onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
        />
      </div>
      <div>
        <label>Điểm đạt:</label>
        <input
          type="number"
          value={form.passingScore}
          onChange={(e) => setForm({ ...form, passingScore: e.target.value })}
        />
      </div>
      <button onClick={handleSave}>Lưu</button>
      <button onClick={() => setEditing(false)}>Hủy</button>
    </div>
  );
}
