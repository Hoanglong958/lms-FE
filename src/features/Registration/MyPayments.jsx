import React, { useState, useEffect } from "react";
import { registrationService } from "@utils/registrationService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import PaymentModal from "./PaymentModal";
import "./CourseRegistration.css";
import { CreditCard, History, Clock, QrCode, CheckCircle2, AlertCircle, Banknote } from "lucide-react";
import AdminPagination from "@shared/components/Admin/AdminPagination";

const styles = `
  .pay-root {
    --navy: #0f2744;
    --navy-mid: #1a3a5c;
    --navy-light: #1e4976;
    --amber: #f59e0b;
    --amber-light: #fbbf24;
    --amber-pale: #fffbeb;
    --green: #059669;
    --green-pale: #ecfdf5;
    --red: #dc2626;
    --red-pale: #fef2f2;
    --slate-50: #f8fafc;
    --slate-100: #f1f5f9;
    --slate-200: #e2e8f0;
    --slate-400: #94a3b8;
    --slate-600: #475569;
    --slate-800: #1e293b;
    --white: #ffffff;

    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f4f7fb;
    min-height: 100vh;
    padding: 32px;
    color: var(--slate-800);
  }

  .pay-header {
    margin-bottom: 32px;
  }

  .pay-header h2 {
    font-family: inherit;
    font-size: 2rem;
    color: var(--navy);
    margin: 0 0 6px;
    letter-spacing: -0.5px;
  }

  .pay-header p {
    color: var(--slate-600);
    margin: 0;
    font-size: 0.95rem;
  }

  /* Summary Cards */
  .pay-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 36px;
  }

  .pay-card {
    border-radius: 20px;
    padding: 28px 28px 24px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(15, 39, 68, 0.12);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .pay-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(15, 39, 68, 0.18);
  }

  .pay-card--paid {
    background: linear-gradient(145deg, var(--navy) 0%, var(--navy-light) 100%);
    color: white;
  }

  .pay-card--pending {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
    color: white;
    border: 1px solid rgba(245,158,11,0.2);
  }

  .pay-card__bg-shape {
    position: absolute;
    right: -20px;
    bottom: -20px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    opacity: 0.08;
    background: white;
  }

  .pay-card__bg-shape2 {
    position: absolute;
    right: 60px;
    top: -30px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    opacity: 0.05;
    background: white;
  }

  .pay-card__label {
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    opacity: 0.7;
    margin-bottom: 10px;
  }

  .pay-card--pending .pay-card__label {
    color: var(--amber-light);
    opacity: 1;
  }

  .pay-card__amount {
    font-size: 1.9rem;
    font-weight: 700;
    font-family: inherit;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }

  .pay-card--pending .pay-card__amount {
    color: var(--amber-light);
  }

  .pay-card__sub {
    font-size: 0.83rem;
    opacity: 0.65;
  }

  .pay-card__icon {
    position: absolute;
    top: 24px;
    right: 24px;
    background: rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 12px;
    display: flex;
  }

  .pay-card--pending .pay-card__icon {
    background: rgba(245,158,11,0.15);
    color: var(--amber-light);
  }

  /* Section wrappers */
  .pay-section {
    margin-bottom: 36px;
  }

  .pay-section__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .pay-section__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: inherit;
    font-size: 1.2rem;
    color: var(--navy);
    margin: 0;
  }

  .pay-section__title span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .pay-section__title .icon-pending {
    background: var(--amber-pale);
    color: var(--amber);
  }

  .pay-section__title .icon-paid {
    background: var(--green-pale);
    color: var(--green);
  }

  /* Bulk pay button */
  .btn-bulk-pay {
    background: var(--navy);
    color: white;
    border: none;
    padding: 9px 18px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    transition: background 0.18s ease, transform 0.15s ease;
    font-family: inherit;
  }

  .btn-bulk-pay:hover {
    background: var(--navy-light);
    transform: translateY(-1px);
  }

  .btn-bulk-pay .badge {
    background: var(--amber);
    color: var(--navy);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
  }

  /* Empty state */
  .pay-empty {
    text-align: center;
    padding: 48px 24px;
    background: white;
    border-radius: 16px;
    border: 2px dashed var(--slate-200);
    color: var(--slate-400);
    font-size: 0.93rem;
  }

  /* Table */
  .pay-table-wrap {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 1px 8px rgba(15,39,68,0.06);
    border: 1px solid var(--slate-200);
  }

  .pay-table {
    width: 100%;
    border-collapse: collapse;
  }

  .pay-table thead {
    background: var(--navy);
    color: rgba(255,255,255,0.85);
  }

  .pay-table thead th {
    padding: 13px 18px;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .pay-table tbody tr {
    border-bottom: 1px solid var(--slate-100);
    transition: background 0.12s ease;
  }

  .pay-table tbody tr:last-child {
    border-bottom: none;
  }

  .pay-table tbody tr:hover {
    background: #f8f9fd;
  }

  .pay-table tbody td {
    padding: 15px 18px;
    font-size: 0.9rem;
    vertical-align: middle;
  }

  .pay-course-name {
    font-weight: 600;
    color: var(--navy);
    font-size: 0.93rem;
  }

  .pay-ref-code {
    background: var(--slate-100);
    color: var(--slate-600);
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-family: monospace;
    letter-spacing: 0.5px;
  }

  .pay-amount-pending {
    color: var(--navy-mid);
    font-weight: 700;
    font-size: 0.95rem;
  }

  .pay-amount-paid {
    color: var(--green);
    font-weight: 600;
  }

  /* Buttons */
  .btn-pay {
    background: var(--navy);
    color: white;
    border: none;
    padding: 7px 14px;
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 0.82rem;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .btn-pay:hover {
    background: var(--amber);
    color: var(--navy);
    transform: translateY(-1px);
  }

  .btn-cancel {
    background: var(--red-pale);
    color: var(--red);
    border: 1px solid #fecaca;
    padding: 7px 14px;
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 0.82rem;
    transition: all 0.15s ease;
    font-family: inherit;
  }

  .btn-cancel:hover {
    background: #f87171; /* Brighter red for hover */
    transform: translateY(-1px);
  }

  .status-paid {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--green-pale);
    color: var(--green);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  .checkbox-custom {
    width: 16px;
    height: 16px;
    accent-color: var(--navy);
    cursor: pointer;
  }

  .pay-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 300px;
    color: var(--slate-600);
    font-size: 0.95rem;
  }

  .pay-loading::before {
    content: '';
    width: 22px;
    height: 22px;
    border: 3px solid var(--slate-200);
    border-top-color: var(--navy);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .pay-cards {
      grid-template-columns: 1fr;
    }
    .pay-root {
      padding: 16px;
    }
  }
`;

