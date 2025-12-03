import React from "react";
import "../css/TimeSlot.css";

export default function TimeSlot({
  time,
  dayIndex,
  onDrop,
  onDragOver,
  scheduleItem,
  onRemove,
  onResizeStart,
  onDragStart,
  previewPosition,
}) {
  const timeKey = typeof time === "string" ? time : time.key;
  const LESSON_HEIGHT = 45; // Khớp với CSS

  const handleDrop = (e) => {
    e.preventDefault();
    if (onDrop) {
      const data = e.dataTransfer.getData("text/plain");
      try {
        const subject = JSON.parse(data);
        onDrop(dayIndex, time, subject);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (onDragOver) onDragOver(dayIndex, time);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`slot ${scheduleItem ? "hasSchedule" : ""}`}
    >
      {/* --- PREVIEW ITEM --- */}
      {previewPosition && previewPosition.time === timeKey && !scheduleItem && (
        <div
          className="scheduleItem previewItem"
          style={{
            height: `${previewPosition.duration * LESSON_HEIGHT}px`,
          }}
        >
          <div className="scheduleContent">
            <div className="scheduleSubject">{previewPosition.subjectName}</div>
            <div className="scheduleDuration">
              {previewPosition.duration} tiết
            </div>
          </div>
        </div>
      )}

      {/* --- SCHEDULE ITEM CHÍNH THỨC --- */}
      {scheduleItem && scheduleItem.startTime === timeKey && (
        <div
          className="scheduleItem"
          style={{
            height: `${scheduleItem.duration * LESSON_HEIGHT}px`,
            zIndex: 5,
          }}
          draggable
          onDragStart={(e) => {
            if (e.target.closest(".resizeHandle")) {
              e.preventDefault();
              return false;
            }

            // --- TÍNH TOÁN VỊ TRÍ CẦM CHUỘT (OFFSET) ---
            const rect = e.currentTarget.getBoundingClientRect();
            const offsetY = e.clientY - rect.top; // Khoảng cách từ đỉnh thẻ đến chuột
            // Tính ra chuột đang cầm ở tiết thứ mấy (0, 1, 2...)
            const grabOffset = Math.floor(offsetY / LESSON_HEIGHT);

            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData(
              "text/plain",
              JSON.stringify({ type: "schedule", item: scheduleItem })
            );
            e.currentTarget.style.opacity = "0.5";

            // Truyền grabOffset lên cha
            onDragStart &&
              onDragStart({
                dayIndex,
                timeKey,
                item: scheduleItem,
                grabOffset: grabOffset, // <-- Quan trọng
              });
          }}
          onDragEnd={(e) => {
            e.currentTarget.style.opacity = "1";
            onDragStart && onDragStart(null);
          }}
        >
          <div className="scheduleContent">
            <div className="scheduleSubject">{scheduleItem.subjectName}</div>
            <div className="scheduleDuration">
              {scheduleItem.duration} tiết ({scheduleItem.duration * 45}p)
            </div>
          </div>

          <button
            type="button"
            className="removeBtn"
            onClick={(e) => {
              e.stopPropagation();
              onRemove && onRemove(dayIndex, time);
            }}
          >
            ×
          </button>

          <div
            className="resizeHandle"
            onMouseDown={(e) =>
              onResizeStart && onResizeStart(dayIndex, time, "end", e)
            }
            onClick={(e) => e.stopPropagation()}
            title="Kéo để thay đổi thời lượng"
          >
            <div className="resizeLine" />
          </div>
        </div>
      )}
    </div>
  );
}
