import React, { useState, useEffect } from "react";
import { registrationService } from "@utils/registrationService";
import "./PaymentModal.css";

export default function PaymentModal({ registration, onClose, onPaymentConfirmed }) {
    const [bankInfo, setBankInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

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
        const { bankId, accountNo, accountName } = bankInfo;
        const amount = Math.round(registration.amount || 0);
        const desc = encodeURIComponent(registration.transferRef || "");
        return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${desc}&accountName=${encodeURIComponent(accountName)}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                    <span className="payment-amount-label">Số tiền cần nộp</span>
                    <span className="payment-amount-value">{formatAmount(registration.amount)} VNĐ</span>
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
                            <h3>Thông tin chuyển khoản</h3>

                            <div className="payment-field">
                                <span className="payment-field-label">Ngân hàng</span>
                                <span className="payment-field-value">{bankInfo.bankName}</span>
                            </div>

                            <div className="payment-field">
                                <span className="payment-field-label">Số tài khoản</span>
                                <div className="payment-field-copy">
                                    <span className="payment-field-value payment-mono">{bankInfo.accountNo}</span>
                                    <button
                                        className="payment-copy-btn"
                                        onClick={() => copyToClipboard(bankInfo.accountNo)}
                                    >
                                        {copied ? "✓ Đã sao" : "Sao chép"}
                                    </button>
                                </div>
                            </div>

                            <div className="payment-field">
                                <span className="payment-field-label">Chủ tài khoản</span>
                                <span className="payment-field-value">{bankInfo.accountName}</span>
                            </div>

                            <div className="payment-field">
                                <span className="payment-field-label">Số tiền</span>
                                <span className="payment-field-value payment-amount-highlight">{formatAmount(registration.amount)} VNĐ</span>
                            </div>

                            <div className="payment-field payment-field-ref">
                                <span className="payment-field-label">Nội dung chuyển khoản</span>
                                <div className="payment-field-copy">
                                    <span className="payment-field-value payment-mono transfer-ref">{registration.transferRef}</span>
                                    <button
                                        className="payment-copy-btn payment-copy-ref"
                                        onClick={() => copyToClipboard(registration.transferRef)}
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
                            <span>Nhập đúng nội dung chuyển khoản <strong>{registration.transferRef}</strong></span>
                        </div>
                        <div className="payment-step">
                            <span className="step-num">3</span>
                            <span>Chờ admin xác nhận — bạn sẽ được thêm vào lớp học tự động</span>
                        </div>
                    </div>
                    <button className="payment-done-btn" onClick={onClose}>Đã chuyển khoản, đóng</button>
                </div>
            </div>
        </div>
    );
}
