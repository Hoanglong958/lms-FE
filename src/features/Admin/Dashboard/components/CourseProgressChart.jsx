// Đường dẫn: features/Admin/Dashboard/components/CourseProgressChart.jsx
// (KHÔNG THAY ĐỔI)

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { courseProgressData } from "../mock/dashboardMock.js";

const CourseProgressChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {" "}
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 0,
          left: -20, // Dịch sang trái 1 chút cho YAxis
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Hoàn thành" fill="#22c55e" /> {/* Màu xanh green */}
        <Bar dataKey="Đang học" fill="#3b82f6" /> {/* Màu xanh blue */}{" "}
      </BarChart>{" "}
    </ResponsiveContainer>
  );
};

export default CourseProgressChart;
