import React from "react";
import OverviewCardItem from "./OverviewCardItem";
import styles from "../Dashboard.module.css";

export default function OverviewCards({ overview }) {
  if (!overview) return null;

  return (
    <div className={styles.overviewCards}>
      <OverviewCardItem title="Total Students" value={overview.totalStudents} />
      <OverviewCardItem
        title="Students in Class"
        value={overview.studentsInClass}
      />
      <OverviewCardItem title="Total Courses" value={overview.totalCourses} />
      <OverviewCardItem
        title="Courses With Class"
        value={overview.coursesWithClass}
      />
      <OverviewCardItem title="Free Courses" value={overview.freeCourses} />
      <OverviewCardItem title="Paid Courses" value={overview.paidCourses} />
      <OverviewCardItem
        title="Monthly Revenue"
        value={`$${overview.monthlyRevenue}`}
      />
    </div>
  );
}
