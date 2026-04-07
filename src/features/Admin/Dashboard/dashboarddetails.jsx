import React, { useState } from "react";
import "./Dashboard.css"; // Import file CSS chung
import { detailedReports } from "./mock/dashboardMock.js";
import api from "../../../services/api";
import { useNotification } from "@shared/notification";

const DashboardDetails = () => {
  const [loading, setLoading] = useState(false);
  const { error: notifyError } = useNotification();
  const reports = detailedReports;

  const handleExport = async (reportId, type) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/reports/export`, {
        params: { report: reportId, type },
        responseType: "blob",
      });

      // Tạo URL từ blob và thực hiện tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${reportId}_report_${new Date().getTime()}.${type === "excel" ? "xlsx" : "pdf"
        }`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      notifyError("Xuất báo cáo thất bại, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-reports-content">
      {/* Phần tiêu đề "Xuất báo cáo chi tiết" */}
      <div className="dashboard-card">
        <h3 className="reports-header-title">
          Xuất báo cáo chi tiết {loading && <span className="loading-spinner">⏳</span>}
        </h3>
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
              <button
                className="btn-export btn-excel"
                onClick={() => handleExport(report.id, "excel")}
                disabled={loading}
              >
                <span>Excel</span>
              </button>
              <button
                className="btn-export btn-pdf"
                onClick={() => handleExport(report.id, "pdf")}
                disabled={loading}
              >
                <span>PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* API Endpoint */}
      <div className="api-endpoint-box">
        <span className="api-label">API Endpoint:</span>{" "}
        <span className="api-method">GET</span> /api/v1/reports/export?report=...&type=...
      </div>
    </div>
  );
};

export default DashboardDetails;
