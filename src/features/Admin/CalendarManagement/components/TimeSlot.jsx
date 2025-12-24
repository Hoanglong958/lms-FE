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
  style,
  onScheduleClick,
  movingItem,
  readOnly = false,
}) {
  const isMoving = movingItem && scheduleItem && movingItem.scheduleId === scheduleItem.scheduleId;

  const handleDrop = (e) => {
    e.preventDefault();
    if (readOnly) return;
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
    if (readOnly) return;
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
          onClick={(e) => {
            e.stopPropagation();
            onScheduleClick && onScheduleClick(scheduleItem);
          }}
          style={{
            height: "100%",
            zIndex: 5,
            backgroundColor: scheduleItem.backgroundColor || undefined,
            color: scheduleItem.color || undefined,
            border: isMoving ? '2px dashed #999' : scheduleItem.border || undefined,
            opacity: isMoving ? 0.4 : 1
          }}
          draggable={!readOnly}
          onDragStart={(e) => {
            if (readOnly) {
              e.preventDefault();
              return;
            }
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
            if (readOnly) return;
            e.currentTarget.style.opacity = "1";
            onDragStart && onDragStart(null);
          }}
        >
          <div className="scheduleContent">
            <div className="scheduleSubject">{scheduleItem.subjectName}</div>
          </div>

          {!readOnly && (
            <div className="actionButtons" style={{ position: 'absolute', top: '2px', right: '2px', display: 'flex', gap: '4px', zIndex: 20 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onScheduleClick && onScheduleClick(scheduleItem);
                }}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid #007bff',
                  borderRadius: '4px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#007bff'
                }}
                title="Sửa"
              >
                ✎
              </button>
            </div>
          )}
        </div>
      )
      }
    </div>
  );
}
