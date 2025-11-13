// Đường dẫn: features/Admin/Dashboard/components/TopStudentsList.jsx

import React from "react";
// import styles from "../Dashboard.module.css";

const TopStudentsList = ({ students }) => (
  <div className="space-y-3">
    {students.map((student, index) => (
      <div
        key={student.id}
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
      >
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 font-bold text-sm">
            {index + 1}
          </span>
          <div>
            <div className="font-semibold">{student.name}</div>
            <div className="text-xs text-gray-500">
              {student.courses} khóa học
            </div>
          </div>
        </div>
        <div className="text-green-600 font-bold">{student.score} điểm</div>
      </div>
    ))}
  </div>
);

export default TopStudentsList;
