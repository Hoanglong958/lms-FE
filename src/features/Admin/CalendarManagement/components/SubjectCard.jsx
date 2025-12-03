import React from "react";
import "../css/SubjectCard.css";

export default function SubjectCard({ subject, isDragging, onDragStart, onDragEnd }) {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify(subject));
    if (onDragStart) onDragStart(subject);
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) onDragEnd();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`card ${isDragging ? "dragging" : ""}`}
    >
      <div className="subjectName">{subject.courseName}</div>
    </div>
  );
}

