import React from "react";
import "../css/TimeSlot.css";

export default function TimeSlot({
  period,
  periodId,
  dayIndex,
  onDrop,
  onDragOver,
  scheduleItem,
  onRemove,
  onDragStart,
  previewPosition,
  style
}) {
  const handleDrop = (e) => {
    e.preventDefault();
    if (onDrop) {
      const data = e.dataTransfer.getData("text/plain");
      try {
        const subject = JSON.parse(data);
        onDrop(dayIndex, periodId, subject);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (onDragOver) onDragOver(dayIndex, periodId);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`slot ${scheduleItem ? "hasSchedule" : ""}`}
      style={style}
    >
      {/* --- PREVIEW ITEM --- */}
      {previewPosition && previewPosition.periodId === periodId && !scheduleItem && (
        <div className="scheduleItem previewItem" style={{ height: "100%" }}>
          <div className="scheduleContent">
            <div className="scheduleSubject">{previewPosition.subjectName}</div>
          </div>
        </div>
      )}

      {/* --- SCHEDULE ITEM CHÍNH THỨC --- */}
      {scheduleItem && scheduleItem.periodId === periodId && (
        <div
          className="scheduleItem"
          style={{
            height: "100%",
            zIndex: 5,
            backgroundColor: scheduleItem.backgroundColor || undefined,
            color: scheduleItem.color || undefined,
            border: scheduleItem.border || undefined
          }}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData(
              "text/plain",
              JSON.stringify({ type: "schedule", item: { ...scheduleItem, dayIndex } })
            );
            e.currentTarget.style.opacity = "0.5";

            onDragStart &&
              onDragStart({
                dayIndex,
                periodId,
                item: scheduleItem,
              });
          }}
          onDragEnd={(e) => {
            e.currentTarget.style.opacity = "1";
            onDragStart && onDragStart(null);
          }}
        >
          <div className="scheduleContent">
            <div className="scheduleSubject">{scheduleItem.subjectName}</div>
          </div>

          <button
            type="button"
            className="removeBtn"
            onClick={(e) => {
              e.stopPropagation();
              onRemove && onRemove(dayIndex, periodId);
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
