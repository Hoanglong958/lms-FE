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

const data = [
  { name: "Tháng 1", doanhThu: 120 },
  { name: "Tháng 2", doanhThu: 200 },
  { name: "Tháng 3", doanhThu: 150 },
  { name: "Tháng 4", doanhThu: 300 },
  { name: "Tháng 5", doanhThu: 250 },
  { name: "Tháng 6", doanhThu: 400 },
];

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <h2 className="dashboard-title">📊 Tổng quan hệ thống</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Người dùng</h3>
          <p className="stat-number">1,245</p>
          <span className="stat-desc">+12% so với tháng trước</span>
        </div>
        <div className="stat-card">
          <h3>Đơn hàng</h3>
          <p className="stat-number">382</p>
          <span className="stat-desc">+8% so với tháng trước</span>
        </div>
        <div className="stat-card">
          <h3>Doanh thu</h3>
          <p className="stat-number">₫57,200,000</p>
          <span className="stat-desc">+20% so với tháng trước</span>
        </div>
        <div className="stat-card">
          <h3>Sản phẩm</h3>
          <p className="stat-number">189</p>
          <span className="stat-desc">+5 sản phẩm mới</span>
        </div>
      </div>

      <div className="dashboard-chart">
        <h3>Doanh thu 6 tháng gần đây</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="doanhThu" fill="#f28c38" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
