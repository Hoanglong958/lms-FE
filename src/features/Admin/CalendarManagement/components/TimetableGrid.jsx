import React, { useState, useEffect, useCallback, useRef } from "react";
import DayColumn from "./DayColumn";
import "../css/TimetableGrid.css";

const MORNING_SLOTS_COUNT = 6;
const LESSON_HEIGHT = 45;

export default function TimetableGrid({
  weekDays,
  schedule,
  onScheduleChange,
  draggingSubject = null,
}) {
  const [draggingOver, setDraggingOver] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [previewPosition, setPreviewPosition] = useState(null);

  const [draggingItem, setDraggingItemState] = useState(null);
  const draggingItemRef = useRef(null);
  const scheduleRef = useRef(schedule);

  useEffect(() => {
    scheduleRef.current = schedule;
  }, [schedule]);

  // --- SỬA LỖI KHÔNG KÉO ĐƯỢC TẠI ĐÂY ---
  const setDraggingItem = (item) => {
    // Luôn update Ref ngay lập tức cho logic tính toán
    draggingItemRef.current = item;

    if (item) {
      // Nếu bắt đầu kéo: Chờ 1 nhịp (setTimeout) để trình duyệt khởi tạo Drag xong
      // rồi mới apply class .dragging-mode (pointer-events: none)
      setTimeout(() => {
        setDraggingItemState(item);
      }, 0);
    } else {
      // Nếu kết thúc kéo: Reset ngay lập tức
      setDraggingItemState(null);
    }
  };

  const generateTimeSlots = () => {
    const morningTimes = [
      { hour: 7, minute: 0 },
      { hour: 7, minute: 45 },
      { hour: 8, minute: 30 },
      { hour: 9, minute: 15 },
      { hour: 10, minute: 0 },
      { hour: 10, minute: 45 },
    ];
    const afternoonTimes = [
      { hour: 13, minute: 0 },
      { hour: 13, minute: 45 },
      { hour: 14, minute: 30 },
      { hour: 15, minute: 15 },
      { hour: 16, minute: 0 },
      { hour: 16, minute: 45 },
    ];
    const slots = [];
    [...morningTimes, ...afternoonTimes].forEach((time) => {
      const timeKey = `${time.hour}:${time.minute.toString().padStart(2, "0")}`;
      slots.push({ ...time, key: timeKey });
    });
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const getTimeSlotIndex = (timeKey) =>
    timeSlots.findIndex((slot) => slot.key === timeKey);
  const getNextTimeSlotKey = (timeKey, offset) => {
    const idx = getTimeSlotIndex(timeKey);
    if (idx === -1 || idx + offset >= timeSlots.length) return null;
    return timeSlots[idx + offset].key;
  };

  // --- LOGIC CHECK SLOT ---
  const checkSlotAvailability = (
    dayIndex,
    timeKey,
    duration,
    currentSchedule,
    excludeDayIndex = null,
    excludeTimeKey = null
  ) => {
    const startIndex = getTimeSlotIndex(timeKey);
    if (startIndex === -1) return false;

    if (
      startIndex < MORNING_SLOTS_COUNT &&
      startIndex + duration > MORNING_SLOTS_COUNT
    ) {
      return false;
    }

    if (!currentSchedule[dayIndex]) return true;

    const getOccupier = (tKey) => {
      if (currentSchedule[dayIndex][tKey])
        return currentSchedule[dayIndex][tKey];
      const cIndex = getTimeSlotIndex(tKey);
      for (let back = 1; back <= 5; back++) {
        const prevIdx = cIndex - back;
        if (prevIdx >= 0) {
          const prevKey = timeSlots[prevIdx].key;
          const item = currentSchedule[dayIndex][prevKey];
          if (item && item.duration > back) return item;
        }
      }
      return null;
    };

    for (let i = 0; i < duration; i++) {
      const checkKey = getNextTimeSlotKey(timeKey, i);
      if (!checkKey) return false;

      const occupier = getOccupier(checkKey);
      if (occupier) {
        if (excludeDayIndex !== null && excludeTimeKey !== null) {
          const isMe =
            dayIndex === excludeDayIndex &&
            occupier.startTime === excludeTimeKey;
          if (isMe) continue;
        }
        return false;
      }
    }
    return true;
  };

  const calculateRealStartTime = (targetTimeKey, grabOffset) => {
    if (!grabOffset || grabOffset === 0) return targetTimeKey;
    const targetIndex = getTimeSlotIndex(targetTimeKey);
    if (targetIndex === -1) return targetTimeKey;
    const startIndex = targetIndex - grabOffset;
    if (startIndex < 0) return timeSlots[0].key;
    return timeSlots[startIndex].key;
  };

  const handleDrop = (dayIndex, time, subject) => {
    const targetTimeKey = typeof time === "string" ? time : time.key;
    let subjectData = subject;
    let oldDayIndex = null;
    let oldTimeKey = null;
    let grabOffset = 0;

    if (subject.type === "schedule") {
      subjectData = subject.item;
      const currentDragging = draggingItemRef.current;
      if (currentDragging) {
        oldDayIndex = currentDragging.dayIndex;
        oldTimeKey = currentDragging.timeKey;
        grabOffset = currentDragging.grabOffset || 0;
      }
    }

    const actualStartTimeKey = calculateRealStartTime(
      targetTimeKey,
      grabOffset
    );
    const duration = subjectData.duration || 1;

    if (
      checkSlotAvailability(
        dayIndex,
        actualStartTimeKey,
        duration,
        schedule,
        oldDayIndex,
        oldTimeKey
      )
    ) {
      const newSchedule = { ...schedule };
      if (subject.type === "schedule" && oldDayIndex !== null) {
        if (newSchedule[oldDayIndex]?.[oldTimeKey]) {
          delete newSchedule[oldDayIndex][oldTimeKey];
          if (Object.keys(newSchedule[oldDayIndex]).length === 0)
            delete newSchedule[oldDayIndex];
        }
      }
      if (!newSchedule[dayIndex]) newSchedule[dayIndex] = {};
      newSchedule[dayIndex][actualStartTimeKey] = {
        subjectId: subjectData.courseId || subjectData.subjectId,
        subjectName: subjectData.courseName || subjectData.subjectName,
        duration: duration,
        startTime: actualStartTimeKey,
      };
      setDraggingItem(null);
      setPreviewPosition(null);
      onScheduleChange && onScheduleChange(newSchedule);
    } else {
      setDraggingItem(null);
      setPreviewPosition(null);
    }
  };

  const handleDragOver = (dayIndex, time) => {
    const targetTimeKey = typeof time === "string" ? time : time.key;
    setDraggingOver({ dayIndex, time: targetTimeKey });

    let duration = 1;
    let name = "";
    let oldD = null,
      oldT = null;
    let grabOffset = 0;

    const currentItem = draggingItemRef.current;

    if (currentItem) {
      duration = currentItem.item.duration;
      name = currentItem.item.subjectName;
      oldD = currentItem.dayIndex;
      oldT = currentItem.timeKey;
      grabOffset = currentItem.grabOffset || 0;
    } else if (draggingSubject) {
      duration = 1;
      name = draggingSubject.courseName;
    }

    const actualStartTimeKey = calculateRealStartTime(
      targetTimeKey,
      grabOffset
    );

    if (
      checkSlotAvailability(
        dayIndex,
        actualStartTimeKey,
        duration,
        schedule,
        oldD,
        oldT
      )
    ) {
      setPreviewPosition({
        dayIndex,
        time: actualStartTimeKey,
        duration,
        subjectName: name,
      });
    } else {
      setPreviewPosition(null);
    }
  };

  const handleResizeStart = (dayIndex, time, direction, e) => {
    e.preventDefault();
    e.stopPropagation();
    const timeKey = typeof time === "string" ? time : time.key;
    const item = schedule[dayIndex]?.[timeKey];
    if (item)
      setResizing({
        dayIndex,
        timeKey,
        startY: e.clientY,
        startDuration: item.duration,
      });
  };

  const handleResizeMove = useCallback(
    (e) => {
      if (!resizing) return;
      const { dayIndex, timeKey, startY, startDuration } = resizing;
      const deltaY = e.clientY - startY;
      const lessonsMoved = Math.round(deltaY / LESSON_HEIGHT);
      const newDuration = Math.max(
        1,
        Math.min(5, startDuration + lessonsMoved)
      );
      const currentItem = scheduleRef.current[dayIndex][timeKey];

      if (newDuration !== currentItem.duration) {
        if (
          checkSlotAvailability(
            dayIndex,
            timeKey,
            newDuration,
            scheduleRef.current,
            dayIndex,
            timeKey
          )
        ) {
          const newSchedule = { ...scheduleRef.current };
          newSchedule[dayIndex][timeKey] = {
            ...currentItem,
            duration: newDuration,
          };
          onScheduleChange && onScheduleChange(newSchedule);
        }
      }
    },
    [resizing, onScheduleChange]
  );

  const handleResizeEnd = useCallback(() => {
    setResizing(null);
  }, []);

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [resizing, handleResizeMove, handleResizeEnd]);

  const handleRemove = (dayIndex, time) => {
    const timeKey = typeof time === "string" ? time : time.key;
    const newSch = { ...schedule };
    if (newSch[dayIndex]?.[timeKey]) {
      delete newSch[dayIndex][timeKey];
      onScheduleChange && onScheduleChange(newSch);
    }
  };

  return (
    <div className={`container ${draggingItem ? "dragging-mode" : ""}`}>
      <div className="timeColumn">
        <div className="timeHeader">Giờ</div>
        <div className="timeSlots">
          {timeSlots.map((slot, index) => (
            <React.Fragment key={slot.key}>
              {index === MORNING_SLOTS_COUNT && (
                <div className="breakSeparator">Nghỉ trưa</div>
              )}
              <div className="timeSlot">
                {slot.hour.toString().padStart(2, "0")}:
                {slot.minute.toString().padStart(2, "0")}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="daysContainer">
        {weekDays.map((day, index) => (
          <DayColumn
            key={index}
            day={day}
            dayIndex={index}
            timeSlots={timeSlots}
            schedule={schedule[index] || {}}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onRemove={handleRemove}
            onResizeStart={handleResizeStart}
            onDragStart={setDraggingItem}
            previewPosition={
              previewPosition?.dayIndex === index ? previewPosition : null
            }
            morningSlotsCount={MORNING_SLOTS_COUNT}
          />
        ))}
      </div>
    </div>
  );
}
