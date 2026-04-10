import React, { useState, useEffect } from "react";
import { registrationService } from "@utils/registrationService";
import "./PaymentModal.css";

export default function PaymentModal({ registration, onClose, onPaymentConfirmed }) {
    const [bankInfo, setBankInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const totalAmount = registration?.amount || 0;
    const transferRef = registration?.transferRef || "";

    useEffect(() => {
        registrationService.getBankInfo()
            .then(res => setBankInfo(res.data?.data || null))
            .catch(() => setBankInfo(null))
            .finally(() => setLoading(false));
    }, []);

    const formatAmount = (amount) =>
        new Intl.NumberFormat("vi-VN").format(amount || 0);

    const getQrUrl = () => {
        if (!bankInfo) return null;
        const qrAcc = bankInfo.qrAcc || "VQRQAIDPS9130";
        const qrBank = bankInfo.qrBank || "MBBank";
        const amount = totalAmount || 0;
        const des = transferRef || "";
        return `https://qr.sepay.vn/img?acc=${encodeURIComponent(qrAcc)}&bank=${encodeURIComponent(qrBank)}&amount=${amount}&des=${encodeURIComponent(des)}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePaymentDone = () => {
        onPaymentConfirmed?.();
        onClose();
    };

    if (!registration) return null;

    return (
        <div className="payment-overlay" onClick={onClose}>
            <div className="payment-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="payment-header">
                    <div className="payment-header-icon">💳</div>
                    <div>
                        <h2>Thanh toán học phí</h2>
                        <p className="payment-course-name">{registration.courseTitle}</p>
                    </div>
                    <button className="payment-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Amount */}
                <div className="payment-amount-section">
                    <span className="payment-amount-label">Tổng số tiền cần nộp</span>
                    <span className="payment-amount-value">{formatAmount(totalAmount)} VNĐ</span>
                </div>

                {loading ? (
                    <div className="payment-loading">Đang tải thông tin...</div>
                ) : !bankInfo ? (
                    <div className="payment-error">Không thể tải thông tin ngân hàng.</div>
                ) : (
                    <div className="payment-content">
                        {/* QR Code */}
                        <div className="payment-qr-section">
                            <div className="payment-qr-wrapper">
                                <img
                                    src={getQrUrl()}
                                    alt="QR Code thanh toán"
                                    className="payment-qr-img"
                                    onError={e => { e.target.style.display = "none"; }}
                                />
                            </div>
                            <p className="payment-qr-hint">📱 Dùng app ngân hàng quét mã QR để thanh toán nhanh</p>
                        </div>

                        {/* Bank Details */}
                        <div className="payment-details">
                            <h3>Thông tin QR SePay</h3>

                            <div className="payment-field">
                                <span className="payment-field-label">Account</span>
                                <div className="payment-field-copy">
                                    <span className="payment-field-value payment-mono">{bankInfo.qrAcc}</span>
                                    <button
                                        className="payment-copy-btn"
                                        onClick={() => copyToClipboard(bankInfo.qrAcc)}
                                    >
                                        {copied ? "✓ Đã sao" : "Sao chép"}
                                    </button>
                                </div>
                            </div>

                            <div className="payment-field">
                                <span className="payment-field-label">Bank</span>
                                <span className="payment-field-value">{bankInfo.qrBank}</span>
                            </div>

                            <div className="payment-field">
                                <span className="payment-field-label">Tổng tiền</span>
                                <span className="payment-field-value payment-amount-highlight">{formatAmount(totalAmount)} VNĐ</span>
                            </div>

                            <div className="payment-field payment-field-ref">
                                <span className="payment-field-label">Nội dung chuyển khoản</span>
                                <div className="payment-field-copy">
                                    <span className="payment-field-value payment-mono transfer-ref">{transferRef}</span>
                                    <button
                                        className="payment-copy-btn payment-copy-ref"
                                        onClick={() => copyToClipboard(transferRef)}
                                    >
                                        Sao chép
                                    </button>
                                </div>
                                <p className="payment-ref-warning">⚠ Nhập đúng nội dung chuyển khoản để hệ thống xác nhận tự động</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="payment-footer">
                    <div className="payment-steps">
                        <div className="payment-step">
                            <span className="step-num">1</span>
                            <span>Quét QR hoặc chuyển khoản theo thông tin trên</span>
                        </div>
                        <div className="payment-step">
                            <span className="step-num">2</span>
                            <span>Nhập đúng nội dung chuyển khoản <strong>{transferRef}</strong></span>
                        </div>
                        <div className="payment-step">
                            <span className="step-num">3</span>
                            <span>Hệ thống sẽ tự xác nhận khi SePay nhận đúng giao dịch khớp mã và số tiền</span>
                        </div>
                    </div>
                    <button className="payment-done-btn" onClick={handlePaymentDone}>
                        Tôi đã chuyển khoản
                    </button>
                </div>
            </div>
        </div>
    );
}
