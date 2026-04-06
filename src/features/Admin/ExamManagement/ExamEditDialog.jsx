import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./styles/ExamEditDialog.css";
import { examService } from "@utils/examService.js";
import { courseService } from "@utils/courseService";
import { classService } from "@utils/classService";
import { classCourseService } from "@utils/classCourseService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import QuestionSelector from "./QuestionSelector";
import SearchableSelect from "@shared/components/SearchableSelect";

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
    courseId: "",
    classId: "",
  });

  const [defaultCourses, setDefaultCourses] = useState([]);
  const [classCourseOptions, setClassCourseOptions] = useState([]);
  const [classCourseLoading, setClassCourseLoading] = useState(false);
  const [classCourseError, setClassCourseError] = useState("");
  const [selectedClassLabel, setSelectedClassLabel] = useState("");
  const [selectedCourseLabel, setSelectedCourseLabel] = useState("");
  const getClassLabel = useCallback(
    (item) =>
      item?.className ||
      item?.name ||
      item?.title ||
      item?.class_title ||
      "",
    []
  );
  const getClassOptionValue = useCallback(
    (item) => String(item?.id ?? item?.classId ?? item?.uid ?? ""),
    []
  );
  const fetchClassOptions = useCallback(async (query) => {
    const params = { page: 0, size: 12 };
    if (query?.trim()) params.q = query.trim();
    try {
      const res = await classService.getClasses(params);
      const raw = res.data?.data ?? res.data;
      if (Array.isArray(raw)) return raw;
      const list = raw?.content ?? raw?.data ?? [];
      return Array.isArray(list) ? list : [];
    } catch (err) {
      console.error("Class search failed", err);
      return [];
    }
  }, []);
  const getCourseLabel = useCallback(
    (item) =>
      item?.title ||
      item?.courseTitle ||
      item?.courseName ||
      "",
    []
  );
  const getCourseOptionValue = useCallback(
    (item) => String(item?.id ?? item?.courseId ?? item?.course?.id ?? ""),
    []
  );
  const filterClassCourseOptions = useCallback(
    async (query) => {
      const normalized = (query || "").trim().toLowerCase();
      const list = Array.isArray(classCourseOptions) ? classCourseOptions : [];
      if (!normalized) return list;
      return list.filter((item) =>
        getCourseLabel(item).toLowerCase().includes(normalized)
      );
    },
    [classCourseOptions, getCourseLabel]
  );

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
        courseId: exam.courseId ? String(exam.courseId) : "",
        classId: exam.classId ? String(exam.classId) : "",
      });

      setSubmitting(false);
      setShowQuestionSelector(false);

      // Fetch
      courseService.getCourses().then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const mapped = data.map((course) => ({
          id: String(course.id ?? course.courseId ?? ""),
          title: course.title || course.name || course.courseName || "Khóa học",
        }));
        setDefaultCourses(mapped);
      });
    }

    if (!open) {
      setSubmitting(false);
      setShowQuestionSelector(false);
    }
  }, [open, exam]);

  useEffect(() => {
    if (!open) {
      setClassCourseOptions([]);
      setClassCourseLoading(false);
      setClassCourseError("");
      setSelectedClassLabel("");
      setSelectedCourseLabel("");
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

  useEffect(() => {
    if (!form.classId) {
      setSelectedClassLabel("");
      return;
    }
    let active = true;
    classService
      .getClassDetail(form.classId)
      .then((res) => {
        if (!active) return;
        const data = res.data?.data || res.data;
        setSelectedClassLabel(
          getClassLabel(data) || `Lớp ${form.classId}`
        );
      })
      .catch(() => {
        if (active) setSelectedClassLabel("");
      });
    return () => {
      active = false;
    };
  }, [form.classId, getClassLabel]);

  useEffect(() => {
    if (!form.courseId) {
      setSelectedCourseLabel("");
      return;
    }
    let active = true;
    courseService
      .getCourseDetail(form.courseId)
      .then((res) => {
        if (!active) return;
        const data = res.data?.data || res.data;
        setSelectedCourseLabel(getCourseLabel(data));
      })
      .catch(() => {
        if (active) setSelectedCourseLabel("");
      });
    return () => {
      active = false;
    };
  }, [form.courseId, getCourseLabel]);

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
        autoAddQuestions: !!form.autoAddQuestions,
        questionIds: Array.isArray(form.questionIds) ? form.questionIds.map((n) => Number(n)) : [],
        courseId: form.courseId ? Number(form.courseId) : null,
        classId: form.classId ? Number(form.classId) : null,
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

            <div className="examed-grid2">
              <div className="examed-field">
                <label htmlFor="courseId">Gắn vào khóa học</label>
                <SearchableSelect
                  value={form.courseId}
                  displayValue={selectedCourseLabel}
                  placeholder="Nhập tên khóa học..."
                  disabled={!form.classId || classCourseLoading || classCourseOptions.length === 0}
                  onOptionSelect={(option) => {
                    if (option) {
                      const nextCourseId = getCourseOptionValue(option);
                      setForm((prev) => ({
                        ...prev,
                        courseId: nextCourseId,
                      }));
                      setSelectedCourseLabel(getCourseLabel(option));
                    } else {
                      setForm((prev) => ({ ...prev, courseId: "" }));
                      setSelectedCourseLabel("");
                    }
                  }}
                  fetchOptions={filterClassCourseOptions}
                  getOptionLabel={getCourseLabel}
                  getOptionValue={getCourseOptionValue}
                  noOptionsText="Không tìm thấy khóa học"
                />
                {!form.classId && (
                  <div className="examed-note">
                    Chọn lớp học trước khi chọn khóa học để tránh gán nhầm.
                  </div>
                )}
                {form.classId && classCourseLoading && (
                  <div className="examed-note">Đang tải khóa học của lớp...</div>
                )}
                {form.classId && !classCourseLoading && classCourseError && (
                  <div className="examed-note">{classCourseError}</div>
                )}
              </div>
              <div className="examed-field">
                <label htmlFor="classId">Gắn vào lớp học</label>
                <SearchableSelect
                  value={form.classId}
                  displayValue={selectedClassLabel}
                  placeholder="Nhập tên lớp học..."
                  onOptionSelect={(option) => {
                    if (option) {
                      const nextClassId = getClassOptionValue(option);
                      setForm((prev) => ({
                        ...prev,
                        classId: nextClassId,
                        courseId: "",
                      }));
                      setSelectedClassLabel(getClassLabel(option));
                      setSelectedCourseLabel("");
                    } else {
                      setForm((prev) => ({
                        ...prev,
                        classId: "",
                        courseId: "",
                      }));
                      setSelectedClassLabel("");
                      setSelectedCourseLabel("");
                    }
                  }}
                  fetchOptions={fetchClassOptions}
                  getOptionLabel={getClassLabel}
                  getOptionValue={getClassOptionValue}
                  noOptionsText="Không tìm thấy lớp học"
                />
              </div>
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
          <QuestionSelector
            open={showQuestionSelector}
            onOpenChange={setShowQuestionSelector}
            selectedQuestions={form.questionIds}
            onSelectQuestions={handleSelectQuestions}
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
