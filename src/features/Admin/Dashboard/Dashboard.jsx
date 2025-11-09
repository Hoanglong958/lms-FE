import React, { useState, useEffect } from "react";
import FilterBar from "./components/FilterBar";
import OverviewCards from "./components/OverviewCards";
import ChartSection from "./components/ChartSection";
import DetailTable from "./components/DetailTable";
import TopLists from "./components/TopLists";
import RecentActivity from "./components/RecentActivity";
import { dashboardMock } from "./mock/dashboardMock";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    category: "All",
    instructor: "All",
  });

  const [data, setData] = useState({
    ...dashboardMock,
    overview: {
      totalStudents: 0,
      studentsInClass: 0,
      totalCourses: 0,
      coursesWithClass: 0,
      freeCourses: 0,
      paidCourses: 0,
      monthlyRevenue: 0,
    },
  });

  useEffect(() => {
    const filteredData = { ...dashboardMock };

    // Filter courses
    filteredData.topCourses = dashboardMock.topCourses.filter(
      (c) =>
        (filters.category === "All" || c.category === filters.category) &&
        (filters.instructor === "All" || c.instructor === filters.instructor)
    );

    const selectedCourses = filteredData.topCourses.map((c) => c.name);

    // Filter students
    filteredData.topStudents = dashboardMock.topStudents.filter((s) =>
      selectedCourses.includes(s.course)
    );

    const selectedInstructors = filteredData.topCourses.map(
      (c) => c.instructor
    );
    filteredData.topInstructors = dashboardMock.topInstructors.filter((i) =>
      selectedInstructors.includes(i.name)
    );

    // Overview data
    filteredData.overview = {
      totalStudents: filteredData.topStudents.length,
      studentsInClass: Math.min(filteredData.topStudents.length, 150),
      totalCourses: filteredData.topCourses.length,
      coursesWithClass: filteredData.topCourses.length,
      freeCourses: filteredData.topCourses.filter((c) => c.category === "Free")
        .length,
      paidCourses: filteredData.topCourses.filter((c) => c.category !== "Free")
        .length,
      monthlyRevenue: filteredData.topCourses.reduce(
        (sum, c) => sum + c.revenue,
        0
      ),
    };

    // Charts: student growth
    const studentMap = {};
    filteredData.topStudents.forEach((s) => {
      studentMap[s.month] = (studentMap[s.month] || 0) + 1;
    });
    filteredData.charts.studentGrowth = Object.entries(studentMap).map(
      ([month, students]) => ({ month, students })
    );

    // Charts: revenue
    const revenueMap = {};
    filteredData.topCourses.forEach((c) => {
      revenueMap[c.month] = (revenueMap[c.month] || 0) + c.revenue;
    });
    filteredData.charts.revenue = Object.entries(revenueMap).map(
      ([month, revenue]) => ({ month, revenue })
    );

    // Charts: completion rate
    const completionMap = {};
    filteredData.topStudents.forEach((s) => {
      if (!completionMap[s.course]) completionMap[s.course] = [];
      completionMap[s.course].push(s.completionRate);
    });
    filteredData.charts.completionRate = Object.entries(completionMap).map(
      ([course, rates]) => ({
        course,
        completion: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length),
      })
    );

    // Charts: course type
    const typeMap = {};
    filteredData.topCourses.forEach((c) => {
      typeMap[c.category] = (typeMap[c.category] || 0) + 1;
    });
    filteredData.charts.courseType = Object.entries(typeMap).map(
      ([type, count]) => ({ type, count })
    );

    setData(filteredData);
  }, [filters]);

  return (
    <div className="admin-dashboard-page">
      <div className="">
        <div className="filter-bar-container">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            data={dashboardMock}
          />
        </div>
      </div>
      <div className={styles.dashboardContainer}>
        <OverviewCards overview={data.overview} />
        <ChartSection charts={data.charts} />
        <DetailTable data={data} />
        <TopLists
          topCourses={data.topCourses}
          topInstructors={data.topInstructors}
          topStudents={data.topStudents}
        />
        <RecentActivity activities={data.recentActivity} />
      </div>
    </div>
  );
}
