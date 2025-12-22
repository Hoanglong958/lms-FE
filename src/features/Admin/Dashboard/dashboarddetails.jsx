// Đường dẫn: src/features/Admin/Dashboard/dashboarddetails.jsx
import React from "react";
import "./Dashboard.css"; // Import file CSS chung
import { detailedReports } from "./mock/dashboardMock.js";

const DashboardDetails = () => {
  const reports = detailedReports;

  return (
    <div className="dashboard-reports-content">
      {/* Phần tiêu đề "Xuất báo cáo chi tiết" */}
      <div className="dashboard-card">
        <h3 className="reports-header-title">Xuất báo cáo chi tiết</h3>
      </div>

      {/* Danh sách các báo cáo */}
      <div className="reports-list">
        {reports.map((report, index) => (
          <div key={index} className="dashboard-card report-item">
            {/* Cột bên trái: Tiêu đề và mô tả */}
            <div>
              <h4 className="report-item-title">{report.title}</h4>
              <p className="report-item-description">{report.description}</p>
            </div>
            {/* Cột bên phải: Nút bấm */}
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

      {/* API Endpoint */}
      <div className="api-endpoint-box">
        <span className="api-label">API Endpoint:</span>{" "}
        <span className="api-method">GET</span>{" "}
        /api/v1/reports/export?type=excel&from=...&to=...
      </div>
    </div>
  );
};

export default DashboardDetails;
