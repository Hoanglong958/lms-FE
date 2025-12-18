import React, { useState, useEffect } from "react";
import { lessonQuizService } from "@utils/lessonQuizService.js";
import { quizQuestionService } from "@utils/quizQuestionService.js";
import { questionService } from "@utils/questionService.js";

// IMPORT CSS RIÊNG CHO TRANG NÀY
import "./CoursesCSS/LessonQuizEditor.css";
import NotificationModal from "@components/NotificationModal/NotificationModal";

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

  // Pagination & Search State for Modal
  const [modalQuestions, setModalQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(""); // Category filter
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);

  const CATEGORIES = ["Java", "OOP", "HTTP", "Git", "React", "SQL", "Spring Boot"];

  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [keyword]);

  // Load questions for modal when open/page/search/category changes
  useEffect(() => {
    if (!selectingQuestions) return;

    const fetchModalQuestions = async () => {
      setLoadingModal(true);
      try {
        const res = await questionService.getPage({
          page: page - 1,
          size: 10,
          keyword: debouncedKeyword,
          category: category === "ALL" ? "" : category,
        });
        const data = res.data;
        const content = data?.content || [];
        setModalQuestions(content);
        setTotalPages(data?.totalPages || 1);

        // Update allQuestions cache with new data to ensure titles are available
        setAllQuestions(prev => {
          const newQs = content.map(q => ({
            questionId: q.questionId ?? q.id,
            question_text: q.questionText ?? q.question_text ?? q.title ?? "Không có tên câu hỏi",
            category: q.category ?? "N/A"
          }));

          // Merge avoiding duplicates
          const existingIds = new Set(prev.map(q => q.questionId));
          const uniqueNew = newQs.filter(q => !existingIds.has(q.questionId));
          return [...prev, ...uniqueNew];
        });

      } catch (err) {
        console.error("Fetch modal questions error", err);
      } finally {
        setLoadingModal(false);
      }
    };
    fetchModalQuestions();
  }, [selectingQuestions, page, debouncedKeyword, category]);


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

  // Load questions for cache (using getPage with large size since getAll is missing)
  useEffect(() => {
    (async () => {
      try {
        const res = await questionService.getPage({ page: 0, size: 100 });
        const data = res.data;
        const list = data?.content || [];

        const processed = list.map((q) => ({
          questionId: q.questionId ?? q.id,
          question_text:
            q.questionText ??
            q.question_text ??
            q.title ??
            "Không có tên câu hỏi",
          category: q.category ?? "N/A",
        }));
        setAllQuestions(processed);
      } catch (err) { }
    })();
  }, []);

  // Load quiz info + questions
  useEffect(() => {
    if (!quiz || allQuestions.length === 0) return;

    setForm({
      title: quiz.title || "",
      questionCount: quiz.questionCount || 0,
      maxScore: 10,
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
      } catch (err) { }
    })();
  }, [quiz, allQuestions]);

  // Save quiz info
  const handleSave = async () => {
    if (!form.title) return showNotification("Lỗi", "Tiêu đề quiz không được để trống", "error");

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
      showNotification("Lỗi", "Không thể lưu quiz", "error");
    }
  };

  // Save selected questions
  const handleSaveSelectedQuestions = async () => {
    const existingIds = questions.map((q) => q.questionId);
    const newQuestionIds = selectedQuestions.filter(
      (id) => !existingIds.includes(id)
    );

    // Check for changes (add or remove)
    const toAdd = newQuestionIds.filter((id) => !existingIds.includes(id));
    const toRemoveQuestionIds = existingIds.filter(
      (id) => !selectedQuestions.includes(id)
    );

    if (toAdd.length === 0 && toRemoveQuestionIds.length === 0) {
      showNotification("Thông báo", "Không có thay đổi nào", "info");
      setSelectingQuestions(false);
      return;
    }

    // REMOVED: Check against questionCount
    // if (selectedQuestions.length !== Number(form.questionCount)) ...

    try {
      // 1. Add new questions
      if (toAdd.length > 0) {
        for (let i = 0; i < toAdd.length; i++) {
          const qId = toAdd[i];
          const payload = {
            quizId: quiz.quizId,
            questionId: qId,
            orderIndex: existingIds.length + i + 1, // approximate order
          };
          await quizQuestionService.add(payload);
        }
      }

      // 2. Remove unselected questions
      if (toRemoveQuestionIds.length > 0) {
        for (let i = 0; i < toRemoveQuestionIds.length; i++) {
          const qId = toRemoveQuestionIds[i];
          const questionObj = questions.find((q) => q.questionId === qId);
          if (questionObj && questionObj.recordId) {
            await quizQuestionService.delete(questionObj.recordId);
          }
        }
      }

      setSelectingQuestions(false);

      // Re-fetch questions to ensure we have the correct recordIds for deletion
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
      showNotification("Lỗi", "Không thể lưu danh sách câu hỏi. Vui lòng thử lại.", "error");
      console.error(err);
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
      setSelectedQuestions((prev) => prev.filter((id) => id !== q.questionId));
      showNotification("Thành công", "Đã xóa câu hỏi khỏi quiz", "success");
    } catch (err) {
      showNotification("Lỗi", "Không thể xóa câu hỏi", "error");
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
            {/* Delete button removed as per request. Use 'Select Questions' to uncheck/remove. */}
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

        <div className="lqz-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Search Bar & Filter */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
            />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd", minWidth: "120px" }}
            >
              <option value="">Tất cả danh mục</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="lqz-questions-container" style={{ flex: 1, overflowY: 'auto', minHeight: '200px' }}>
            {loadingModal ? (
              <p>Đang tải...</p>
            ) : (
              modalQuestions.map((q) => {
                // Use fetched properties directly
                const qId = q.id ?? q.questionId;
                const qText = q.questionText ?? q.question_text ?? q.title;
                const qCategory = q.category;

                const isOriginallyIn = questions.some((item) => item.questionId === qId);
                const isSelected = selectedQuestions.includes(qId);

                let statusClass = "";
                let statusLabel = "";

                if (isOriginallyIn && isSelected) {
                  statusClass = "lqz-kept";
                  statusLabel = "(Đã có)";
                } else if (isOriginallyIn && !isSelected) {
                  statusClass = "lqz-pending-remove";
                  statusLabel = "(Sẽ Xóa)";
                } else if (!isOriginallyIn && isSelected) {
                  statusClass = "lqz-pending-add";
                  statusLabel = "(Mới)";
                }

                return (
                  <div
                    key={`modal-all-question-${qId}`}
                    className={`lqz-select-item ${statusClass}`}
                  >
                    <label>
                      <input
                        type="checkbox"
                        className="lqz-checkbox"
                        checked={isSelected}
                        onChange={() =>
                          setSelectedQuestions((prev) =>
                            prev.includes(qId)
                              ? prev.filter((id) => id !== qId)
                              : [...prev, qId]
                          )
                        }
                      />
                      <span className="lqz-select-text">
                        {qText} - <i>{qCategory}</i>
                      </span>
                      {statusLabel && <span className="lqz-select-status">{statusLabel}</span>}
                    </label>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", padding: '10px 0', borderTop: '1px solid #eee' }}>
            <div style={{ fontSize: "14px", color: "#666" }}>
              Đã chọn: <b>{selectedQuestions.length}</b> câu
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="lqz-btn-secondary"
                style={{ padding: "5px 10px" }}
              >
                &lt; Trước
              </button>
              <span>Trang {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="lqz-btn-secondary"
                style={{ padding: "5px 10px" }}
              >
                Sau &gt;
              </button>
            </div>
          </div>

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
          <div className="lqz-content">
            {/* Hàng 1: Tiêu đề và Actions */}
            <div className="lqz-top-row">
              <h2 className="lqz-title">{form.title}</h2>

              <div className="lqz-actions">
                {/* Nút Chọn câu hỏi */}
                <button
                  className="lqz-btn lqz-btn-secondary"
                  onClick={() => setSelectingQuestions(true)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                  Chọn câu hỏi
                </button>

                {/* Nút Sửa Quiz */}
                <button
                  className="lqz-btn lqz-btn-primary"
                  onClick={() => setEditing(true)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Sửa quiz
                </button>
              </div>
            </div>

            {/* Hàng 2: Các chỉ số (Metadata) */}
            <div className="lqz-meta-row">
              {/* Số câu hỏi (Calculated) */}
              <div className="lqz-info">
                <span className="lqz-label">Số câu hỏi:</span>
                <span className="lqz-value">{questions.length}</span>
              </div>

              {/* Điểm tối đa */}
              <div className="lqz-info">
                <span className="lqz-label">Điểm tối đa:</span>
                <span className="lqz-value">{form.maxScore}</span>
              </div>

              {/* Điểm đạt */}
              <div className="lqz-info">
                <span className="lqz-label">Điểm đạt:</span>
                <span className="lqz-value highlight">{form.passingScore}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lqz-questions">
          <h4 className="lqz-subtitle">Câu hỏi trong quiz:</h4>
          {renderQuestionList()}
        </div>

        {selectingQuestions && renderSelectModal()}

        <NotificationModal
          isOpen={notification.isOpen}
          onClose={closeNotification}
          title={notification.title}
          message={notification.message}
          type={notification.type}
        />
      </div>
    );
  }

  // ==============================
  //          EDIT MODE
  // ==============================
  return (
    <div className="lqz-wrapper">
      <h3 className="lqz-title">Sửa Quiz</h3>

      {["title", "passingScore"].map((field) => (
        <div key={field} className="lqz-form-row">
          <label className="lqz-label">
            {field === "title"
              ? "Tiêu đề:"
              : "Điểm đạt (5-10):"}
          </label>
          <input
            className="lqz-input"
            type={field === "title" ? "text" : "number"}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            required
            autoFocus={field === "title"}
          />
        </div>
      ))}

      <button className="lqz-btn" onClick={handleSave}>
        Lưu
      </button>
      <button className="lqz-btn-secondary" onClick={() => setEditing(false)}>
        Hủy
      </button>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
