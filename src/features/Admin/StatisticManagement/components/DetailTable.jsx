import React from "react";
import styles from "./DetailTable.module.css";

export default function DetailTable({ data }) {
  if (!data || data.length === 0) {
    return <p className={styles.noData}>Không có dữ liệu để hiển thị.</p>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Tên</th>
          <th>Loại</th>
          <th>Số người tham gia</th>
          <th>Tỷ lệ hoàn thành</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{item.name}</td>
            <td>{item.type}</td>
            <td>{item.participants}</td>
            <td>{item.completion || item.completionRate || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
