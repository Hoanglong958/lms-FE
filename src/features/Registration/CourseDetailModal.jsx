import React, { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { courseService } from "@utils/courseService";
import { SERVER_URL } from "@config";

export default function CourseDetailModal({ courseId, open, onClose }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !courseId) { setCourse(null); return; }
    let cancelled = false;
    setLoading(true);
    courseService
      .getCourseDetail(courseId)
      .then((res) => { if (!cancelled) setCourse(res.data?.data || res.data || null); })
      .catch(() => { if (!cancelled) setCourse(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [courseId, open]);

  const formatCurrency = (value) =>
    value == null ? "0 VNĐ" : new Intl.NumberFormat("vi-VN").format(value) + " VNĐ";

  const formatDate = (value) =>
    !value ? "Chưa có" : new Date(value).toLocaleString("vi-VN");

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return "https://placehold.co/680x220?text=No+Image";
    return imageUrl.startsWith("http") ? imageUrl : `${SERVER_URL}${imageUrl}`;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      destroyOnHidden
      centered
      closable
      styles={{ body: { padding: 0 }, content: { borderRadius: 16, overflow: "hidden", padding: 0 } }}
      title={null}
    >
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
          <Spin size="large" />
        </div>
      ) : course ? (
        <div>
          {/* ── Ảnh bìa ── */}
          <div style={{ position: "relative", height: 220, background: "#f0f0ee", overflow: "hidden" }}>
            <img
              src={getImageSrc(course.imageUrl)}
              alt={course.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                padding: "4px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                background: course.isActive ? "#0F6E56" : "#5F5E5A",
                color: course.isActive ? "#E1F5EE" : "#F1EFE8",
              }}
            >
              {course.isActive ? "Đang mở" : "Đã ẩn"}
            </div>
          </div>

          {/* ── Nội dung ── */}
          <div style={{ padding: "1.5rem 1.75rem 1.75rem" }}>
            {/* Eyebrow */}
            <p style={{ fontSize: 11, fontWeight: 500, color: "#888780", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
              {[course.level, course.totalSessions && `${course.totalSessions} buổi`]
                .filter(Boolean)
                .join(" · ") || "Chưa xác định"}
            </p>

            {/* Tiêu đề */}
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px", lineHeight: 1.3, color: "inherit" }}>
              {course.title}
            </h2>

            {/* Mô tả */}
            <p style={{ fontSize: 14, color: "#888780", lineHeight: 1.65, margin: "0 0 1.5rem" }}>
              {course.description || "Không có mô tả."}
            </p>

            {/* Meta grid */}
            <div
              style={{
                borderTop: "0.5px solid rgba(0,0,0,0.1)",
                paddingTop: "1.25rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              {[
                { label: "Học phí", value: formatCurrency(course.tuitionFee), highlight: true },
                { label: "Số buổi học", value: `${course.totalSessions || 0} buổi`, highlight: true },
                { label: "Ngày tạo", value: formatDate(course.createdAt) },
                { label: "Cập nhật lần cuối", value: formatDate(course.updatedAt) },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 0",
                    paddingLeft: i % 2 === 1 ? "1.5rem" : 0,
                    borderBottom: i < 2 ? "0.5px solid rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  <p style={{ fontSize: 12, color: "#888780", margin: "0 0 3px" }}>{item.label}</p>
                  <p style={{ fontSize: item.highlight ? 15 : 14, fontWeight: item.highlight ? 600 : 400, margin: 0 }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200, color: "#888780" }}>
          Không thể tải thông tin khóa học.
        </div>
      )}
    </Modal>
  );
}