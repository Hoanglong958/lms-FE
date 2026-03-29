import React, { useEffect, useMemo, useState } from "react";
import "./styles/ExamCreateDialog.css";
import { examService } from "@utils/examService";
import { courseService } from "@utils/courseService";
import { classService } from "@utils/classService";
import { classCourseService } from "@utils/classCourseService";
import QuestionSelector from "./QuestionSelector";
import NotificationModal from "@components/NotificationModal/NotificationModal";

export default function ExamCreateDialog({ open, onOpenChange, onSuccess, defaultCourseId, defaultClassId }) {
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
    courseId: "",
    classId: "",
  });

  const [defaultCourses, setDefaultCourses] = useState([]);
  const [classCourseOptions, setClassCourseOptions] = useState([]);
  const [classCourseLoading, setClassCourseLoading] = useState(false);
  const [classCourseError, setClassCourseError] = useState("");
  const [classes, setClasses] = useState([]);

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
    if (open) {
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
        courseId: defaultCourseId || "",
        classId: defaultClassId || "",
      });
      setSubmitting(false);
      setShowQuestionSelector(false);

      // Fetch courses/classes
      courseService.getCourses().then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const mapped = data.map((course) => ({
          id: String(course.id ?? course.courseId ?? ""),
          title: course.title || course.name || course.courseName || "Khóa học",
        }));
        setDefaultCourses(mapped);
      });
      classService.getClasses().then(res => {
        setClasses(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setClassCourseOptions([]);
      setClassCourseLoading(false);
      setClassCourseError("");
      return;
    }

    if (!form.classId) {
      setClassCourseOptions(defaultCourses);
      setClassCourseError("");
      setClassCourseLoading(false);
      return;
    }

    let cancelled = false;
    setClassCourseLoading(true);
    setClassCourseError("");

    classCourseService
      .getClassCourses(form.classId)
      .then((res) => {
        if (cancelled) return;
        const payload = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        const opts = payload
          .map((item) => {
            const id = String(item.courseId ?? item.course?.id ?? item.id ?? "");
            if (!id) return null;
            const title =
              item.courseTitle ||
              item.courseName ||
              item.course?.title ||
              "Khóa học";
            return { id, title };
          })
          .filter(Boolean);
        setClassCourseOptions(opts);
        if (opts.length === 0) {
          setClassCourseError("Lớp này chưa gán khóa học nào");
        }
        setForm((prev) => ({
          ...prev,
          courseId: opts.some((opt) => opt?.id === String(prev.courseId))
            ? prev.courseId
            : "",
        }));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load class courses", err);
        setClassCourseError("Không thể tải khóa học của lớp");
        setClassCourseOptions([]);
      })
      .finally(() => {
        if (!cancelled) setClassCourseLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.classId, defaultCourses, open]);

  const canSubmit = useMemo(() => {
    const baseOk =
      form.title?.trim() &&
      Number(form.durationMinutes) > 0 &&
      Number(form.maxScore) >= 0 &&
      Number(form.passingScore) >= 0 &&
      form.startTime &&
      form.endTime;
    const questionsOk = form.autoAddQuestions
      ? Number(form.totalQuestions) > 0
      : Array.isArray(form.questionIds) && form.questionIds.length > 0;
    return baseOk && questionsOk;
  }, [form]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      const start = new Date(form.startTime).getTime();
      const end = new Date(form.endTime).getTime();
      if (!(start > 0 && end > 0) || end <= start) {
        alert("Thời gian kết thúc phải sau thời gian bắt đầu");
        setSubmitting(false);
        return;
      }
      if (start < Date.now() - 60000) {
        alert("Thời gian bắt đầu phải là hiện tại hoặc tương lai");
        setSubmitting(false);
        return;
      }
      if (Number(form.passingScore) > Number(form.maxScore)) {
        alert("Điểm đạt không được lớn hơn điểm tối đa");
        setSubmitting(false);
        return;
      }

      const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

      const qids = Array.isArray(form.questionIds) ? form.questionIds.map((id) => Number(id)).filter((n) => Number.isFinite(n)) : [];
      const tq = form.autoAddQuestions ? Number(form.totalQuestions) || 0 : qids.length;
      const ps = Number(form.passingScore) || 0;

      const basePayload = {
        title: form.title.trim(),
        description: (form.description?.trim() || form.title.trim()),
        totalQuestions: tq,
        maxScore: Number(form.maxScore) || 0,
        passingScore: ps,
        durationMinutes: Number(form.durationMinutes) || 0,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        autoAddQuestions: !!form.autoAddQuestions,
        questionIds: qids,
        courseId: form.courseId ? Number(form.courseId) : null,
        classId: form.classId ? Number(form.classId) : null,
        creatorId: user.id,
      };

      const payload = basePayload;

      const res = await examService.createExam(payload);
      const ok = res?.status >= 200 && res?.status < 300;
      if (!ok) throw new Error("Create exam failed");
      const created = res?.data?.data || res?.data || null;
      if (onSuccess) onSuccess(created);
      if (onOpenChange) onOpenChange(false);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message = data?.message || data?.error || err.message || "Lỗi không xác định";
      try { console.error("Create exam error", data || err, { form }); } catch { void 0; }
      showNotification("Lỗi", `Tạo bài kiểm tra thất bại! Status: ${status || "n/a"}. Message: ${message}`, "error");
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

            <div className="examdlg-grid2">
              <div className="examdlg-field">
                <label htmlFor="courseId">Gắn vào khóa học</label>
                <select
                  id="courseId"
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  disabled={!form.classId || classCourseLoading || classCourseOptions.length === 0}
                >
                  <option value="">
                    {form.classId ? "-- Chọn khóa học --" : "-- Chọn lớp học trước --"}
                  </option>
                  {classCourseOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {!form.classId && (
                  <div className="examdlg-note">
                    Chọn lớp học trước khi chọn khóa học để tránh gán nhầm.
                  </div>
                )}
                {form.classId && classCourseLoading && (
                  <div className="examdlg-note">Đang tải khóa học của lớp...</div>
                )}
                {form.classId && !classCourseLoading && classCourseError && (
                  <div className="examdlg-note">{classCourseError}</div>
                )}
              </div>
              <div className="examdlg-field">
                <label htmlFor="classId">Gắn vào lớp học</label>
                <select id="classId" name="classId" value={form.classId} onChange={handleChange}>
                  <option value="">-- Chọn lớp học --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className}
                    </option>
                  ))}
                </select>
              </div>
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
