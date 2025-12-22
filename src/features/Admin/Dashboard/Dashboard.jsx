// Đường dẫn: src/features/Admin/Dashboard/components/DashboardOverview.jsx

import React, { useEffect, useState } from "react";
import AdminHeader from "@components/Admin/AdminHeader";
// Đảm bảo bạn đã import file CSS này
import "./Dashboard.css";

// 1. IMPORT DATA TỪ MOCK
import { newUsersData, newCoursesData } from "./mock/dashboardMock";

// 2. IMPORT TẤT CẢ CÁC COMPONENT CON
import StatCard from "./components/StatCard";
// Biểu đồ
import UserGrowthChart from "./components/UserGrowthChart";
import CourseProgressChart from "./components/CourseProgressChart";
// Bảng và Danh sách
import NewUsersTable from "./components/NewUsersTable";
import NewCoursesTable from "./components/NewCoursesTable";
import RecentQuizzesTable from "./components/RecentQuizzesTable";
import { dashboardService } from "@utils/dashboardService";
import { quizResultService } from "@utils/quizResultService.js";

// 3. XÂY DỰNG LAYOUT
const DashboardOverview = () => {
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [cardsRow1, setCardsRow1] = useState([]);
  const [cardsRow2, setCardsRow2] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [newCourses, setNewCourses] = useState([]);

  useEffect(() => {
    let alive = true;
    const toNumber = (val) => {
      if (val === undefined || val === null) return 0;
      if (typeof val === "number" && Number.isFinite(val)) return val;
      if (typeof val === "string") {
        const num = Number(val.replace(/[,\s]/g, ""));
        return Number.isFinite(num) ? num : 0;
      }
      if (Array.isArray(val)) return val.length;
      if (typeof val === "object") {
        const candidates = [
          val.value,
          val.count,
          val.total,
          val.number,
          val.amount,
          val.len,
        ];
        for (const c of candidates) {
          const n = toNumber(c);
          if (Number.isFinite(n) && n !== 0) return n;
        }
        return 0;
      }
      return 0;
    };
    const formatNumber = (n) => toNumber(n).toLocaleString("vi-VN");
    const formatChange = (val, hint = "") => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === "object") {
        const str = val.change ?? val.delta ?? val.text ?? val.label;
        if (typeof str === "string" && str.trim()) return str.trim();
        const num = val.rate ?? val.percent ?? val.percentage ?? val.value ?? val.count;
        if (num !== undefined) {
          const nn = toNumber(num);
          const sign = nn >= 0 ? "+" : "";
          const isPercent = /rate|percent|percentage/i.test(hint);
          return isPercent ? `${sign}${nn}%` : `${sign}${nn}`;
        }
      }
      if (typeof val === "string") {
        const s = val.trim();
        if (!s) return undefined;
        return s.startsWith("+") || s.startsWith("-") ? s : `+${s}`;
      }
      const num = toNumber(val);
      const sign = num >= 0 ? "+" : "";
      const isPercent = /rate|percent|percentage/i.test(hint);
      return isPercent ? `${sign}${num}%` : `${sign}${num}`;
    };

    dashboardService
      .getOverview()
      .then((res) => {
        const raw = res?.data;
        const o = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
        const totalUsers = toNumber(o?.totalUsers ?? o?.usersCount ?? o?.studentsCount ?? o?.students);
        const courses = toNumber(o?.coursesCount ?? o?.totalCourses ?? o?.courses);
        const completedExams = toNumber(o?.completedExams ?? o?.examsCompleted ?? o?.quizCompleted ?? o?.attemptsCompleted);
        const avgScore = toNumber(o?.averageScore ?? o?.avgScore);
        const completionRate = toNumber(o?.courseCompletionRate ?? o?.completionRate);
        const classes = toNumber(o?.classesCount ?? o?.totalClasses);

        const usersChange = o?.usersChange ?? o?.usersChangeRate ?? o?.usersDelta ?? o?.totalUsers?.change;
        const coursesChange = o?.coursesChange ?? o?.coursesDelta ?? o?.coursesCount?.change;
        const examsChange = o?.examsChange ?? o?.examsDelta ?? o?.completedExams?.change;
        const avgScoreChange = o?.avgScoreChange ?? o?.averageScoreDelta ?? o?.averageScore?.change;
        const completionChange = o?.completionRateChange ?? o?.courseCompletionDelta ?? o?.courseCompletionRate?.change;
        const classesChange = o?.classesChange ?? o?.classesDelta ?? o?.classesCount?.change;

        const row1 = [
          {
            title: "Tổng số học viên",
            value: formatNumber(totalUsers),
            change: formatChange(usersChange, "percent"),
          },
          {
            title: "Khóa học",
            value: formatNumber(courses),
            change: formatChange(coursesChange),
            description: (toNumber(o?.newCourses) || 0) > 0 ? `${toNumber(o?.newCourses)} khóa học mới` : undefined,
          },
          {
            title: "Bài thi hoàn thành",
            value: formatNumber(completedExams),
            change: formatChange(examsChange),
          },
        ];

        const row2 = [
          {
            title: "Điểm trung bình",
            value: `${toNumber(avgScore).toFixed(1)}/10`,
            change: formatChange(avgScoreChange),
          },
          {
            title: "Tỷ lệ hoàn thành khóa học",
            value: `${toNumber(completionRate)}%`,
            change: formatChange(completionChange, "percent"),
          },
          {
            title: "Tổng số lớp học",
            value: formatNumber(classes),
            change: formatChange(classesChange),
          },
        ];

        if (alive) {
          setCardsRow1(row1);
          setCardsRow2(row2);
        }
      })
      .catch(() => {
        if (alive) {
          setCardsRow1([]);
          setCardsRow2([]);
        }
      });
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
      .getRecentExams()
      .then((res) => {
        const arr = Array.isArray(res?.data) ? res.data : [];
        if (alive) setRecentQuizzes(arr);
      })
      .catch(() => { if (alive) setRecentQuizzes([]); });

    dashboardService
      .getNewCourses()
      .then((res) => {
        const arr = Array.isArray(res?.data) ? res.data : [];
        if (alive) setNewCourses(arr);
      })
      .catch((err) => {
        console.error("Failed to fetch new courses:", err);
        if (alive) setNewCourses([]);
      });

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
            {cardsRow1.map((card, index) => (
              <StatCard key={index} {...card} />
            ))}
          </div>
        </section>
        {/* === HÀNG 2: 4 THẺ STATS (biến thể) === */}
        <section className="col-span-12">
          <div className="stat-card-grid">
            {cardsRow2.map((card, index) => (
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


        {/* === HÀNG 6: BẢNG  === */}
        <section className="dashboard-card col-span-12 lg-col-span-6">
          <h3 className="dashboard-card-title">Khóa học mới tạo</h3>
          <NewCoursesTable courses={newCourses} />
        </section>
        <section className="dashboard-card col-span-12 lg-col-span-6">
          <h3 className="dashboard-card-title">Bài kiểm tra gần đây</h3>
          <RecentQuizzesTable quizzes={recentQuizzes} />
        </section>
      </div>
    </div>
  );
};

export default DashboardOverview;
