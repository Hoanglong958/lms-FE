import React from "react";
import styles from "./OverviewCards.module.css";

export default function OverviewCards({ data }) {
  if (!data) return null;

  const items = [
    { label: "Người dùng", value: data.totalUsers, icon: "fa-users" },
    { label: "Lượt xem", value: data.totalViews, icon: "fa-eye" },
    {
      label: "Hoàn thành",
      value: data.totalCompleted,
      icon: "fa-check-circle",
    },
  ];

  return (
    <div className={styles.cardsContainer}>
      {items.map((item, idx) => (
        <div key={idx} className={styles.card}>
          <i className={`fa-solid ${item.icon}`}></i>
          <div>
            <p className={styles.value}>{item.value}</p>
            <p className={styles.label}>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
