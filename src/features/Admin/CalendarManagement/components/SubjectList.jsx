import React from "react";
import SubjectCard from "./SubjectCard";
import "../css/SubjectList.css";

export default function SubjectList({ subjects, onDragStart, onDragEnd, draggingSubject }) {
  return (
    <div className="subjectListContainer">
      <h3 className="subjectListTitle">Môn học</h3>
      <div className="subjectListSubtitle">Kéo thả vào lịch học</div>
      <div className="subjectList">
        {subjects.map((subject, index) => (
          <SubjectCard
            key={index}
            subject={subject}
            isDragging={draggingSubject?.courseId === subject.courseId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {subjects.length === 0 && (
          <div className="subjectListEmpty">Chưa có môn học nào</div>
        )}
      </div>
    </div>
  );
}

