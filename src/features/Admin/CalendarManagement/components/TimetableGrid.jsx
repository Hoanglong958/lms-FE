import React, { useState, useEffect, useCallback, useRef } from "react";
import DayColumn from "./DayColumn";
import "../css/TimetableGrid.css";

const MORNING_SLOTS_COUNT = 6;
const LESSON_HEIGHT = 45;

export default function TimetableGrid({
  weekDays,
  periods = [],
  schedule,
  onScheduleChange,
  draggingSubject = null,
}) {
  const [draggingOver, setDraggingOver] = useState(null);
  const [previewPosition, setPreviewPosition] = useState(null);
  const [draggingItem, setDraggingItemState] = useState(null);
  const draggingItemRef = useRef(null);
  const scheduleRef = useRef(schedule);

  useEffect(() => {
    scheduleRef.current = schedule;
  }, [schedule]);

  const setDraggingItem = (item) => {
    draggingItemRef.current = item;
    setTimeout(() => {
      setDraggingItemState(item);
    }, 0);
  };

  // No slots generation needed, we iterate over periods.

  const checkSlotAvailability = (dayIndex, periodId) => {
    // 1 Period = 1 Slot. If occupied, return false.
    if (!schedule[dayIndex]) return true;
    return !schedule[dayIndex][periodId];
  };

  const handleDrop = (dayIndex, periodId, subject) => {
    // If dropping a scheduled item, we might need to remove it from old position?
    // For now, let's assume we just assign.
    let subjectData = subject;
    if (subject.type === "schedule") {
      subjectData = subject.item;
    }

    if (checkSlotAvailability(dayIndex, periodId)) {
      const newSchedule = { ...schedule };

      // Remove from old if it was a schedule move (logic to be enhanced if needed)
      if (subject.type === "schedule") {
        // Find and remove old instance logic... 
        // Currently simplified: Backend handles "Manual" which might overwrite or add?
        // Actually, Frontend state update:
        const oldDay = subject.item.dayIndex;
        const oldPeriod = subject.item.periodId;
        if (newSchedule[oldDay] && newSchedule[oldDay][oldPeriod]) {
          delete newSchedule[oldDay][oldPeriod];
        }
      }

      if (!newSchedule[dayIndex]) newSchedule[dayIndex] = {};
      newSchedule[dayIndex][periodId] = {
        subjectId: subjectData.courseId || subjectData.subjectId,
        subjectName: subjectData.courseName || subjectData.subjectName,
        periodId: periodId,
        startTime: periodId, // Using periodId as key
      };

      onScheduleChange?.(newSchedule, {
        dayIndex,
        periodId,
        courseId: subjectData.courseId || subjectData.subjectId,
        classId: subjectData.classId // If available
      });

      setDraggingItem(null);
      setPreviewPosition(null);
    }
  };

  const handleDragOver = (dayIndex, periodId) => {
    setDraggingOver({ dayIndex, periodId });
    if (checkSlotAvailability(dayIndex, periodId)) {
      setPreviewPosition({
        dayIndex,
        periodId,
        subjectName: draggingSubject ? draggingSubject.courseName : "...",
      });
    } else {
      setPreviewPosition(null);
    }
  };

  const handleRemove = (dayIndex, periodId) => {
    const newSch = { ...schedule };
    if (newSch[dayIndex]?.[periodId]) {
      delete newSch[dayIndex][periodId];
      onScheduleChange?.(newSch, { remove: true, dayIndex, periodId });
    }
  };

  const formatTime = (t) => {
    if (!t) return "";
    if (typeof t === "string") {
      // Check if "HH:mm:ss"
      const parts = t.split(":");
      if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
      return t;
    }
    if (Array.isArray(t)) {
      // [hour, minute, second...]
      const h = String(t[0] || 0).padStart(2, '0');
      const m = String(t[1] || 0).padStart(2, '0');
      return `${h}:${m}`;
    }
    if (typeof t === "object") {
      const h = String(t.hour || 0).padStart(2, '0');
      const m = String(t.minute || 0).padStart(2, '0');
      return `${h}:${m}`;
    }
    return "";
  };

  return (
    <div className={`container ${draggingItem ? "dragging-mode" : ""}`}>
      <div className="timeColumn">
        <div className="timeHeader">Ca học</div>
        <div className="timeSlots">
          {periods.map((p) => (
            <div key={p.id} className="timeSlot" style={{ height: '80px', lineHeight: '1.4', flexDirection: 'column', justifyContent: 'center', display: 'flex', borderBottom: '1px solid #eee' }}>
              <div style={{ fontWeight: 600, color: '#333' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {formatTime(p.startTime)} - {formatTime(p.endTime)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="daysContainer">
        {weekDays.map((day, index) => (
          <DayColumn
            key={index}
            day={day}
            dayIndex={index}
            periods={periods}
            schedule={schedule[index] || {}}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onRemove={handleRemove}
            onDragStart={setDraggingItem}
            previewPosition={
              previewPosition?.dayIndex === index ? previewPosition : null
            }
          />
        ))}
      </div>
    </div>
  );
}
