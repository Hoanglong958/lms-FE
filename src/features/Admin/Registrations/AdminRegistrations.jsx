import React, { useState, useEffect } from "react";
import { registrationService } from "@utils/registrationService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./AdminRegistrations.css";

export default function AdminRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); // ALL | PENDING | PAID
    const [search, setSearch] = useState("");
    const [bankInfo, setBankInfo] = useState(null);
    const [notification, setNotification] = useState({ isOpen: false, title: "", message: "", type: "info" });
    const [confirming, setConfirming] = useState(null);

    useEffect(() => {
        fetchAll();
        registrationService.getBankInfo()
            .then(res => setBankInfo(res.data?.data || null))
            .catch(() => { });
    }, []);

    const fetchAll = async () => {
        try {
            const res = await registrationService.getAllRegistrations();
            setRegistrations(res.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        setConfirming(id);
        try {
            await registrationService.confirmPayment(id);
            setNotification({ isOpen: true, title: "Thành công", message: "Đã xác nhận thanh toán và thêm sinh viên vào lớp.", type: "success" });
            fetchAll();
        } catch (err) {
            setNotification({ isOpen: true, title: "Lỗi", message: err.response?.data?.data || "Không thể xác nhận thanh toán.", type: "error" });
        } finally {
            setConfirming(null);
        }
    };

    const formatAmount = (amt) => new Intl.NumberFormat("vi-VN").format(amt || 0);
    const formatDate = (dt) => dt ? new Date(dt).toLocaleDateString("vi-VN") : "—";

    const filtered = registrations.filter(r => {
        const matchStatus = filter === "ALL" || r.paymentStatus === filter;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            (r.studentName || "").toLowerCase().includes(q) ||
            (r.courseTitle || "").toLowerCase().includes(q) ||
            (r.transferRef || "").toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const pendingCount = registrations.filter(r => r.paymentStatus === "PENDING").length;

    if (loading) return <div className="admin-reg-loading">Đang tải dữ liệu...</div>;

    return (
        <div className="admin-registrations-container">
            {/* Page Header */}
            <div className="admin-reg-header">
                <div>
                    <h2>Quản lý học phí</h2>
                    <p className="admin-reg-subtitle">Xác nhận thanh toán để tự động thêm sinh viên vào lớp</p>
                </div>
                {pendingCount > 0 && (
                    <div className="admin-reg-pending-badge">
                        <span>{pendingCount}</span> đang chờ xác nhận
                    </div>
                )}
            </div>

            {/* Bank Info Banner */}
            {bankInfo && (
                <div className="admin-bank-banner">
                    <span className="bank-banner-icon">🏦</span>
                    <div className="bank-banner-info">
                        <strong>{bankInfo.bankName}</strong>
                        <span>STK: <code>{bankInfo.accountNo}</code></span>
                        <span>Chủ TK: <strong>{bankInfo.accountName}</strong></span>
                    </div>
                    <p className="bank-banner-hint">Đối chiếu nội dung chuyển khoản với cột "Mã TT" để xác nhận</p>
                </div>
            )}

            {/* Toolbar */}
            <div className="admin-reg-toolbar">
                <input
                    className="admin-reg-search"
                    type="text"
                    placeholder="🔍 Tìm sinh viên, khóa học, mã TT..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="admin-reg-filters">
                    {["ALL", "PENDING", "PAID"].map(s => (
                        <button
                            key={s}
                            className={`filter-btn ${filter === s ? "active" : ""} filter-${s.toLowerCase()}`}
                            onClick={() => setFilter(s)}
                        >
                            {s === "ALL" ? `Tất cả (${registrations.length})` : s === "PENDING" ? `Chờ xử lý (${pendingCount})` : `Đã nộp (${registrations.filter(r => r.paymentStatus === "PAID").length})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="admin-reg-empty">Không tìm thấy kết quả.</div>
            ) : (
                <div className="reg-table-wrapper">
                    <table className="reg-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Sinh viên</th>
                                <th>Khóa học</th>
                                <th>Học phí</th>
                                <th>Mã chuyển khoản</th>
                                <th>Ngày đăng ký</th>
                                <th>Ngày nộp</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.id} className={r.paymentStatus === "PENDING" ? "row-pending" : ""}>
                                    <td className="td-id">{r.id}</td>
                                    <td>{r.studentName}</td>
                                    <td className="td-course">{r.courseTitle}</td>
                                    <td className="td-amount">{formatAmount(r.amount)} ₫</td>
                                    <td>
                                        <code className="transfer-ref-code">{r.transferRef || "—"}</code>
                                    </td>
                                    <td>{formatDate(r.registrationDate)}</td>
                                    <td>{formatDate(r.paymentDate)}</td>
                                    <td>
                                        <span className={`status-badge status-${r.paymentStatus.toLowerCase()}`}>
                                            {r.paymentStatus === "PAID" ? "✓ Đã nộp" : r.paymentStatus === "CANCELLED" ? "✗ Đã hủy" : "⏳ Chờ xử lý"}
                                        </span>
                                    </td>
                                    <td>
                                        {r.paymentStatus === "PENDING" && (
                                            <button
                                                className="btn-confirm"
                                                onClick={() => handleConfirm(r.id)}
                                                disabled={confirming === r.id}
                                            >
                                                {confirming === r.id ? "..." : "✓ Xác nhận"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(n => ({ ...n, isOpen: false }))}
                {...notification}
            />
        </div>
    );
}