export default function MyPayments() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notification, setNotification] = useState({ isOpen: false, title: "", message: "", type: "info" });
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const res = await registrationService.getMyRegistrations();
            setRegistrations(res.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const pendingRegs = registrations.filter(r => r.paymentStatus === "PENDING");
    const paidRegs = registrations.filter(r => r.paymentStatus === "PAID");
    
    // Pagination for paid history
    const totalPages = Math.ceil(paidRegs.length / pageSize);
    const paginatedPaidRegs = paidRegs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalPendingBoundary = pendingRegs.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalPaid = paidRegs.reduce((sum, r) => sum + (r.amount || 0), 0);

    const formatAmount = (amt) => new Intl.NumberFormat("vi-VN").format(amt || 0) + " ₫";
    const formatRefundDate = (value) => value ? new Date(value).toLocaleDateString("vi-VN") : "—";

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(pendingRegs.map(r => r.id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkPay = () => {
        const selected = pendingRegs.filter(r => selectedIds.includes(r.id));
        if (selected.length === 0) return;
        setSelectedReg(selected);
    };

    const handleRequestRefund = (registration) => {
        if (!registration?.canRequestRefund) return;
        
        setNotification({
            isOpen: true,
            title: "Xác nhận yêu cầu",
            message: `Bạn có chắc chắn muốn gửi yêu cầu hoàn tiền cho khóa học "${registration.courseTitle}"?`,
            type: "warning",
            confirmText: "Yêu cầu",
            onConfirm: async () => {
                // Đóng popup warning ngay lập tức
                setNotification(n => ({ ...n, isOpen: false }));
                
                try {
                    await registrationService.requestRefund(registration.id);
                    // Hiển thị success sau một khoảng trễ nhỏ để CSS transition kịp kết thúc (tùy chọn)
                    setTimeout(() => {
                        setNotification({
                            isOpen: true,
                            title: "Yêu cầu hoàn tiền đã gửi",
                            message: `Admin sẽ liên hệ bạn trong vòng 24h để xử lý hoàn tiền cho "${registration.courseTitle}".`,
                            type: "success"
                        });
                        fetchRegistrations();
                    }, 300);
                } catch (err) {
                    console.error("Request refund failed", err);
                    setTimeout(() => {
                        setNotification({
                            isOpen: true,
                            title: "Yêu cầu hoàn tiền thất bại",
                            message: err.response?.data?.data || "Không thể gửi yêu cầu hoàn tiền.",
                            type: "error"
                        });
                    }, 300);
                }
            }
        });
    };

    if (loading) return (
        <div className="pay-root">
            <style>{styles}</style>
            <div className="pay-loading">Đang tải thông tin thanh toán...</div>
        </div>
    );

    return (
        <div className="pay-root">
            <style>{styles}</style>

            {/* Summary Cards */}
            <div className="pay-cards">
                <div className="pay-card pay-card--paid">
                    <div className="pay-card__bg-shape" />
                    <div className="pay-card__bg-shape2" />
                    <div className="pay-card__icon"><History size={26} /></div>
                    <div className="pay-card__label">Tổng học phí đã nộp</div>
                    <div className="pay-card__amount">{formatAmount(totalPaid)}</div>
                    <div className="pay-card__sub">{paidRegs.length} khóa học đã hoàn thành</div>
                </div>

                <div className="pay-card pay-card--pending">
                    <div className="pay-card__bg-shape" />
                    <div className="pay-card__bg-shape2" />
                    <div className="pay-card__icon"><Banknote size={26} /></div>
                    <div className="pay-card__label">Chưa nộp</div>
                    <div className="pay-card__amount">{formatAmount(totalPendingBoundary)}</div>
                    <div className="pay-card__sub">{pendingRegs.length} khóa học đang chờ thanh toán</div>
                </div>
            </div>

            {/* Pending Section */}
            <div className="pay-section">
                <div className="pay-section__head">
                    <h3 className="pay-section__title">
                        <span className="icon-pending"><Clock size={16} /></span>
                        Chờ thanh toán
                    </h3>
                    {selectedIds.length > 0 && (
                        <button className="btn-bulk-pay" onClick={handleBulkPay}>
                            <QrCode size={16} />
                            Thanh toán đã chọn
                            <span className="badge">{selectedIds.length}</span>
                        </button>
                    )}
                </div>

                {pendingRegs.length === 0 ? (
                    <div className="pay-empty">
                        <AlertCircle size={32} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                        Bạn không có hóa đơn nào đang chờ thanh toán.
                    </div>
                ) : (
                    <div className="pay-table-wrap">
                        <table className="pay-table">
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "center", width: "44px" }}>
                                        <input
                                            className="checkbox-custom"
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectedIds.length === pendingRegs.length && pendingRegs.length > 0}
                                        />
                                    </th>
                                    <th style={{ textAlign: "left" }}>Khóa học</th>
                                    <th style={{ textAlign: "left" }}>Mã TT</th>
                                    <th style={{ textAlign: "right" }}>Số tiền</th>
                                    <th style={{ textAlign: "center" }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRegs.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ textAlign: "center" }}>
                                            <input
                                                className="checkbox-custom"
                                                type="checkbox"
                                                checked={selectedIds.includes(r.id)}
                                                onChange={() => handleSelectOne(r.id)}
                                            />
                                        </td>
                                        <td><span className="pay-course-name">{r.courseTitle}</span></td>
                                        <td><code className="pay-ref-code">{r.transferRef}</code></td>
                                        <td style={{ textAlign: "right" }}>
                                            <span className="pay-amount-pending">{formatAmount(r.amount)}</span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center", width: "100%" }}>
                                                <button className="btn-pay" style={{ flex: 1 }} onClick={() => setSelectedReg(r)}>
                                                    <QrCode size={14} /> Thanh toán
                                                </button>
                                                <button
                                                    className="btn-cancel"
                                                    style={{ flex: 1 }}
                                                    onClick={async () => {
                                                        if (window.confirm("Bạn có chắc chắn muốn hủy đăng ký này không?")) {
                                                            try {
                                                                await registrationService.cancelRegistration(r.id);
                                                                fetchRegistrations();
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert(err.response?.data?.data || "Không thể hủy đăng ký");
                                                            }
                                                        }
                                                    }}
                                                >
                                                    ✕ Hủy
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* History Section */}
            <div className="pay-section">
                <div className="pay-section__head">
                    <h3 className="pay-section__title">
                        <span className="icon-paid"><History size={16} /></span>
                        Lịch sử thanh toán
                    </h3>
                    <p className="refund-note">
                        Bạn có thể gửi yêu cầu hoàn tiền từ ngày thứ 4 kể từ ngày đã đóng học phí.
                    </p>
                </div>
                <div className="pay-table-wrap">
                    <table className="pay-table">
                        <thead>
                        <tr>
                            <th style={{ textAlign: "left" }}>Khóa học</th>
                            <th style={{ textAlign: "left" }}>Ngày nộp</th>
                            <th style={{ textAlign: "right" }}>Số tiền</th>
                            <th style={{ textAlign: "center" }}>Hoàn tiền</th>
                            <th style={{ textAlign: "center" }}>Trạng thái</th>
                        </tr>
                        </thead>
                        <tbody>
                            {paginatedPaidRegs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                                        Chưa có lịch sử thanh toán.
                                    </td>
                                </tr>
                            ) : (
                                paginatedPaidRegs.map(r => (
                                <tr key={r.id}>
                                    <td><span className="pay-course-name">{r.courseTitle}</span></td>
                                    <td style={{ color: "#64748b" }}>
                                        {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString("vi-VN") : "—"}
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <span className="pay-amount-paid">{formatAmount(r.amount)}</span>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        {r.refundConfirmed ? (
                                            <span className="refund-chip confirmed">
                                                Đã hoàn tiền {formatRefundDate(r.refundConfirmedAt)}
                                            </span>
                                        ) : r.paymentStatus === "REFUND_REQUESTED" ? (
                                            <span className="refund-chip requested">
                                                Đang xử lý {formatRefundDate(r.refundRequestedAt)}
                                            </span>
                                        ) : r.paymentStatus === "PAID" ? (
                                            r.refundRequested ? (
                                                <span className="refund-chip requested">
                                                    Đã gửi {formatRefundDate(r.refundRequestedAt)}
                                                </span>
                                            ) : r.canRequestRefund ? (
                                                <button
                                                    className="btn-refund"
                                                    type="button"
                                                    onClick={() => handleRequestRefund(r)}
                                                >
                                                    Yêu cầu hoàn tiền
                                                </button>
                                            ) : (
                                                <span className="refund-chip locked">
                                                    Có thể yêu cầu từ {formatRefundDate(r.refundEligibleAt)}
                                                </span>
                                            )
                                        ) : (
                                            <span className="refund-chip muted">—</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        <span className="status-paid">
                                            <CheckCircle2 size={13} /> Đã nộp
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Unified Admin Pagination for History */}
            <AdminPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
            />

            {selectedReg && (
                <PaymentModal
                    registration={selectedReg}
                    onClose={() => setSelectedReg(null)}
                    onPaymentConfirmed={() => {
                        setNotification({
                            isOpen: true,
                            title: "Đã gửi thông tin",
                            message: "Chúng tôi đã báo cho admin rằng bạn đã chuyển khoản. Hãy đợi xác nhận sau khi họ kiểm tra.",
                            type: "success"
                        });
                        fetchRegistrations();
                    }}
                />
            )}

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(n => ({ ...n, isOpen: false }))}
                {...notification}
            />
        </div>
    );
}
