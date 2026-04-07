import React, { useEffect, useMemo, useState } from "react";
import { studentSuccessAnalyticsService } from "@shared/utils/studentSuccessAnalyticsService";
import "./StudentSuccessPanel.css";

export default function StudentSuccessPanel({
  classId: propClassId,
  classOptions = [],
  onClassChange,
  showClassSelector = false,
}) {
  const [selectedClassId, setSelectedClassId] = useState(propClassId);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState(classOptions);

  useEffect(() => {
    if (showClassSelector && classes.length === 0) {
      studentSuccessAnalyticsService
        .getAccessibleClasses()
        .then((res) => {
          const payload = Array.isArray(res?.data)
            ? res.data
            : res?.data?.content || [];
          setClasses(
            payload.map((cls) => ({
              id: cls.id,
              label: cls.className || `Lớp ${cls.id}`,
            }))
          );
        })
        .catch(() => setClasses([]));
    }
  }, [showClassSelector, classes.length]);

  useEffect(() => {
    if (propClassId) {
      setSelectedClassId(propClassId);
    }
  }, [propClassId]);

  useEffect(() => {
    if (!selectedClassId) {
      setAnalytics(null);
      return;
    }
    setLoading(true);
    setError("");
    studentSuccessAnalyticsService
      .getClassAnalytics(selectedClassId)
      .then((res) => setAnalytics(res?.data))
      .catch((err) =>
        setError(err?.response?.data?.message || "Không thể tải dữ liệu phân tích")
      )
      .finally(() => setLoading(false));
  }, [selectedClassId]);

  const handleClassChange = (event) => {
    const value = Number(event.target.value) || null;
    setSelectedClassId(value);
    onClassChange?.(value);
  };

  const headerLabel = useMemo(() => {
    if (analytics?.className) {
      return `Lớp ${analytics.className}`;
    }
    return "Student Success Analytics";
  }, [analytics]);

  const renderStat = (label, value, suffix = "%") => (
    <div className="ssa-stat-card">
      <p className="ssa-stat-label">{label}</p>
      <p className="ssa-stat-value">
        {typeof value === "number" ? value.toFixed(1) : value}
        {value !== null && value !== undefined && suffix}
      </p>
    </div>
  );

  const formatPercent = (value) =>
    typeof value === "number" ? value.toFixed(1) : "0.0";

  const correlationMetrics = useMemo(() => {
    if (!analytics) return [];
    const format = (value) => (typeof value === "number" ? value.toFixed(2) : "0.00");
    return [
      {
        key: "attendance-progress",
        label: "Điểm danh ⇄ Tiến độ",
        value: format(analytics.attendanceProgressCorrelation),
      },
      {
        key: "attendance-score",
        label: "Điểm danh ⇄ Điểm số",
        value: format(analytics.attendanceScoreCorrelation),
      },
      {
        key: "progress-score",
        label: "Tiến độ ⇄ Điểm số",
        value: format(analytics.progressScoreCorrelation),
      },
    ];
  }, [analytics]);

  const riskStudents = analytics?.atRiskStudents || [];
  const lessonMastery = analytics?.masteryByLessonType || [];
  const skillMastery = analytics?.masteryBySkill || [];
  const teacherWorkloads = analytics?.teacherWorkloads || [];

  return (
    <div className="ssa-panel">
      <div className="ssa-panel-header">
        <div>
          <h3>{headerLabel}</h3>
          <p className="ssa-subtitle">Cảnh báo học viên, năng lực kỹ năng và tải giảng dạy</p>
        </div>
        {showClassSelector && (
          <select
            className="ssa-class-select"
            value={selectedClassId || ""}
            onChange={handleClassChange}
          >
            <option value="">Chọn lớp</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="ssa-error">{error}</p>}

      {!selectedClassId && !loading && (
        <p className="ssa-placeholder">Hãy chọn lớp để xem analytics.</p>
      )}

      {loading && <p className="ssa-placeholder">Đang tải số liệu...</p>}

      {!loading && analytics && (
        <>
          <div className="ssa-stat-grid">
            {renderStat("Tỷ lệ điểm danh", analytics.averageAttendanceRate * 100, "%")}
            {renderStat("Tiến độ khóa học", analytics.averageProgressPercent, "%")}
            {renderStat("Điểm trung bình", analytics.averageScorePercent, "%")}
          </div>

          <div className="ssa-correlation-group">
            <h4>Độ tương quan</h4>
            <div className="ssa-correlation-grid">
              {correlationMetrics.map((metric) => (
                <div key={metric.key} className="ssa-correlation-card">
                  <p>{metric.label}</p>
                  <p className="ssa-correlation-value">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ssa-grid">
            <section>
              <h4>Học viên có nguy cơ</h4>
              <ul>
                {riskStudents.length === 0 && <li>Không tìm thấy cảnh báo.</li>}
                {riskStudents.map((student) => (
                  <li key={student.studentId}>
                    <div className="ssa-risk-header">
                      <span className="ssa-risk-name">{student.studentName}</span>
                      <span className="ssa-risk-score">
                        {formatPercent(student.attendanceRate)} · {formatPercent(student.progressPercent)} · {formatPercent(student.scorePercent)}
                      </span>
                    </div>
                    <p className="ssa-risk-reason">{student.riskFactors}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4>Mastery theo loại</h4>
              <div className="ssa-mastery-list">
                {lessonMastery.map((item) => (
                  <div key={item.lessonType} className="ssa-mastery-item">
                    <p>{item.lessonType}</p>
                    <div className="ssa-progress-bar">
                      <div style={{ width: `${Math.min(item.averageProgressPercent, 100)}%` }} />
                    </div>
                    <small>{item.averageProgressPercent.toFixed(1)}%</small>
                  </div>
                ))}
                {lessonMastery.length === 0 && <p className="ssa-placeholder">Chưa có dữ liệu mastery theo loại.</p>}
              </div>
            </section>

            {/* <section>
              <h4>Mastery theo kỹ năng / chuẩn đầu ra</h4>
              {skillMastery.length === 0 ? (
                <p className="ssa-placeholder">Chưa có dữ liệu kỹ năng.</p>
              ) : (
                <div className="ssa-skill-mastery-list">
                  {skillMastery.map((skill) => (
                    <div key={skill.skillName} className="ssa-skill-mastery-item">
                      <div>
                        <p>{skill.skillName}</p>
                        <small>{skill.studentCount} lượt đánh giá</small>
                      </div>
                      <div className="ssa-progress-bar">
                        <div style={{ width: `${Math.min(skill.averageProgressPercent, 100)}%` }} />
                      </div>
                      <span>{skill.averageProgressPercent.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </section> */}

            <section>
              <h4>Tải giảng dạy</h4>
              <ul>
                {teacherWorkloads.map((teacher) => (
                  <li key={teacher.teacherId}>
                    <div className="ssa-risk-header">
                      <span className="ssa-risk-name">{teacher.teacherName}</span>
                      <span className="ssa-risk-score">{teacher.classCount} lớp</span>
                    </div>
                    <p className="ssa-risk-reason">
                      Sinh viên: {teacher.activeStudents} • Buổi tới 7 ngày: {teacher.upcomingSessionsNext7Days}
                    </p>
                  </li>
                ))}
                {teacherWorkloads.length === 0 && (
                  <li>
                    <p className="ssa-placeholder">Chưa có dữ liệu tải giảng dạy.</p>
                  </li>
                )}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
