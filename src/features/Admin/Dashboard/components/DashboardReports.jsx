// Đường dẫn: src/features/Admin/Dashboard/components/DashboardReports.jsx

import React, { useEffect, useState } from "react";
import "../Dashboard.css";

// Import service call API
import { dashboardService } from "@utils/dashboardService";

const DashboardReports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await dashboardService.getQuizReports();
        if (!mounted) return;

        const apiData = res?.data ?? [];

        // Map về giống format UI đã dùng trước đây
        const mapped = apiData.map((r) => ({
          quizId: r.quizId,
          title: r.title,
          attempts: r.attempts,
          avgScore: r.avgScore,
          passRate: r.passRate,
          description: `Số lượt thi: ${r.attempts} | Điểm TB: ${r.avgScore} | Pass rate: ${r.passRate}%`,
        }));

        setReports(mapped);
      } catch (error) {
        console.error("Load quiz reports failed:", error);
      }
    })();

    return () => (mounted = false);
  }, []);

  return (
    <div className="dashboard-reports-content">
      {/* Header */}
      <div className="dashboard-card">
        <h3 className="reports-header-title">Xuất báo cáo chi tiết</h3>
      </div>

      {/* Danh sách báo cáo */}
      <div className="reports-list">
        {reports.map((report, index) => (
          <div key={index} className="dashboard-card report-item">

            {/* Bên trái */}
            <div>
              <h4 className="report-item-title">{report.title}</h4>
              <p className="report-item-description">{report.description}</p>
            </div>

            {/* Bên phải */}
            <div className="report-item-actions">
              <button className="btn-export btn-excel">
                <span>Excel</span>
              </button>
              <button className="btn-export btn-pdf">
                <span>PDF</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Endpoint */}
      <div className="api-endpoint-box">
        <span className="api-label">API Endpoint:</span>
        <span className="api-method">GET</span>
        /api/v1/dashboard/quiz-reports
      </div>
    </div>
  );
};

export default DashboardReports;
