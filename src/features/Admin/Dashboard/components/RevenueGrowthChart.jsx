// Đường dẫn: features/Admin/Dashboard/components/RevenueGrowthChart.jsx

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

const RevenueGrowthChart = ({ data = [] }) => {
  const formatCurrency = (value) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)} Tỷ`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} Tr`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)} K`;
    }
    return value.toString();
  };

  const formatTooltip = (value) => {
    return [`${value.toLocaleString("vi-VN")} VNĐ`, 'Doanh thu'];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 10,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis 
          tick={{ fontSize: 12, fill: "#6b7280" }} 
          axisLine={false} 
          tickLine={false}
          tickFormatter={formatCurrency}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          formatter={formatTooltip}
        />
        <Area
          type="monotone"
          dataKey="Doanh thu"
          stroke="#10b981"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          activeDot={{ r: 6, strokeWidth: 0, fill: "#059669" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default RevenueGrowthChart;
