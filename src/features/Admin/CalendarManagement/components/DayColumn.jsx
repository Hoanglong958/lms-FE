// src/features/Admin/CalendarManagement/components/DayColumn.jsx
import React from "react";
import TimeSlot from "./TimeSlot";
import "../css/DayColumn.css";

export default function DayColumn({
  day,
  dayIndex,
  periods,
  schedule,
  onDrop,
  onDragOver,
  onRemove,
  onDragStart,

  previewPosition,
  onScheduleClick,
  movingItem
}) {
  const dayNames = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  return (
    <div className="column">
      <div className="header">
        <div className="dayName">{dayNames[day.getDay()]}</div>
        <div className="dayDate">
          {day.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          })}
        </div>
      </div>
      <div className="slots">
        {periods.map((period) => {
          const scheduleItem = schedule?.[period.id] || null;

          return (
            <TimeSlot
              key={period.id}
              period={period}
              periodId={period.id}
              dayIndex={dayIndex}
              onDrop={onDrop}
              onDragOver={onDragOver}
              scheduleItem={scheduleItem}
              onRemove={onRemove}
              onDragStart={onDragStart}
              previewPosition={
                previewPosition?.periodId === period.id
                  ? previewPosition
                  : null
              }
              // Style override for slot
              style={{ height: '80px' }}
              onScheduleClick={onScheduleClick}
              movingItem={movingItem}
            />
          );
        })}
      </div>
    </div>
  );
}
