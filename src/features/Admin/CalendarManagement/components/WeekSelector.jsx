import React from "react";
import "../css/WeekSelector.css";

export default function WeekSelector({ weeks, selectedWeek, onSelectWeek }) {
  const formatWeekRange = (week) => {
    if (!week.startDate || !week.endDate) return `Tuần ${week.weekNumber}`;
    
    const start = week.startDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    const end = week.endDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });   
    return `${start} - ${end}`;
  };

  return (
    <div className="weekSelectorContainer">
      <h3 className="weekSelectorTitle">Chọn tuần</h3>
      <div className="weeksList">
        {weeks.map((week) => (
          <button
            key={week.weekNumber}
            type="button"
            onClick={() => onSelectWeek && onSelectWeek(week)}
            className={`weekButton ${selectedWeek?.weekNumber === week.weekNumber ? "selected" : ""}`}
          >
            <div className="weekNumber">Tuần {week.weekNumber}</div>
            <div className="weekRange">{formatWeekRange(week)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

