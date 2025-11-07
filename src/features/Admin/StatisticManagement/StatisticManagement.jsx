import React, { useState, useEffect } from "react";
import styles from "./StatisticManagement.module.css";
import FilterBar from "./components/FilterBar.jsx";
import OverviewCards from "./components/OverviewCards.jsx";
import ChartSection from "./components/ChartSection.jsx";
import DetailTable from "./components/DetailTable.jsx";
import { statisticMock } from "./mock/statisticData.js";

export default function StatisticManagement() {
  const [filter, setFilter] = useState({ period: "week", type: "all" });
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      let newData = null;

      if (filter.type === "all") {
        // ✅ Lấy dữ liệu sẵn có từ mock.all
        newData = statisticMock.all?.[filter.period];
      } else {
        // ✅ Lấy dữ liệu theo loại
        newData = statisticMock[filter.type]?.[filter.period];
      }

      // Nếu không có thì fallback về all.week
      if (!newData) {
        console.warn("⚠️ Không tìm thấy dữ liệu cho filter:", filter);
        newData = statisticMock.all.week;
      }

      setData(newData);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [filter]);

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>Thống kê hệ thống</h1>
      <FilterBar filter={filter} onFilterChange={setFilter} />
      <OverviewCards data={data.overview} />
      <ChartSection data={data.chart} />
      <h3 className={styles.tableTitle}>Chi tiết hoạt động</h3>
      <DetailTable data={data.table} />
    </div>
  );
}
