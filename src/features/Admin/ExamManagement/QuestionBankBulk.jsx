import React, { useState } from "react";
import "./styles/QuestionBankBulk.css";
import { useNavigate } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { questionService } from "@utils/questionService";

export default function QuestionBankBulk() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("json"); // 'json' | 'excel'

    // JSON Tab State
    const [bulkJSON, setBulkJSON] = useState(
        '[{"category":"Java","questionText":"Ví dụ câu hỏi?","options":["A","B","C","D"],"correctAnswer":"A","explanation":"Giải thích"}]'
    );

    // Excel Tab State
    const [importType, setImportType] = useState("file"); // 'file' | 'url'
    const [importFile, setImportFile] = useState(null);
    const [importUrl, setImportUrl] = useState("");

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

    const handleSubmitJSON = async () => {
        setLoading(true);
        let arr;
        try {
            arr = JSON.parse(bulkJSON);
            if (!Array.isArray(arr)) throw new Error("Format invalid");
        } catch {
            showNotification("Lỗi", "Định dạng JSON không hợp lệ.", "error");
            setLoading(false);
            return;
        }

        if (arr.length === 0) {
            showNotification("Lỗi", "Danh sách câu hỏi trống.", "warning");
            setLoading(false);
            return;
        }

        try {
            await questionService.bulkCreate(arr);
            showNotification("Thành công", `Đã tạo ${arr.length} câu hỏi thành công!`, "success");
            const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
            const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";
            setTimeout(() => navigate(`/${isAdmin ? "admin" : "teacher"}/question-bank`), 1500);
        } catch (error) {
            console.error(error);
            showNotification("Lỗi", "Tạo câu hỏi thất bại.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleImportExcel = async () => {
        if (importType === 'file' && !importFile) {
            showNotification("Lỗi", "Vui lòng chọn file Excel.", "warning");
            return;
        }
        if (importType === 'url' && !importUrl) {
            showNotification("Lỗi", "Vui lòng nhập URL file Excel.", "warning");
            return;
        }

        setLoading(true);
        try {
            if (importType === 'file') {
                await questionService.uploadExcel(importFile);
            } else {
                await questionService.importUrl(importUrl);
            }
            showNotification("Thành công", "Import câu hỏi từ Excel thành công!", "success");
            const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
            const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";
            setTimeout(() => navigate(`/${isAdmin ? "admin" : "teacher"}/question-bank`), 1500);
        } catch (error) {
            console.error(error);
            showNotification("Lỗi", "Import thất bại. Vui lòng kiểm tra file/URL.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="qb-bulk-container">
            <div className="qb-header">
                <h2 className="qb-title">Thêm Câu Hỏi Mới</h2>
                <p className="qb-desc">Tạo nhiều câu hỏi cùng lúc bằng JSON hoặc Import Excel</p>
            </div>

            <div className="qb-content-card">
                {/* Tabs */}
                <div className="qb-tabs">
                    <div
                        className={`qb-tab-item ${activeTab === 'json' ? 'active' : ''}`}
                        onClick={() => setActiveTab('json')}
                    >
                        Dán JSON
                    </div>
                    <div
                        className={`qb-tab-item ${activeTab === 'excel' ? 'active' : ''}`}
                        onClick={() => setActiveTab('excel')}
                    >
                        Import Excel
                    </div>
                </div>

                <div className="qb-tab-content">
                    {activeTab === 'json' ? (
                        <div className="qb-json-section">
                            <p className="qb-guideline">Nhập danh sách câu hỏi theo định dạng mảng JSON:</p>
                            <textarea
                                className="qb-textarea-large"
                                value={bulkJSON}
                                onChange={(e) => setBulkJSON(e.target.value)}
                                spellCheck="false"
                            />
                            <div className="qb-action-row">
                                <button className="qb-btn cancel" onClick={() => {
                                    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
                                    const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";
                                    navigate(`/${isAdmin ? "admin" : "teacher"}/question-bank`);
                                }}>
                                    Hủy
                                </button>
                                <button className="qb-btn submit" onClick={handleSubmitJSON} disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Tạo câu hỏi (JSON)"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="qb-excel-section">
                            <div className="qb-sub-tabs">
                                <button
                                    className={`qb-sub-tab-btn ${importType === 'file' ? 'active' : ''}`}
                                    onClick={() => { setImportType('file'); setImportFile(null); }}
                                >
                                    File Upload
                                </button>
                                <button
                                    className={`qb-sub-tab-btn ${importType === 'url' ? 'active' : ''}`}
                                    onClick={() => { setImportType('url'); setImportUrl(""); }}
                                >
                                    URL Link
                                </button>
                            </div>

                            <div className="qb-import-area">
                                {importType === 'file' ? (
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
                                ) : (
                                    <div className="qb-url-input-box">
                                        <label className="qb-label">Nhập URL của file Excel:</label>
                                        <input
                                            type="text"
                                            className="qb-input-field"
                                            placeholder="https://example.com/data.xlsx"
                                            value={importUrl}
                                            onChange={(e) => setImportUrl(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="qb-action-row">
                                <button className="qb-btn cancel" onClick={() => {
                                    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
                                    const isAdmin = String(user?.role || "").toUpperCase() === "ROLE_ADMIN";
                                    navigate(`/${isAdmin ? "admin" : "teacher"}/question-bank`);
                                }}>
                                    Hủy
                                </button>
                                <button className="qb-btn submit" onClick={handleImportExcel} disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Import Excel"}
                                </button>
                            </div>
                        </div>
                    )}
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
