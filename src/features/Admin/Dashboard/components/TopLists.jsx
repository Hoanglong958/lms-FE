import React from "react";
import TopCourses from "./TopCourses";
import TopInstructors from "./TopInstructors";
import TopStudents from "./TopStudents";
import styles from "../Dashboard.module.css";

export default function TopLists({ topCourses, topInstructors, topStudents }) {
  return (
    <div className={styles.topLists}>
      <TopCourses courses={topCourses} />
      <TopInstructors instructors={topInstructors} />
      <TopStudents students={topStudents} />
    </div>
  );
}
