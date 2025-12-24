import React, { useState } from "react";
import "./QuestionBankBulk.css";
import { useNavigate } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { questionService } from "@utils/questionService";
import {
    Upload,
    Download,
    ArrowLeft,
    CheckCircle2,
    Info,
    FileSpreadsheet,
    FileText,
    Zap
} from "lucide-react";

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
            {/* Breadcrumb */}
            <div className="qb-breadcrumb-wrapper">
                <div className="qb-breadcrumb">
                    <button onClick={() => navigate("/admin/question-bank")} className="qb-back-link">
                        <ArrowLeft size={16} /> Ngân hàng câu hỏi
                    </button>
                    <span className="qb-sep">/</span>
                    <span className="qb-current">Thêm hàng loạt</span>
                </div>
            </div>

            {/* Page Header */}
            <div className="qb-page-header">
                <div className="qb-header-icon">
                    <Upload size={32} color="#fff" />
                </div>
                <div className="qb-header-content">
                    <h1 className="qb-title">Thêm Câu Hỏi Mới</h1>
                    <p className="qb-desc">Cập nhật nhanh ngân hàng câu hỏi bằng tệp dữ liệu Excel</p>
                </div>
            </div>

            <div className="qb-main-layout">
                {/* Left Side: Upload Section */}
                <div className="qb-upload-column">
                    <div className="qb-main-card">
                        <div className={`qb - upload - zone ${importFile ? 'has-file' : ''} `}>
                            <label htmlFor="file-upload" className="qb-upload-label">
                                <div className="qb-upload-circle">
                                    <Upload size={48} className="text-orange-500" />
                                </div>
                                <h2 className="qb-upload-title">Tải lên tệp Excel của bạn</h2>
                                <p className="qb-upload-subtitle">Kéo thả hoặc nhấn để chọn tệp</p>

                                <div className="qb-file-types">
                                    <span>.xlsx</span>
                                    <span>.xls</span>
                                </div>

                                {importFile && (
                                    <div className="qb-selected-file">
                                        <FileSpreadsheet size={20} className="text-orange-500" />
                                        <span>{importFile.name}</span>
                                        <CheckCircle2 size={16} className="text-green-500" />
                                    </div>
                                )}
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={(e) => setImportFile(e.target.files[0])}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="qb-card-actions">
                            <button className="qb-btn-cancel" onClick={() => navigate("/admin/question-bank")}>
                                Hủy bỏ
                            </button>
                            <button
                                className="qb-btn-import"
                                onClick={handleImportExcel}
                                disabled={loading || !importFile}
                            >
                                {loading ? (
                                    <div className="qb-spinner"></div>
                                ) : (
                                    <>
                                        <Zap size={18} />
                                        <span>Bắt đầu Import</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Template Card */}
                    <div className="qb-template-card">
                        <div className="qb-template-icon">
                            <FileSpreadsheet size={32} color="#fff" />
                        </div>
                        <div className="qb-template-content">
                            <h3>Tệp mẫu Excel</h3>
                            <p>Tải xuống file mẫu với đầy đủ các tiêu đề cột chuẩn để import dữ liệu đúng định dạng</p>
                            <button className="qb-btn-template">
                                <Download size={16} />
                                <span>Tải tệp mẫu (.xlsx)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Instructions */}
                <div className="qb-info-column">
                    <div className="qb-instructions-card">
                        <div className="qb-instructions-header">
                            <div className="qb-info-icon-circle">
                                <Info size={24} color="#fff" />
                            </div>
                            <h3>Hướng dẫn</h3>
                        </div>

                        <div className="qb-steps-list">
                            <div className="qb-step-item">
                                <div className="qb-step-number">1</div>
                                <div className="qb-step-content">
                                    <h4>Cột Câu hỏi</h4>
                                    <p>Nội dung câu hỏi cần rõ ràng và đầy đủ.</p>
                                </div>
                            </div>
                            <div className="qb-step-item">
                                <div className="qb-step-number">2</div>
                                <div className="qb-step-content">
                                    <h4>Cột Danh mục</h4>
                                    <p>Tên danh mục (ví dụ: Java, HTML, CSS).</p>
                                </div>
                            </div>
                            <div className="qb-step-item">
                                <div className="qb-step-number">3</div>
                                <div className="qb-step-content">
                                    <h4>Cột Lựa chọn</h4>
                                    <p>Ngăn cách các đáp án bằng dấu phẩy (,).</p>
                                </div>
                            </div>
                            <div className="qb-step-item">
                                <div className="qb-step-number">4</div>
                                <div className="qb-step-content">
                                    <h4>Đáp án đúng</h4>
                                    <p>Phải khớp hoàn toàn với một lựa chọn.</p>
                                </div>
                            </div>
                        </div>

                        <div className="qb-warning-box">
                            <div className="qb-warning-header">
                                <Info size={16} className="text-orange-600" />
                                <span><strong>Lưu ý:</strong> Hệ thống sẽ tự động bỏ qua các câu hỏi có định dạng không hợp lệ hoặc thiếu thông tin bắt buộc.</span>
                            </div>
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
