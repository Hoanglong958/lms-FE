import React, { useState } from "react";
import "../css/CalendarPicker.css";

export default function CalendarPicker({ onDateRangeSelect, initialStartDate, initialEndDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate || null);
  const [endDate, setEndDate] = useState(initialEndDate || null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

  const days = [];
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  const handleDateClick = (date) => {
    if (!date) return;

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // Complete selection
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      // Notify parent
      if (onDateRangeSelect) {
        const finalStart = date < startDate ? date : startDate;
        const finalEnd = date < startDate ? startDate : date;
        onDateRangeSelect(finalStart, finalEnd);
      }
    }
  };

  const isDateInRange = (date) => {
    if (!date || !startDate) return false;
    if (!endDate) return date.getTime() === startDate.getTime();
    return date >= startDate && date <= endDate;
  };

  const isDateSelected = (date) => {
    if (!date) return false;
    return (
      (startDate && date.getTime() === startDate.getTime()) ||
      (endDate && date.getTime() === endDate.getTime())
    );
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <div className="calendarPickerContainer">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="triggerButton"
        title="Chọn khoảng thời gian"
      >
        📅
        {(startDate || endDate) && (
          <span className="dateText">
            {formatDate(startDate)} - {endDate ? formatDate(endDate) : "..."}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="backdrop" onClick={() => setIsOpen(false)} />
          <div className="calendar">
            <div className="header">
              <button
                type="button"
                onClick={prevMonth}
                className="navButton"
                aria-label="Tháng trước"
              >
                ‹
              </button>
              <h3 className="monthTitle">
                {monthNames[month]} {year}
              </h3>
              <button
                type="button"
                onClick={nextMonth}
                className="navButton"
                aria-label="Tháng sau"
              >
                ›
              </button>
            </div>

            <div className="weekDays">
              {weekDays.map((day, idx) => (
                <div key={idx} className="weekDay">
                  {day}
                </div>
              ))}
            </div>

            <div className="daysGrid">
              {days.map((date, idx) => {
                if (!date) {
                  return <div key={idx} className="emptyDay" />;
                }

                const isToday =
                  date.toDateString() === today.toDateString();
                const inRange = isDateInRange(date);
                const selected = isDateSelected(date);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={`day ${isToday ? "today" : ""} ${inRange ? "inRange" : ""} ${selected ? "selected" : ""}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="footer">
              <button
                type="button"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  if (onDateRangeSelect) {
                    onDateRangeSelect(null, null);
                  }
                }}
                className="clearButton"
              >
                Xóa
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="closeButton"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


