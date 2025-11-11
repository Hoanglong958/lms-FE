// Đường dẫn: features/Admin/Dashboard/components/DashboardOverview.jsx
// (ĐÃ CHUYỂN ĐỔI)

import React from "react";
// Import data từ mock
import {
  overviewStatCardsRow1,
  overviewStatCardsRow2,
  newUsersData,
  newCoursesData,
  recentQuizzesData,
  topStudentsData,
} from "../mock/dashboardMock.js";

// Import các component con
import StatCard from "./StatCard";
import NewUsersTable from "./NewUsersTable";
import NewCoursesTable from "./NewCoursesTable";
import RecentQuizzesTable from "./RecentQuizzesTable";
import TopStudentsList from "./TopStudentsList";

// Import file CSS của bạn
import "../Dashboard.css";

const DashboardOverview = () => {
  return (
    <div className="dashboard-overview-grid">
      {/* === HÀNG 1: 4 THẺ STATS === */}{" "}
      <section className="col-span-12">
        {" "}
        <div className="stat-card-grid">
          {" "}
          {overviewStatCardsRow1.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}{" "}
        </div>{" "}
      </section>
      {/* === HÀNG 2: 4 THẺ STATS (biến thể) === */}{" "}
      <section className="col-span-12">
        {" "}
        <div className="stat-card-grid">
          {" "}
          {overviewStatCardsRow2.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}{" "}
        </div>{" "}
      </section>
      {/* === HÀNG 3: 2 BIỂU ĐỒ === */}{" "}
      <section className="dashboard-card col-span-12 lg-col-span-7">
        <h3 className="dashboard-card-title">Tăng trưởng người dùng</h3>{" "}
        <div className="chart-container-placeholder">
          [Line Chart Component]{" "}
        </div>{" "}
      </section>{" "}
      <section className="dashboard-card col-span-12 lg-col-span-5">
        <h3 className="dashboard-card-title">Tiến độ khóa học</h3>{" "}
        <div className="chart-container-placeholder">
          [Bar Chart Component]{" "}
        </div>{" "}
      </section>
      {/* ... các section biểu đồ khác ... */}{" "}
      <section className="dashboard-card col-span-12 lg-col-span-5">
        {" "}
        <h3 className="dashboard-card-title">
          Phân bổ vai trò người dùng
        </h3>{" "}
        <div className="chart-container-placeholder">
          [Donut Chart Component]{" "}
        </div>{" "}
      </section>{" "}
      <section className="dashboard-card col-span-12 lg-col-span-7">
        {" "}
        <h3 className="dashboard-card-title">Doanh thu / Lượt đăng ký</h3>{" "}
        <div className="chart-container-placeholder">
          [Area Chart Component]{" "}
        </div>{" "}
      </section>
      {/* === HÀNG 5: 2 BẢNG === */}{" "}
      <section className="dashboard-card col-span-12 lg-col-span-6">
        <h3 className="dashboard-card-title">Người dùng mới</h3>
        <NewUsersTable users={newUsersData} />{" "}
      </section>{" "}
      <section className="dashboard-card col-span-12 lg-col-span-6">
        <h3 className="dashboard-card-title">Khóa học mới tạo</h3>
        <NewCoursesTable courses={newCoursesData} />{" "}
      </section>
      {/* === HÀNG 6: BẢNG + LIST === */}{" "}
      <section className="dashboard-card col-span-12 lg-col-span-7">
        <h3 className="dashboard-card-title">Bài thi / Quiz gần đây</h3>
        <RecentQuizzesTable quizzes={recentQuizzesData} />{" "}
      </section>{" "}
      <section className="dashboard-card col-span-12 lg-col-span-5">
        <h3 className="dashboard-card-title">Top học viên xuất sắc</h3>
        <TopStudentsList students={topStudentsData} />{" "}
      </section>{" "}
    </div>
  );
};

export default DashboardOverview;
