import React, { useEffect, useState } from "react";
import { quizQuestionService } from "@utils/quizQuestionService.js";
import { questionService } from "@utils/questionService.js"; // giả sử có service lấy tất cả question

export default function QuizQuestionSelector({ quiz, onChange }) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Load tất cả question khi modal mở
    if (!showModal) return;
    async function loadQuestions() {
      const res = await questionService.getAll();
      setAllQuestions(res.data || []);
    }
    loadQuestions();
  }, [showModal]);

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Chưa chọn câu hỏi nào");
      return;
    }
    // Validation removed as per user request (auto count)

    const payload = selectedIds.map((questionId, index) => ({
      quizId: quiz.quizId,
      questionId,
      orderIndex: index + 1,
    }));

    try {
      for (let index = 0; index < selectedIds.length; index++) {
        const questionId = selectedIds[index];
        const payload = {
          quizId: quiz.quizId,
          questionId,
          orderIndex: index + 1,
        };
        await quizQuestionService.add(payload);
      }
      onChange?.();
      setShowModal(false);
    } catch (err) {
      alert("Lỗi thêm câu hỏi");
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>Thêm câu hỏi</button>

      {showModal && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3>Chọn câu hỏi cho Quiz: {quiz.title}</h3>
            <ul style={{ maxHeight: "300px", overflowY: "auto" }}>
              {allQuestions.map((q) => (
                <li key={q.questionId}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q.questionId)}
                      onChange={() => handleToggle(q.questionId)}
                    />
                    {q.title}
                  </label>
                </li>
              ))}
            </ul>
            <button onClick={handleAddSelected}>Xác nhận</button>
            <button onClick={() => setShowModal(false)}>Hủy</button>
          </div>
        </div>
      )}
    </>
  );
}
