import React, { useState, useEffect } from "react";
import { registrationService } from "@utils/registrationService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import {
    Search,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    Banknote,
    ArrowUpDown,
    RefreshCw,
    Download,
    ChevronLeft,
    ChevronRight,
    Eye,
    Printer,
    FileText,
    Mail,
    Phone
} from "lucide-react";
import "./AdminRegistrations.css";

export default function AdminRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [bankInfo, setBankInfo] = useState(null);
    const [notification, setNotification] = useState({ isOpen: false, title: "", message: "", type: "info" });
    const [confirming, setConfirming] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "registrationDate", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const pageSize = 10;

    useEffect(() => {
        fetchAll();
        fetchBankInfo();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await registrationService.getAllRegistrations();
            setRegistrations(res.data?.data || []);
        } catch (err) {
            console.error(err);
            setNotification({
                isOpen: true,
                title: "Lỗi",
                message: "Không thể tải danh sách đăng ký",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchBankInfo = async () => {
        try {
            const res = await registrationService.getBankInfo();
            setBankInfo(res.data?.data || null);
        } catch (err) {
            console.error("Không thể tải thông tin ngân hàng");
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await registrationService.exportExcel();
            // Handle blob download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'registrations.xls');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export Excel failed:", err);
            alert("Không thể xuất file Excel");
        }
    };

    const handlePrintInvoice = async (id) => {
        try {
            const response = await registrationService.exportPdf(id);
            // Handle blob download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export PDF failed:", err);
            alert("Không thể xuất hóa đơn PDF");
        }
    };

    const handleConfirm = async (id) => {
        setConfirming(id);
        try {
            await registrationService.confirmPayment(id);
            setNotification({
                isOpen: true,
                title: "Thành công!",
                message: "Đã xác nhận thanh toán và thêm sinh viên vào lớp.",
                type: "success"
            });
            fetchAll();
        } catch (err) {
            setNotification({
                isOpen: true,
                title: "Lỗi",
                message: err.response?.data?.data || "Không thể xác nhận thanh toán.",
                type: "error"
            });
        } finally {
            setConfirming(null);
        }
    };

    const handleBulkConfirm = async () => {
        if (selectedRows.length === 0) return;

        if (!window.confirm(`Xác nhận ${selectedRows.length} khoản thanh toán đã chọn?`)) return;

        for (const id of selectedRows) {
            await handleConfirm(id);
        }
        setSelectedRows([]);
    };

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
        });
    };

    const formatAmount = (amt) => new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amt || 0);

    const formatDate = (dt) => {
        if (!dt) return "—";
        const date = new Date(dt);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Filter và sort
    const filtered = registrations
        .filter(r => {
            const matchStatus = filter === "ALL" || r.paymentStatus === filter;
            const q = search.toLowerCase();
            const matchSearch = !q ||
                (r.studentName || "").toLowerCase().includes(q) ||
                (r.courseTitle || "").toLowerCase().includes(q) ||
                (r.transferRef || "").toLowerCase().includes(q) ||
                (r.studentEmail || "").toLowerCase().includes(q) ||
                (r.studentPhone || "").includes(q);
            return matchStatus && matchSearch;
        })
        .sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === "amount") {
                aVal = a.amount || 0;
                bVal = b.amount || 0;
            }

            if (sortConfig.key === "registrationDate" || sortConfig.key === "paymentDate") {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            }

            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });

    // Pagination
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginatedData = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Stats
    const stats = {
        total: registrations.length,
        pending: registrations.filter(r => r.paymentStatus === "PENDING").length,
        paid: registrations.filter(r => r.paymentStatus === "PAID").length,
        cancelled: registrations.filter(r => r.paymentStatus === "CANCELLED").length,
        totalAmount: registrations
            .filter(r => r.paymentStatus === "PAID")
            .reduce((sum, r) => sum + (r.amount || 0), 0)
    };

    const toggleRowSelection = (id) => {
        setSelectedRows(prev =>
            prev.includes(id)
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
    };

    const toggleAllRows = () => {
        if (selectedRows.length === paginatedData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedData.map(r => r.id));
        }
    };

    if (loading) {
        return (
            <div className="admin-reg-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="admin-registrations-container">
            {/* Breadcrumbs */}
            <div className="admin-breadcrumbs">
                <span className="breadcrumb-active">Quản lý đóng học phí</span>
                <span className="breadcrumb-separator"> / </span>
                <span className="breadcrumb-item">Dashboard</span>
                <span className="breadcrumb-separator"> / </span>
                <span className="breadcrumb-item">Tất cả giao dịch</span>
            </div>

            {/* Header Section */}
            <div className="admin-reg-header">
                <div className="header-left">
                    <div className="header-icon-box">
                        <FileText size={24} />
                    </div>
                    <div className="header-title-content">
                        <h1>Quản lý đóng học phí</h1>
                        <p className="header-subtitle">
                            Xác nhận thanh toán và quản lý đăng ký khóa học
                        </p>
                    </div>
                </div>

                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchAll}>
                        <RefreshCw size={16} />
                        <span className="btn-text">Làm mới</span>
                    </button>
                    <button className="btn-export" onClick={handleExportExcel}>
                        <Download size={16} />
                        <span className="btn-text">Xuất Excel</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <Banknote size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Tổng đăng ký</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon pending">
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Chờ xác nhận</span>
                        <span className="stat-value">{stats.pending}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon paid">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Đã thanh toán</span>
                        <span className="stat-value">{stats.paid}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon revenue">
                        <Banknote size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Doanh thu</span>
                        <span className="stat-value">{formatAmount(stats.totalAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Bank Info Banner */}
            {bankInfo && (
                <div className="bank-info-banner">
                    <div className="bank-info-icon">
                        <Banknote size={20} />
                    </div>
                    <div className="bank-info-content">
                        <div className="bank-info-row">
                            <strong>{bankInfo.bankName}</strong>
                            <span className="bank-separator">•</span>
                            <span>STK: <code>{bankInfo.accountNo}</code></span>
                            <span className="bank-separator">•</span>
                            <span>Chủ TK: <strong>{bankInfo.accountName}</strong></span>
                        </div>
                        <p className="bank-info-hint">
                            💡 Đối chiếu nội dung chuyển khoản với cột "Mã TT" để xác nhận
                        </p>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="admin-reg-toolbar">
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, SĐT, khóa học, mã TT..."
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className="toolbar-actions">
                    <div className="filter-group">
                        <Filter className="filter-icon" size={18} />
                        <select
                            className="filter-select"
                            value={filter}
                            onChange={e => {
                                setFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="PENDING">⏳ Chờ xác nhận</option>
                            <option value="PAID">✓ Đã thanh toán</option>
                            <option value="CANCELLED">✗ Đã hủy</option>
                        </select>
                    </div>

                    {selectedRows.length > 0 && (
                        <button
                            className="btn-bulk-confirm"
                            onClick={handleBulkConfirm}
                        >
                            <CheckCircle size={16} />
                            Xác nhận ({selectedRows.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="reg-table">
                    <thead>
                        <tr>
                            <th className="th-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                    onChange={toggleAllRows}
                                />
                            </th>
                            <th className="th-sortable" onClick={() => handleSort("id")}>
                                ID <ArrowUpDown size={14} />
                            </th>
                            <th className="th-sortable" onClick={() => handleSort("studentName")}>
                                Sinh viên <ArrowUpDown size={14} />
                            </th>
                            <th>Khóa học</th>
                            <th className="th-sortable" onClick={() => handleSort("amount")}>
                                Học phí <ArrowUpDown size={14} />
                            </th>
                            <th>Mã chuyển khoản</th>
                            <th className="th-sortable" onClick={() => handleSort("registrationDate")}>
                                Ngày ĐK <ArrowUpDown size={14} />
                            </th>
                            <th className="th-sortable" onClick={() => handleSort("paymentDate")}>
                                Ngày nộp <ArrowUpDown size={14} />
                            </th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="empty-state">
                                    <div className="empty-state-content">
                                        <Search size={48} />
                                        <p>Không tìm thấy kết quả phù hợp</p>
                                        <button onClick={() => {
                                            setSearch("");
                                            setFilter("ALL");
                                        }}>
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map(r => (
                                <tr
                                    key={r.id}
                                    className={r.paymentStatus === "PENDING" ? "row-pending" : ""}
                                >
                                    <td className="td-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(r.id)}
                                            onChange={() => toggleRowSelection(r.id)}
                                            disabled={r.paymentStatus !== "PENDING"}
                                        />
                                    </td>
                                    <td className="td-id">#{r.id}</td>
                                    <td>
                                        <div className="student-info">
                                            <div className="student-avatar">
                                                {(r.studentName || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="student-details">
                                                <span className="student-name">{r.studentName}</span>
                                                <div className="student-contact-small">
                                                    <span className="contact-item"><Mail size={12} /> {r.studentEmail}</span>
                                                    <span className="contact-item"><Phone size={12} /> {r.studentPhone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="td-course">
                                        <span className="course-title" title={r.courseTitle}>
                                            {r.courseTitle}
                                        </span>
                                    </td>
                                    <td className="td-amount">{formatAmount(r.amount)}</td>
                                    <td>
                                        <code className="transfer-ref">{r.transferRef || "—"}</code>
                                    </td>
                                    <td>{formatDate(r.registrationDate)}</td>
                                    <td>{formatDate(r.paymentDate)}</td>
                                    <td>
                                        <span className={`status-badge status-${r.paymentStatus.toLowerCase()}`}>
                                            {r.paymentStatus === "PAID" && "✓ Đã thanh toán"}
                                            {r.paymentStatus === "PENDING" && "⏳ Chờ xác nhận"}
                                            {r.paymentStatus === "CANCELLED" && "✗ Đã hủy"}
                                        </span>
                                    </td>
                                    <td className="td-actions">
                                        <button
                                            className="btn-view"
                                            onClick={() => {/* Xem chi tiết */ }}
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={16} />
                                        </button>

                                        {r.paymentStatus === "PENDING" && (
                                            <button
                                                className="btn-confirm"
                                                onClick={() => handleConfirm(r.id)}
                                                disabled={confirming === r.id}
                                                title="Xác nhận thanh toán"
                                            >
                                                {confirming === r.id ? (
                                                    <span className="loading-dots">...</span>
                                                ) : (
                                                    <CheckCircle size={16} />
                                                )}
                                            </button>
                                        )}

                                        <button
                                            className="btn-print"
                                            onClick={() => handlePrintInvoice(r.id)}
                                            title="In hóa đơn"
                                        >
                                            <Printer size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
                <div className="pagination">
                    <div className="pagination-info">
                        Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                        {Math.min(currentPage * pageSize, filtered.length)} trong số{" "}
                        {filtered.length} kết quả
                    </div>

                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    className={`pagination-btn ${currentPage === pageNum ? "active" : ""}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(n => ({ ...n, isOpen: false }))}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </div>
    );
}