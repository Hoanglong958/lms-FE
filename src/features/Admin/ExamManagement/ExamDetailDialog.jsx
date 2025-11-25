import React, { useEffect, useState } from "react";
import "./ExamDetailDialog.css";
import { examService } from "@utils/examService.js";

export default function ExamDetailDialog({ open, onOpenChange, exam, examId }) {
  const [examState, setExamState] = useState(null);
  const [loading, setLoading] = useState(false);
  const id = exam?.id ?? examId;

  useEffect(() => {
    if (open && exam) {
      // Prefill ngay dữ liệu có sẵn để hiển thị nhanh
      setExamState(exam);
    }
    if (open && id) {
      loadExamDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id, exam]);

  const loadExamDetail = async () => {
    try {
      setLoading(true);
      const res = await examService.getExamById(id);
      const raw = res?.data;
      const data =
        (raw && (raw.data || raw.item || raw.content)) ?? raw ?? null;
      setExamState(data || null);
    } catch (error) {
      // Fallback: thử lấy từ localStorage nếu có cache
      try {
        const local = JSON.parse(localStorage.getItem("exams") || "[]");
        const found = (Array.isArray(local) ? local : []).find((e) => String(e.id) === String(id));
        if (found) {
          setExamState(found);
          return;
        }
      } catch {}
      alert("Không thể tải chi tiết kỳ thi");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (val) => {
    try {
      const d = new Date(val);
      const pad = (n) => String(n).padStart(2, "0");
      const dd = pad(d.getDate());
      const mm = pad(d.getMonth() + 1);
      const yyyy = d.getFullYear();
      const hh = pad(d.getHours());
      const mi = pad(d.getMinutes());
      return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
    } catch {
      return val;
    }
  };

  const getOptionText = (opt) =>
    typeof opt === "object" && opt !== null && "text" in opt ? opt.text : opt;

  const isOptionCorrect = (q, opt, idx) => {
    // 1) options as objects: { text, correct }
    if (typeof opt === "object" && opt !== null) {
      if (opt.correct === true) return true;
    }
    // 2) correctAnswer: string value equal to option text
    if (q.correctAnswer && getOptionText(opt) === q.correctAnswer) return true;
    // 3) correctAnswerIndex / correctIndex
    const ci =
      typeof q.correctAnswerIndex === "number"
        ? q.correctAnswerIndex
        : typeof q.correctIndex === "number"
        ? q.correctIndex
        : undefined;
    if (typeof ci === "number" && ci === idx) return true;
    // 4) correctOptions: array of indices or strings
    if (Array.isArray(q.correctOptions)) {
      const txt = getOptionText(opt);
      if (
        q.correctOptions.some((c) =>
          typeof c === "number" ? c === idx : c === txt
        )
      )
        return true;
    }
    return false;
  };

  const statusConfig = (status) => {
    const map = {
      UPCOMING: { label: "Sắp diễn ra" },
      ONGOING: { label: "Đang diễn ra" },
      COMPLETED: { label: "Đã kết thúc" },
      CANCELLED: { label: "Đã hủy" },
    };
    return map[status] || { label: status || "" };
  };

  if (!open) return null;

  return (
    <div className="examd-overlay" role="dialog" aria-modal="true">
      <div className="examd-container">
        {loading && !examState ? (
          <div className="examd-loading">
            <div className="spinner"></div>
            <p>Đang tải chi tiết...</p>
          </div>
        ) : examState ? (
          <>
            <div className="examd-header">
              <button
                type="button"
                className="btn-outline"
                onClick={() => onOpenChange && onOpenChange(false)}
                aria-label="Quay lại danh sách"
              >
                ← Quay lại
              </button>
              <div className="examd-title-wrap">
                <h2 className="examd-title">{examState.title}</h2>
                <p className="examd-desc">{examState.description || "Không có mô tả"}</p>
              </div>
              <div className="examd-status">{statusConfig(examState.status).label}</div>
            </div>

            <div className="examd-content">
              {(() => {
                // derive display values
                const questionsCount = Array.isArray(examState.questions)
                  ? examState.questions.length
                  : (typeof examState.totalQuestions === "number" ? examState.totalQuestions : 0);
                const parseDuration = () => {
                  if (typeof examState.durationMinutes === "number") return examState.durationMinutes;
                  if (examState.startTime && examState.endTime) {
                    const st = new Date(examState.startTime).getTime();
                    const et = new Date(examState.endTime).getTime();
                    if (!isNaN(st) && !isNaN(et) && et > st) return Math.round((et - st) / 60000);
                  }
                  if (typeof examState.duration === "string") {
                    const n = parseInt(String(examState.duration).replace(/[^0-9]/g, ""));
                    if (!isNaN(n)) return n;
                  }
                  return 0;
                };
                examState._derived = {
                  questionsCount,
                  durationMinutes: parseDuration(),
                };
                return null;
              })()}
              <section>
                <h3 className="examd-section-title">Thông tin chung</h3>
                <div className="examd-grid2">
                  <div>
                    <div className="examd-label">Mã kỳ thi</div>
                    <div className="examd-text">#{examState.id}</div>
                  </div>
                  <div>
                    <div className="examd-label">Tổng số câu hỏi</div>
                    <div className="examd-text">{examState._derived?.questionsCount ?? examState.totalQuestions ?? 0} câu</div>
                  </div>
                  <div>
                    <div className="examd-label">Thời gian làm bài</div>
                    <div className="examd-text">{examState._derived?.durationMinutes ?? examState.durationMinutes ?? 0} phút</div>
                  </div>
                  <div>
                    <div className="examd-label">Điểm tối đa</div>
                    <div className="examd-text">{examState.maxScore ?? "N/A"} điểm</div>
                  </div>
                  <div>
                    <div className="examd-label">Điểm đạt</div>
                    <div className="examd-text">{examState.passingScore ?? "N/A"} điểm</div>
                  </div>
                  <div>
                    <div className="examd-label">Tỷ lệ đạt yêu cầu</div>
                    <div className="examd-text">
                      {examState.maxScore && examState.passingScore
                        ? `${((examState.passingScore / examState.maxScore) * 100).toFixed(0)}%`
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="examd-section-title">Thời gian thi</h3>
                <div className="examd-grid2">
                  <div>
                    <div className="examd-label">Thời gian bắt đầu</div>
                    <div className="examd-text">{formatDateTime(examState.startTime)}</div>
                  </div>
                  <div>
                    <div className="examd-label">Thời gian kết thúc</div>
                    <div className="examd-text">{formatDateTime(examState.endTime)}</div>
                  </div>
                </div>
              </section>

              {Array.isArray(examState.questions) && examState.questions.length > 0 && (
                <section>
                  <h3 className="examd-section-title">Danh sách câu hỏi ({examState.questions.length} câu)</h3>
                  <div className="examd-questions">
                    {examState.questions.map((q, idx) => (
                      <div key={q.id || idx} className="examd-question">
                        <div className="q-index">{idx + 1}</div>
                        <div className="q-body">
                          <div className="q-head">
                            <span className="q-cat">{q.category}</span>
                            <span className="q-score">{q.score} điểm</span>
                          </div>
                          <div className="q-text">{q.questionText}</div>
                          {Array.isArray(q.options) && q.options.length > 0 && (
                            <div className="q-options">
                              {q.options.map((opt, i) => {
                                const correct = isOptionCorrect(q, opt, i);
                                const text = getOptionText(opt);
                                return (
                                  <div key={i} className={"q-option" + (correct ? " correct" : "")}>
                                    <span className="q-opt-index">{String.fromCharCode(65 + i)}.</span>
                                    {text}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {q.explanation && (
                            <div className="q-explain">
                              <span className="q-explain-label">Giải thích: </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(examState.createdAt || examState.updatedAt) && (
                <section>
                  <h3 className="examd-section-title">Thông tin khác</h3>
                  <div className="examd-grid2 small">
                    {examState.createdAt && (
                      <div>
                        <span className="examd-label">Ngày tạo: </span>
                        {formatDateTime(examState.createdAt)}
                      </div>
                    )}
                    {examState.updatedAt && (
                      <div>
                        <span className="examd-label">Cập nhật lần cuối: </span>
                        {formatDateTime(examState.updatedAt)}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </>
        ) : (
          <div className="examd-empty">Không tìm thấy dữ liệu</div>
        )}
      </div>
    </div>
  );
}
