import React, { useEffect, useState } from "react";
import { quizQuestionService } from "@utils/quizQuestionService.js";

import { questionService } from "@utils/questionService.js"; // giả sử có service lấy tất cả question
import NotificationModal from "@components/NotificationModal/NotificationModal";

export default function QuizQuestionSelector({ quiz, onChange }) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  useEffect(() => {
    // Load tất cả question khi modal mở
    if (!showModal) return;
    async function loadQuestions() {
      const res = await questionService.getAll();
      const raw = res?.data;
      const arr = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.content)
        ? raw.content
        : [];
      const mapped = arr.map((q) => ({
        id: q?.id ?? q?.questionId ?? q?.id,
        title: q?.questionText ?? q?.title ?? "",
      }));
      setAllQuestions(mapped);
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
      showNotification("Chưa chọn", "Chưa chọn câu hỏi nào", "warning");
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
      showNotification("Lỗi", "Lỗi thêm câu hỏi", "error");
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
                <li key={q.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(q.id)}
                      onChange={() => handleToggle(q.id)}
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
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </>
  );
}
