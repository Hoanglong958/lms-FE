import React, { useEffect, useMemo, useState } from "react";
import "./ExamEditDialog.css";
import { examService } from "@utils/examService.js";

export default function ExamEditDialog({ open, onOpenChange, exam, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    totalQuestions: undefined,
    maxScore: undefined,
    passingScore: undefined,
    durationMinutes: undefined,
    startTime: "",
    endTime: "",
    autoAddQuestions: false,
    questionIds: [],
  });

  // Prefill from exam when open
  useEffect(() => {
    if (open && exam) {
      const toLocalInput = (iso) => {
        if (!iso) return "";
        try {
          const d = new Date(iso);
          const pad = (n) => String(n).padStart(2, "0");
          const yyyy = d.getFullYear();
          const mm = pad(d.getMonth() + 1);
          const dd = pad(d.getDate());
          const hh = pad(d.getHours());
          const mi = pad(d.getMinutes());
          return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
        } catch {
          return "";
        }
      };

      setForm({
        title: exam.title || exam.name || "",
        description: exam.description || "",
        totalQuestions: exam.totalQuestions,
        maxScore: exam.maxScore,
        passingScore: exam.passingScore,
        durationMinutes: exam.durationMinutes ?? exam.duration,
        startTime: toLocalInput(exam.startTime || exam.startAt),
        endTime: toLocalInput(exam.endTime || exam.endAt),
        autoAddQuestions: false,
        questionIds: Array.isArray(exam.questions) ? exam.questions.map((q) => q.id) : [],
      });
      setSubmitting(false);
      setShowQuestionSelector(false);
    }
    if (!open) {
      // reset when closed
      setSubmitting(false);
      setShowQuestionSelector(false);
    }
  }, [open, exam]);

  const canSubmit = useMemo(() => {
    return (
      form.title?.trim() &&
      Number(form.totalQuestions) > 0 &&
      Number(form.durationMinutes) > 0 &&
      Number(form.maxScore) > 0 &&
      Number(form.passingScore) >= 0 &&
      form.startTime &&
      form.endTime
    );
  }, [form]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
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
      // Chỉ gửi các field hợp lệ cho API
      const overrides = {
        title: form.title?.trim(),
        description: form.description?.trim(),
        totalQuestions: form.totalQuestions !== undefined ? Number(form.totalQuestions) : undefined,
        maxScore: form.maxScore !== undefined ? Number(form.maxScore) : undefined,
        passingScore: form.passingScore !== undefined ? Number(form.passingScore) : undefined,
        durationMinutes:
          form.durationMinutes !== undefined ? Number(form.durationMinutes) : undefined,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
        questionIds: Array.isArray(form.questionIds) ? form.questionIds : undefined,
      };
      // Loại bỏ key undefined/blank
      const payload = Object.fromEntries(
        Object.entries(overrides).filter(([_, v]) => v !== undefined && v !== "")
      );
      const res = await examService.updateExam(exam.id, payload);
      const ok = res?.status >= 200 && res?.status < 300;
      if (!ok) throw new Error("Update exam failed");
      const updated = res?.data?.data || res?.data || null;
      if (onSuccess) onSuccess(updated);
      if (onOpenChange) onOpenChange(false);
    } catch (err) {
      alert("Có lỗi xảy ra khi cập nhật bài kiểm tra");
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
          <section className="examed-section">
            <h3 className="examed-section-title">Thông tin cơ bản</h3>
            <div className="examed-field">
              <label htmlFor="title">Tên bài kiểm tra <span className="req">*</span></label>
              <input id="title" name="title" placeholder="Nhập tên bài kiểm tra" value={form.title} onChange={handleChange} />
            </div>
            <div className="examed-field">
              <label htmlFor="description">Mô tả</label>
              <textarea id="description" name="description" rows={3} placeholder="Nhập mô tả" value={form.description} onChange={handleChange} />
            </div>
          </section>

          <section className="examed-section">
            <h3 className="examed-section-title">Cấu hình bài thi</h3>
            <div className="examed-grid2">
              <div className="examed-field">
                <label htmlFor="totalQuestions">Số câu hỏi <span className="req">*</span></label>
                <input id="totalQuestions" name="totalQuestions" type="number" min={1} value={form.totalQuestions} onChange={handleChange} />
              </div>
              <div className="examed-field">
                <label htmlFor="durationMinutes">Thời gian (phút) <span className="req">*</span></label>
                <input id="durationMinutes" name="durationMinutes" type="number" min={1} value={form.durationMinutes} onChange={handleChange} />
              </div>
              <div className="examed-field">
                <label htmlFor="maxScore">Điểm tối đa <span className="req">*</span></label>
                <input id="maxScore" name="maxScore" type="number" min={1} value={form.maxScore} onChange={handleChange} />
              </div>
              <div className="examed-field">
                <label htmlFor="passingScore">Điểm đạt <span className="req">*</span></label>
                <input id="passingScore" name="passingScore" type="number" min={0} value={form.passingScore} onChange={handleChange} />
              </div>
            </div>
          </section>

          <section className="examed-section">
            <h3 className="examed-section-title">Thời gian thi</h3>
            <div className="examed-grid2">
              <div className="examed-field">
                <label htmlFor="startTime">Thời gian bắt đầu <span className="req">*</span></label>
                <input id="startTime" name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} />
              </div>
              <div className="examed-field">
                <label htmlFor="endTime">Thời gian kết thúc <span className="req">*</span></label>
                <input id="endTime" name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} />
              </div>
            </div>
          </section>

          <section className="examed-section">
            <h3 className="examed-section-title">Câu hỏi</h3>
            <div className="examed-switch">
              <label htmlFor="autoAddQuestions">Tự động thêm câu hỏi</label>
              <input id="autoAddQuestions" name="autoAddQuestions" type="checkbox" checked={form.autoAddQuestions} onChange={handleChange} />
            </div>

            {!form.autoAddQuestions && (
              <div className="examed-questionpicker">
                <button type="button" className="btn-outline" onClick={() => setShowQuestionSelector(true)}>
                  Chọn câu hỏi từ ngân hàng ({form.questionIds.length} câu đã chọn)
                </button>
                {form.questionIds.length > 0 && (
                  <div className="examed-info">
                    Đã chọn {form.questionIds.length} câu hỏi: {form.questionIds.join(", ")}
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="examed-footer">
            <button type="button" className="btn-outline" disabled={submitting} onClick={() => onOpenChange && onOpenChange(false)}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || !canSubmit}>
              {submitting ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>

        {showQuestionSelector && !form.autoAddQuestions && (
          <div className="examed-submodal">
            <div className="examed-submodal-card">
              <div className="examed-submodal-head">
                <h4>Chọn câu hỏi</h4>
                <button className="btn-icon" onClick={() => setShowQuestionSelector(false)}>×</button>
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
                        onClick={() => {
                          handleSelectQuestions(
                            active
                              ? form.questionIds.filter((q) => q !== id)
                              : [...form.questionIds, id]
                          );
                        }}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="examed-submodal-foot">
                <button className="btn-outline" onClick={() => setShowQuestionSelector(false)}>Đóng</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
