import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  LineChart,
  Line as RLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./ChartSection.module.css";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function ChartSection({ data = {} }) {
  const labels = Array.isArray(data.labels)
    ? data.labels
    : ["T1", "T2", "T3", "T4", "T5"];
  const values = Array.isArray(data.values)
    ? data.values
    : [10, 20, 30, 40, 50];

  // 1️⃣ Bar Chart
  const barData = {
    labels,
    datasets: [
      {
        label: "Lượt xem",
        data: values.map((v) => v * 1.5),
        backgroundColor: "rgba(255, 159, 64, 0.7)",
      },
      {
        label: "Người dùng",
        data: values,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  // 2️⃣ Line Chart
  const lineData = {
    labels,
    datasets: [
      {
        label: "Hoạt động",
        data: values.map((v, i) => v + ((i * 2) % 10)),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // 3️⃣ Pie Chart
  const pieData = {
    labels: ["Hoàn thành", "Chưa hoàn thành"],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverOffset: 8,
      },
    ],
  };

  // 4️⃣ Recharts Line Chart Data
  const rechartsData = labels.map((label, index) => ({
    name: label,
    value: values[index] ?? 0,
  }));

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.sectionTitle}>Biểu đồ tổng quan</h3>

      <div className={styles.chartsGrid}>
        <div className={styles.chartBox}>
          <h4>Thống kê lượt xem & người dùng</h4>
          <Bar data={barData} />
        </div>

        <div className={styles.chartBox}>
          <h4>Xu hướng hoạt động</h4>
          <Line data={lineData} />
        </div>

        <div className={styles.chartBox}>
          <h4>Tỷ lệ hoàn thành</h4>
          <Pie data={pieData} />
        </div>
      </div>

      <div className={styles.chartBoxWide}>
        <h3 className={styles.chartTitle}>
          Tăng trưởng người dùng & hoạt động
        </h3>
        <div className={styles.chartResponsive}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={rechartsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RTooltip />
              <RLine
                type="monotone"
                dataKey="value"
                stroke="#007bff"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
