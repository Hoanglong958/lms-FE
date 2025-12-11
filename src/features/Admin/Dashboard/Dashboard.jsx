// src/features/Admin/Dashboard/Dashboard.jsx

import React, { useEffect, useState } from "react";
import "./Dashboard.css";

import { dashboardService } from "@utils/dashboardService";

import StatCard from "./components/StatCard";
import UserGrowthChart from "./components/UserGrowthChart";
import CourseProgressChart from "./components/CourseProgressChart";

import NewUsersTable from "./components/NewUsersTable";
import NewCoursesTable from "./components/NewCoursesTable";
import RecentQuizzesTable from "./components/RecentQuizzesTable";
import RankingList from "./components/RankingList";

const Dashboard = () => {
  const [cardsRow1, setCardsRow1] = useState([]);
  const [cardsRow2, setCardsRow2] = useState([]);

  const [newUsers, setNewUsers] = useState([]);
  const [newCourses, setNewCourses] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  const [growthMonth, setGrowthMonth] = useState([]);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    let mounted = true;

    // ------------------------------
    // LOAD OVERVIEW
    // ------------------------------
    (async () => {
      try {
        const res = await dashboardService.getOverview();
        const d = res?.data ?? null;
        if (!mounted || !d) return;

        const row1 = [
          {
            title: "Tổng học viên",
            value: d.totalUsers?.value ?? 0,
            change: d.totalUsers?.growthPercentage ?? 0,
          },
          {
            title: "Tổng khóa học",
            value: d.totalCourses?.value ?? 0,
            change: d.totalCourses?.growthPercentage ?? 0,
          },
          {
            title: "Tổng bài thi",
            value: d.totalExams?.value ?? 0,
            change: d.totalExams?.growthPercentage ?? 0,
          },
        ];

        const row2 = [
          {
            title: "Điểm trung bình",
            value: d.averageExamScore?.value ?? 0,
            change: d.averageExamScore?.growthPercentage ?? 0,
          },
          {
            title: "Tỷ lệ hoàn thành",
            value: d.courseCompletionRate?.value ?? 0,
            change: d.courseCompletionRate?.growthPercentage ?? 0,
          },
          {
            title: "Tổng lớp học",
            value: d.totalClasses?.value ?? 0,
            change: d.totalClasses?.growthPercentage ?? 0,
          },
        ];

        setCardsRow1(row1);
        setCardsRow2(row2);

        setRecentQuizzes(d.recentQuizzes ?? []);
        setTopStudents(d.topStudents ?? []);

        setGrowthMonth([]);
        setProgressData([]);
      } catch (e) {
        console.error("Dashboard load error:", e);
      }
    })();

    // ------------------------------
    // LOAD NEW USERS
    // ------------------------------
    (async () => {
      try {
        const res = await dashboardService.getNewUsers();
        if (!mounted) return;

        const apiUsers = res?.data ?? [];

        const mapped = apiUsers.map((u) => ({
          id: u.id,
          name: u.fullName,
          email: u.gmail,
          role: u.role,
          date: new Date(u.createdAt).toLocaleDateString("vi-VN"),
        }));

        setNewUsers(mapped);
      } catch (err) {
        console.error("Load new users API failed:", err);
      }
    })();

    // ------------------------------
    // LOAD NEW COURSES
    // ------------------------------
    (async () => {
      try {
        const res = await dashboardService.getNewCourses();
        if (!mounted) return;

        const apiCourses = res?.data ?? [];

        const mapped = apiCourses.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.level ?? "Không rõ",
          instructor: c.instructorName,
          status: "Công khai",
        }));

        setNewCourses(mapped);
      } catch (err) {
        console.error("Load new courses API failed:", err);
      }
    })();

    // ------------------------------
    // LOAD USER GROWTH (MONTH)
    // ------------------------------
    (async () => {
      try {
        const res = await dashboardService.getUserGrowthByMonth();
        if (!mounted) return;

        const api = res?.data ?? [];

        const mapped = api.map((item) => ({
          month: item.month,
          "Người dùng": item.count,
        }));

        setGrowthMonth(mapped);
      } catch (err) {
        console.error("Load user growth API failed:", err);
      }
    })();

    return () => (mounted = false);
  }, []);

  return (
    <div className="dashboard-main">
      <div className="dashboard-overview-grid">

        {/* ROW 1 */}
        <section className="col-span-12">
          <div className="stat-card-grid">
            {cardsRow1.map((card, i) => (
              <StatCard key={i} {...card} />
            ))}
          </div>
        </section>

        {/* ROW 2 */}
        <section className="col-span-12">
          <div className="stat-card-grid">
            {cardsRow2.map((card, i) => (
              <StatCard key={i} {...card} />
            ))}
          </div>
        </section>

        {/* USER GROWTH */}
        <section className="dashboard-card col-span-12 lg-col-span-7">
          <h3 className="dashboard-card-title">Tăng trưởng người dùng</h3>
          <UserGrowthChart data={growthMonth} />
        </section>

        {/* COURSE PROGRESS */}
        <section className="dashboard-card col-span-12 lg-col-span-5">
          <h3 className="dashboard-card-title">Tiến độ khóa học</h3>
          <CourseProgressChart data={progressData} />
        </section>

        {/* NEW USERS */}
        <section className="dashboard-card col-span-12 lg-col-span-7">
          <h3 className="dashboard-card-title">Người dùng mới</h3>
          <NewUsersTable users={newUsers} />
        </section>

        {/* TOP STUDENTS */}
        <section className="dashboard-card col-span-12 lg-col-span-5">
          <RankingList students={topStudents} />
        </section>

        {/* NEW COURSES */}
        <section className="dashboard-card col-span-12 lg-col-span-6">
          <h3 className="dashboard-card-title">Khóa học mới</h3>
          <NewCoursesTable courses={newCourses} />
        </section>

        {/* RECENT QUIZZES */}
        <section className="dashboard-card col-span-12 lg-col-span-6">
          <h3 className="dashboard-card-title">Quiz gần đây</h3>
          <RecentQuizzesTable quizzes={recentQuizzes} />
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
