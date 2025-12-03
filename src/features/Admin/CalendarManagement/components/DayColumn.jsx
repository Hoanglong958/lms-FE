import React from "react";
import TimeSlot from "./TimeSlot";
import "../css/DayColumn.css";

export default function DayColumn({
  day,
  dayIndex,
  timeSlots,
  schedule,
  onDrop,
  onDragOver,
  onRemove,
  onResizeStart,
  onDragStart,
  previewPosition,
  morningSlotsCount,
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
        {timeSlots.map((timeSlot, index) => {
          const scheduleItem = schedule?.[timeSlot.key] || null;

          // Logic check bị che khuất bởi item phía trên (cho mục đích render CSS nếu cần)
          // (Đơn giản hóa ở đây vì chúng ta dùng absolute position cho item)

          return (
            <React.Fragment key={timeSlot.key}>
              {/* CHÈN KHOẢNG NGHỈ TRƯA ĐỒNG BỘ */}
              {index === morningSlotsCount && (
                <div className="breakSeparator columnSeparator"></div>
              )}

              <TimeSlot
                time={timeSlot}
                timeIndex={index}
                dayIndex={dayIndex}
                onDrop={onDrop}
                onDragOver={onDragOver}
                scheduleItem={scheduleItem}
                onRemove={onRemove}
                onResizeStart={onResizeStart}
                onDragStart={onDragStart}
                previewPosition={
                  previewPosition?.time === timeSlot.key
                    ? previewPosition
                    : null
                }
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
