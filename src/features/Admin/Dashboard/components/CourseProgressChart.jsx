import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CourseProgressChart = ({ data = [] }) => {
  // Nếu không có dữ liệu → không render biểu đồ
  const safeData = Array.isArray(data) ? data : [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={safeData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />

        <Bar dataKey="Hoàn thành" fill="#22c55e" />
        <Bar dataKey="Đang học" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CourseProgressChart;
