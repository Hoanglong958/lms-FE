// Đường dẫn: src/features/Admin/Dashboard/components/DashboardOverview.jsx

import React, { useEffect, useState } from "react";
import AdminHeader from "@components/Admin/AdminHeader";
// Đảm bảo bạn đã import file CSS này
import "./Dashboard.css";

// 1. IMPORT DATA TỪ MOCK
import {
  overviewStatCardsRow1,
  overviewStatCardsRow2,
  newUsersData,
  newCoursesData,
  recentQuizzesData,
} from "./mock/dashboardMock";

// 2. IMPORT TẤT CẢ CÁC COMPONENT CON
import StatCard from "./components/StatCard";
// Biểu đồ
import UserGrowthChart from "./components/UserGrowthChart";
import CourseProgressChart from "./components/CourseProgressChart";
// Bảng và Danh sách
import NewUsersTable from "./components/NewUsersTable";
import NewCoursesTable from "./components/NewCoursesTable";
import RecentQuizzesTable from "./components/RecentQuizzesTable";
import RankingList from "./components/RankingList";
import { dashboardService } from "@utils/dashboardService";

// 3. XÂY DỰNG LAYOUT
const DashboardOverview = () => {
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  useEffect(() => {
    let alive = true;
    dashboardService
      .getUserGrowthByMonth(12)
      .then((res) => {
        const raw = res?.data;
        const arr = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        const mapped = arr.map((item, idx) => {
          const month = item?.month || item?.label || `T${idx + 1}`;
          const count =
            item?.count ??
            item?.userCount ??
            item?.value ??
            item?.users ??
            item?.total ??
            0;
          return { month: String(month), "Người dùng": Number(count) || 0 };
        });
        if (alive) setUserGrowthData(mapped);
      })
      .catch(() => { if (alive) setUserGrowthData([]); });

    dashboardService
      .getTopStudents()
      .then((res) => {
        const raw = res?.data;
        const arr = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        const mapped = arr.map((s, i) => ({
          id: s?.id ?? s?.userId ?? i + 1,
          name: s?.name ?? s?.fullName ?? s?.gmail ?? `#${s?.id ?? i + 1}`,
          score: Number(s?.score ?? s?.avgScore ?? s?.totalScore ?? 0),
          courses: Number(s?.courses ?? s?.courseCount ?? s?.completed ?? 0),
        }));
        if (alive) setTopStudents(mapped);
      })
      .catch(() => { if (alive) setTopStudents([]); });

    return () => { alive = false; };
  }, []);
  return (
    <div className="dashboard-main">
      {/* <AdminHeader
        title="Dashboard Tổng Quan"
        subtitle="Thống kê và phân tích hệ thống LMS"
        breadcrumb={<span>Admin / Dashboard</span>}
      /> */}

      <div className="dashboard-overview-grid">
        {/* === HÀNG 1: 4 THẺ STATS === */}
        <section className="col-span-12">
          {/* Thay thế 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5' */}
          <div className="stat-card-grid">
            {overviewStatCardsRow1.map((card, index) => (
              <StatCard key={index} {...card} />
            ))}
          </div>
        </section>
        {/* === HÀNG 2: 4 THẺ STATS (biến thể) === */}
        <section className="col-span-12">
          <div className="stat-card-grid">
            {overviewStatCardsRow2.map((card, index) => (
              <StatCard key={index} {...card} />
            ))}
          </div>
        </section>
        {/* === HÀNG 3: BIỂU ĐỒ  === */}
        <section className="dashboard-card col-span-12 lg-col-span-7">
          <h3 className="dashboard-card-title">Tăng trưởng người dùng</h3>
          <div className="chart-container">
            <UserGrowthChart data={userGrowthData} />
          </div>
        </section>
        <section className="dashboard-card col-span-12 lg-col-span-5">
          <h3 className="dashboard-card-title">Tiến độ khóa học</h3>
          <div className="chart-container">
            <CourseProgressChart />
          </div>
        </section>

        {/* === HÀNG 5: BẢNG  === */}
        <section className="dashboard-card col-span-12 lg-col-span-7">
          <h3 className="dashboard-card-title">Người dùng mới</h3>
          <NewUsersTable users={newUsersData} />
        </section>
        <section className="dashboard-card col-span-12 lg-col-span-5">
          <RankingList students={topStudents} />
        </section>

        {/* === HÀNG 6: BẢNG  === */}
        <section className="dashboard-card col-span-12 lg-col-span-6">
          <h3 className="dashboard-card-title">Khóa học mới tạo</h3>
          <NewCoursesTable courses={newCoursesData} />
        </section>
        <section className="dashboard-card col-span-12 lg-col-span-6">
          <h3 className="dashboard-card-title">Bài thi / Quiz gần đây</h3>
          <RecentQuizzesTable quizzes={recentQuizzesData} />
        </section>
      </div>
    </div>
  );
};

export default DashboardOverview;
