import React, { useState, useEffect } from "react";
import { registrationService } from "@utils/registrationService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import PaymentModal from "./PaymentModal";
import "./CourseRegistration.css"; // Reuse existing styles or create new ones
import { CreditCard, History, Clock, QrCode } from "lucide-react";

export default function MyPayments() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState(null);
    const [notification, setNotification] = useState({ isOpen: false, title: "", message: "", type: "info" });

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

    const totalPending = pendingRegs.reduce((sum, r) => sum + (r.amount || 0), 0);

    const formatAmount = (amt) => new Intl.NumberFormat("vi-VN").format(amt || 0) + " ₫";

    if (loading) return <div className="registration-loading">Đang tải thông tin thanh toán...</div>;

    return (
        <div className="course-registration-container">
            <div className="registration-header">
                <h2>Thanh toán của tôi</h2>
                <p className="registration-subtitle">Quản lý học phí và lịch sử thanh toán</p>
            </div>

            {/* Pending Payments Section */}
            <div className="payment-summary-card" style={{
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                borderRadius: "16px",
                padding: "24px",
                color: "white",
                marginBottom: "32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            }}>
                <div>
                    <h3 style={{ margin: 0, opacity: 0.9 }}>Tổng học phí chưa nộp</h3>
                    <div style={{ fontSize: "2.5rem", fontWeight: 700, margin: "8px 0" }}>{formatAmount(totalPending)}</div>
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>{pendingRegs.length} khóa học đang chờ thanh toán</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.2)", padding: "16px", borderRadius: "12px" }}>
                    <CreditCard size={48} />
                </div>
            </div>

            <div className="payment-sections" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
                {/* Pending List */}
                <section>
                    <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <Clock size={20} color="#f59e0b" /> Chờ thanh toán
                    </h3>
                    {pendingRegs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "12px", border: "2px dashed #e2e8f0" }}>
                            <p style={{ color: "#64748b" }}>Bạn không có hóa đơn nào đang chờ.</p>
                        </div>
                    ) : (
                        <div className="reg-table-wrapper" style={{ boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)", borderRadius: "12px", background: "white" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead style={{ background: "#f1f5f9" }}>
                                    <tr>
                                        <th style={{ padding: "12px 16px", textAlign: "left" }}>Khóa học</th>
                                        <th style={{ padding: "12px 16px", textAlign: "left" }}>Mã TT</th>
                                        <th style={{ padding: "12px 16px", textAlign: "right" }}>Số tiền</th>
                                        <th style={{ padding: "12px 16px", textAlign: "center" }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingRegs.map(r => (
                                        <tr key={r.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                            <td style={{ padding: "16px" }}><strong>{r.courseTitle}</strong></td>
                                            <td style={{ padding: "16px" }}><code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{r.transferRef}</code></td>
                                            <td style={{ padding: "16px", textAlign: "right", color: "#6366f1", fontWeight: 600 }}>{formatAmount(r.amount)}</td>
                                            <td style={{ padding: "16px", textAlign: "center" }}>
                                                <button
                                                    onClick={() => setSelectedReg(r)}
                                                    style={{
                                                        background: "#6366f1",
                                                        color: "white",
                                                        border: "none",
                                                        padding: "8px 16px",
                                                        borderRadius: "8px",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        margin: "0 auto"
                                                    }}
                                                >
                                                    <QrCode size={16} /> Thanh toán
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* History List */}
                <section>
                    <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <History size={20} color="#10b981" /> Lịch sử thanh toán
                    </h3>
                    <div className="reg-table-wrapper" style={{ borderRadius: "12px", background: "white" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ background: "#f1f5f9" }}>
                                <tr>
                                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Khóa học</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Ngày nộp</th>
                                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Số tiền</th>
                                    <th style={{ padding: "12px 16px", textAlign: "center" }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paidRegs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>Chưa có lịch sử thanh toán.</td>
                                    </tr>
                                ) : (
                                    paidRegs.map(r => (
                                        <tr key={r.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                            <td style={{ padding: "16px" }}>{r.courseTitle}</td>
                                            <td style={{ padding: "16px" }}>{r.paymentDate ? new Date(r.paymentDate).toLocaleDateString("vi-VN") : "—"}</td>
                                            <td style={{ padding: "16px", textAlign: "right" }}>{formatAmount(r.amount)}</td>
                                            <td style={{ padding: "16px", textAlign: "center" }}>
                                                <span style={{
                                                    background: "#dcfce7",
                                                    color: "#166534",
                                                    padding: "4px 8px",
                                                    borderRadius: "6px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: 600
                                                }}>✓ Đã nộp</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {selectedReg && (
                <PaymentModal
                    registration={selectedReg}
                    onClose={() => setSelectedReg(null)}
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
