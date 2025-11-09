import React from "react";
import styles from "../Dashboard.module.css";

export default function OverviewCardItem({ title, value }) {
  return (
    <div className={styles.overviewCardItem}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardValue}>{value}</div>
    </div>
  );
}
