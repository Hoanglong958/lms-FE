import React, { useState } from "react";
import "./QuestionBankBulk.css";
import { useNavigate } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { questionService } from "@utils/questionService";

export default function QuestionBankBulk() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Excel Tab State
    const [importFile, setImportFile] = useState(null);

    const [notification, setNotification] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const showNotification = (title, message, type = "info") => {
        setNotification({ isOpen: true, title, message, type });
    };

    // --- Actions ---

    const handleImportExcel = async () => {
        if (!importFile) {
            showNotification("Lỗi", "Vui lòng chọn file Excel.", "warning");
            return;
        }

        setLoading(true);
        try {
            await questionService.uploadExcel(importFile);
            showNotification("Thành công", "Import câu hỏi từ Excel thành công!", "success");
            setTimeout(() => navigate("/admin/question-bank"), 1500);
        } catch (error) {
            console.error(error);
            showNotification("Lỗi", "Import thất bại. Vui lòng kiểm tra file Excel.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="qb-bulk-container">
            <div className="qb-header">
                <h2 className="qb-title">Thêm Câu Hỏi Mới</h2>
                <p className="qb-desc">Tạo nhiều câu hỏi cùng lúc bằng cách tải lên file Excel</p>
            </div>

            <div className="qb-content-card">
                <div className="qb-tab-content">
                    <div className="qb-excel-section">
                        <div className="qb-import-area">
                            <div className="qb-file-upload-box">
                                <label htmlFor="file-upload" className="qb-file-label">
                                    <span className="qb-icon-folder">📂</span>
                                    <span className="qb-text-main">Chọn file Excel (.xlsx, .xls)</span>
                                    <span className="qb-text-sub">{importFile ? importFile.name : "Chưa chọn file"}</span>
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        <div className="qb-action-row">
                            <button className="qb-btn cancel" onClick={() => navigate("/admin/question-bank")}>
                                Hủy
                            </button>
                            <button className="qb-btn submit" onClick={handleImportExcel} disabled={loading}>
                                {loading ? "Đang xử lý..." : "Import Excel"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </div>
    );
}
