// Đường dẫn: features/Admin/Dashboard/components/RevenueChart.jsx
// (KHÔNG CẦN THAY ĐỔI)

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { revenueData } from "../mock/dashboardMock.js";

const RevenueChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {" "}
      <AreaChart
        data={revenueData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        {/* Tạo gradient fill */}{" "}
        <defs>
          {" "}
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            {" "}
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />{" "}
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />{" "}
          </linearGradient>{" "}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />{" "}
        <Area
          type="monotone"
          dataKey="Doanh thu (triệu)"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorRevenue)" // Sử dụng gradient
        />{" "}
      </AreaChart>{" "}
    </ResponsiveContainer>
  );
};

export default RevenueChart;
