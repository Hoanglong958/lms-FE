import React, { useEffect, useMemo, useState } from "react";
import "./ExamCreateDialog.css";
import { examService } from "@utils/examService";
import QuestionSelector from "./QuestionSelector";

export default function ExamCreateDialog({ open, onOpenChange, onSuccess }) {
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

  useEffect(() => {
    if (!open) {
      setForm({
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
      setSubmitting(false);
      setShowQuestionSelector(false);
    }
  }, [open]);

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
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };

      const res = await examService.createExam(payload);
      const ok = res?.status >= 200 && res?.status < 300;
      if (!ok) throw new Error("Create exam failed");
      const created = res?.data?.data || res?.data || null;
      if (onSuccess) onSuccess(created);
      if (onOpenChange) onOpenChange(false);
    } catch (err) {
      console.error("Error creating exam:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message = data?.message || data?.error || err.message || "Lỗi không xác định";
      alert(`Tạo bài kiểm tra thất bại! Status: ${status || "n/a"}. Message: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="examdlg-overlay" role="dialog" aria-modal="true">
      <div className="examdlg-container">
        <div className="examdlg-header">
          <h2 className="examdlg-title">Tạo bài kiểm tra mới</h2>
          <p className="examdlg-desc">Điền thông tin để tạo bài kiểm tra mới cho hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="examdlg-form">
          <section className="examdlg-section">
            <h3 className="examdlg-section-title">Thông tin cơ bản</h3>
            <div className="examdlg-field">
              <label htmlFor="title">Tên bài kiểm tra <span className="req">*</span></label>
              <input id="title" name="title" placeholder="Nhập tên bài kiểm tra" value={form.title} onChange={handleChange} />
            </div>
            <div className="examdlg-field">
              <label htmlFor="description">Mô tả</label>
              <textarea id="description" name="description" rows={3} placeholder="Nhập mô tả" value={form.description} onChange={handleChange} />
            </div>
          </section>

          <section className="examdlg-section">
            <h3 className="examdlg-section-title">Cấu hình bài thi</h3>
            <div className="examdlg-grid2">
              <div className="examdlg-field">
                <label htmlFor="totalQuestions">Số câu hỏi <span className="req">*</span></label>
                <input id="totalQuestions" name="totalQuestions" type="number" min={1} value={form.totalQuestions} onChange={handleChange} />
              </div>
              <div className="examdlg-field">
                <label htmlFor="durationMinutes">Thời gian (phút) <span className="req">*</span></label>
                <input id="durationMinutes" name="durationMinutes" type="number" min={1} value={form.durationMinutes} onChange={handleChange} />
              </div>
              <div className="examdlg-field">
                <label htmlFor="maxScore">Điểm tối đa <span className="req">*</span></label>
                <input id="maxScore" name="maxScore" type="number" min={1} value={form.maxScore} onChange={handleChange} />
              </div>
              <div className="examdlg-field">
                <label htmlFor="passingScore">Điểm đạt <span className="req">*</span></label>
                <input id="passingScore" name="passingScore" type="number" min={0} value={form.passingScore} onChange={handleChange} />
              </div>
            </div>
          </section>

          <section className="examdlg-section">
            <h3 className="examdlg-section-title">Thời gian thi</h3>
            <div className="examdlg-grid2">
              <div className="examdlg-field">
                <label htmlFor="startTime">Thời gian bắt đầu <span className="req">*</span></label>
                <input id="startTime" name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} />
              </div>
              <div className="examdlg-field">
                <label htmlFor="endTime">Thời gian kết thúc <span className="req">*</span></label>
                <input id="endTime" name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} />
              </div>
            </div>
          </section>

          <section className="examdlg-section">
            <h3 className="examdlg-section-title">Câu hỏi</h3>
            <div className="examdlg-switch">
              <label htmlFor="autoAddQuestions">Tự động thêm câu hỏi</label>
              <input id="autoAddQuestions" name="autoAddQuestions" type="checkbox" checked={form.autoAddQuestions} onChange={handleChange} />
            </div>

            {!form.autoAddQuestions && (
              <div className="examdlg-questionpicker">
                <button type="button" className="btn-outline" onClick={() => setShowQuestionSelector(true)}>
                  Chọn câu hỏi từ ngân hàng ({form.questionIds.length} câu đã chọn)
                </button>
                {form.questionIds.length > 0 && (
                  <div className="examdlg-info">
                    Đã chọn {form.questionIds.length} câu hỏi: {form.questionIds.join(", ")}
                  </div>
                )}
              </div>
            )}
          </section>

          <div className="examdlg-footer">
            <button type="button" className="btn-outline" disabled={submitting} onClick={() => onOpenChange && onOpenChange(false)}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || !canSubmit}>
              {submitting ? "Đang tạo..." : "Tạo bài kiểm tra"}
            </button>
          </div>
        </form>

        {!form.autoAddQuestions && (
          <QuestionSelector
            open={showQuestionSelector}
            onOpenChange={setShowQuestionSelector}
            selectedQuestions={form.questionIds}
            onSelectQuestions={(ids) => setForm((prev) => ({ ...prev, questionIds: ids }))}
          />
        )}
      </div>
    </div>
  );
}
