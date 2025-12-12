import React, { useEffect, useMemo, useState } from "react";
import "./ExamEditDialog.css";
import { examService } from "@utils/examService.js";
import NotificationModal from "@components/NotificationModal/NotificationModal";

export default function ExamEditDialog({ open, onOpenChange, exam, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    totalQuestions: 0,
    maxScore: 0,
    passingScore: 0,
    durationMinutes: 0,
    startTime: "",
    endTime: "",
    autoAddQuestions: false,
    questionIds: [],
  });

  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  // Prefill when dialog opens
  useEffect(() => {
    if (open && exam) {
      const toLocalInput = (iso) => {
        if (!iso) return "";
        try {
          const d = new Date(iso);
          const pad = (n) => String(n).padStart(2, "0");
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
            d.getHours()
          )}:${pad(d.getMinutes())}`;
        } catch {
          return "";
        }
      };

      setForm({
        title: exam.title || exam.name || "",
        description: exam.description || "",
        totalQuestions: Number(exam.totalQuestions || 0),
        maxScore: Number(exam.maxScore || 0),
        passingScore: Number(exam.passingScore || 0),
        durationMinutes: Number(exam.durationMinutes ?? exam.duration ?? 0),
        startTime: toLocalInput(exam.startTime || exam.startAt),
        endTime: toLocalInput(exam.endTime || exam.endAt),
        autoAddQuestions: false,
        questionIds: Array.isArray(exam.questions)
          ? exam.questions.map((q) => q.id)
          : [],
      });

      setSubmitting(false);
      setShowQuestionSelector(false);
    }

    if (!open) {
      setSubmitting(false);
      setShowQuestionSelector(false);
    }
  }, [open, exam]);

  const canSubmit = useMemo(() => {
    return (
      form.title.trim() &&
      form.totalQuestions > 0 &&
      form.durationMinutes > 0 &&
      form.maxScore > 0 &&
      form.passingScore >= 0 &&
      form.startTime &&
      form.endTime
    );
  }, [form]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value ?? "",
    }));
  };

  const handleSelectQuestions = (ids) => {
    setForm((prev) => ({ ...prev, questionIds: ids }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting || !exam?.id) return;

    try {
      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        totalQuestions: form.totalQuestions,
        maxScore: form.maxScore,
        passingScore: form.passingScore,
        durationMinutes: form.durationMinutes,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
        questionIds: form.questionIds,
      };

      const res = await examService.updateExam(exam.id, payload);
      const ok = res?.status >= 200 && res?.status < 300;

      if (!ok) throw new Error("Update exam failed");

      if (onSuccess) onSuccess(res.data?.data || res.data);
      if (onOpenChange) onOpenChange(false);
    } catch (err) {
      showNotification("Lỗi", "Có lỗi xảy ra khi cập nhật bài kiểm tra", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="examed-overlay" role="dialog" aria-modal="true">
      <div className="examed-container">
        <div className="examed-header">
          <h2 className="examed-title">Chỉnh sửa bài kiểm tra</h2>
          <p className="examed-desc">Cập nhật thông tin bài kiểm tra</p>
        </div>

        <form onSubmit={handleSubmit} className="examed-form">
          {/* ----- BASIC INFO ----- */}
          <section className="examed-section">
            <h3 className="examed-section-title">Thông tin cơ bản</h3>

            <div className="examed-field">
              <label htmlFor="title">
                Tên bài kiểm tra <span className="req">*</span>
              </label>
              <input
                id="title"
                name="title"
                placeholder="Nhập tên bài kiểm tra"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="examed-field">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* ----- EXAM CONFIG ----- */}
          <section className="examed-section">
            <h3 className="examed-section-title">Cấu hình bài thi</h3>

            <div className="examed-grid2">
              <div className="examed-field">
                <label>
                  Số câu hỏi <span className="req">*</span>
                </label>
                <input
                  name="totalQuestions"
                  type="number"
                  min={1}
                  value={form.totalQuestions}
                  onChange={handleChange}
                />
              </div>

              <div className="examed-field">
                <label>
                  Thời gian (phút) <span className="req">*</span>
                </label>
                <input
                  name="durationMinutes"
                  type="number"
                  min={1}
                  value={form.durationMinutes}
                  onChange={handleChange}
                />
              </div>

              <div className="examed-field">
                <label>
                  Điểm tối đa <span className="req">*</span>
                </label>
                <input
                  name="maxScore"
                  type="number"
                  min={1}
                  value={form.maxScore}
                  onChange={handleChange}
                />
              </div>

              <div className="examed-field">
                <label>
                  Điểm đạt <span className="req">*</span>
                </label>
                <input
                  name="passingScore"
                  type="number"
                  min={0}
                  value={form.passingScore}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* ----- TIME ----- */}
          <section className="examed-section">
            <h3 className="examed-section-title">Thời gian thi</h3>

            <div className="examed-grid2">
              <div className="examed-field">
                <label>
                  Thời gian bắt đầu <span className="req">*</span>
                </label>
                <input
                  name="startTime"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={handleChange}
                />
              </div>

              <div className="examed-field">
                <label>
                  Thời gian kết thúc <span className="req">*</span>
                </label>
                <input
                  name="endTime"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* ----- QUESTION PICKER ----- */}
          <section className="examed-section">
            <h3 className="examed-section-title">Câu hỏi</h3>

            <div className="examed-switch">
              <label htmlFor="autoAddQuestions">Tự động thêm câu hỏi</label>
              <input
                id="autoAddQuestions"
                name="autoAddQuestions"
                type="checkbox"
                checked={form.autoAddQuestions}
                onChange={handleChange}
              />
            </div>

            {!form.autoAddQuestions && (
              <div className="examed-questionpicker">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowQuestionSelector(true)}
                >
                  Chọn câu hỏi ({form.questionIds.length} câu đã chọn)
                </button>

                {form.questionIds.length > 0 && (
                  <div className="examed-info">
                    {form.questionIds.length} câu hỏi:{" "}
                    {form.questionIds.join(", ")}
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="examed-footer">
            <button
              type="button"
              className="btn-outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={!canSubmit || submitting}
            >
              {submitting ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>

        {showQuestionSelector && !form.autoAddQuestions && (
          <div className="examed-submodal">
            <div className="examed-submodal-card">
              <div className="examed-submodal-head">
                <h4>Chọn câu hỏi</h4>
                <button
                  className="btn-icon"
                  onClick={() => setShowQuestionSelector(false)}
                >
                  ×
                </button>
              </div>

              <div className="examed-submodal-body">
                <p>Danh sách ID mẫu (1..20). Chọn để thêm/bỏ.</p>

                <div className="examed-ids">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const id = i + 1;
                    const active = form.questionIds.includes(id);

                    return (
                      <button
                        key={id}
                        type="button"
                        className={"tag " + (active ? "active" : "")}
                        onClick={() =>
                          active
                            ? handleSelectQuestions(
                              form.questionIds.filter((q) => q !== id)
                            )
                            : handleSelectQuestions([...form.questionIds, id])
                        }
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="examed-submodal-foot">
                <button
                  className="btn-outline"
                  onClick={() => setShowQuestionSelector(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
