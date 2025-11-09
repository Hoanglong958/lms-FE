import React from "react";
import StudentGrowthChart from "./charts/StudentGrowthChart";
import RevenueChart from "./charts/RevenueChart";
import CompletionRateChart from "./charts/CompletionRateChart";
import CourseTypePie from "./charts/CourseTypePie";
import styles from "../Dashboard.module.css";

export default function ChartSection({ charts }) {
  return (
    <div className={styles.chartSection}>
      <div className={styles.chartWrapper}>
        <StudentGrowthChart data={charts.studentGrowth} />
      </div>
      <div className={styles.chartWrapper}>
        <RevenueChart data={charts.revenue} />
      </div>
      <div className={styles.chartWrapper}>
        <CompletionRateChart data={charts.completionRate} />
      </div>
      <div className={styles.chartWrapper}>
        <CourseTypePie data={charts.courseType} />
      </div>
    </div>
  );
}
