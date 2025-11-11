// Đường dẫn: features/Admin/Dashboard/components/UserRolesChart.jsx
// (KHÔNG CẦN THAY ĐỔI)

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { userRolesData } from "../mock/dashboardMock.js";

const COLORS = ["#3b82f6", "#22c55e", "#f97316"]; // Blue, Green, Orange

const UserRolesChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {" "}
      <PieChart>
        {" "}
        <Pie
          data={userRolesData}
          cx="50%" // Căn giữa
          cy="50%" // Căn giữa
          innerRadius={60} // Tạo lỗ ở giữa (biểu đồ Donut)
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value" // Dữ liệu từ mock
          nameKey="name" // Tên từ mock
        >
          {" "}
          {userRolesData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}{" "}
        </Pie>
        <Tooltip />{" "}
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{ paddingLeft: "10px" }}
        />{" "}
      </PieChart>{" "}
    </ResponsiveContainer>
  );
};

export default UserRolesChart;
