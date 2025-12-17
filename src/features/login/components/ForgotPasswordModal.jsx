import React, { useState } from "react";
import { authService } from "@utils/authService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ForgotPasswordModal.css";

export default function ForgotPasswordModal({ isOpen, onClose }) {
    // Steps: 1 = Email, 2 = OTP, 3 = Reset Password
    const [step, setStep] = useState(1);

    // Form data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [resetToken, setResetToken] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [notification, setNotification] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const showNotification = (title, message, type = "info") => {
        setNotification({ isOpen: true, title, message, type });
    };

    const handleClose = () => {
        // Reset state when closing
        onClose();
        setTimeout(() => {
            setStep(1);
            setEmail("");
            setOtp("");
            setNewPassword("");
            setResetToken("");
            setShowPassword(false);
        }, 300);
    };

    // Step 1: Send OTP to Email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.forgotPasswordOtp({ gmail: email });
            showNotification("Thành công", "Mã OTP đã được gửi đến email của bạn.", "success");
            setStep(2);
        } catch (err) {
            console.error("Send OTP error:", err);
            const message = err?.response?.data?.message || err?.response?.data || "Có lỗi xảy ra, vui lòng thử lại.";
            showNotification("Lỗi", typeof message === 'string' ? message : JSON.stringify(message), "error");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authService.verifyOtp({ gmail: email, otp });
            // Expecting response data: { data: { token: "...", expiresAt: "..." } }
            const token = res.data?.data?.token || res.data?.token;
            if (token) {
                setResetToken(token);
                setStep(3);
                showNotification("OTP Hợp lệ", "Vui lòng nhập mật khẩu mới.", "success");
            } else {
                throw new Error("Không nhận được token đặt lại mật khẩu.");
            }
        } catch (err) {
            console.error("Verify OTP error:", err);
            const message = err?.response?.data?.message || err?.response?.data || "Mã OTP không chính xác.";
            showNotification("Lỗi", typeof message === 'string' ? message : JSON.stringify(message), "error");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.resetPassword({ token: resetToken, newPassword });
            showNotification("Thành công", "Đặt lại mật khẩu thành công! Vui lòng đăng nhập.", "success");
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            console.error("Reset Password error:", err);
            const message = err?.response?.data?.message || err?.response?.data || "Không thể đặt lại mật khẩu.";
            showNotification("Lỗi", typeof message === 'string' ? message : JSON.stringify(message), "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={handleClose}>
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>
                            {step === 1 && "Quên mật khẩu"}
                            {step === 2 && "Xác thực OTP"}
                            {step === 3 && "Đặt lại mật khẩu"}
                        </h3>
                        <button className="close-btn" onClick={handleClose}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        {/* STEP 1: INPUT EMAIL */}
                        {step === 1 && (
                            <>
                                <p className="forgot-instruction">
                                    Nhập email của bạn để nhận mã OTP xác thực.
                                </p>
                                <form onSubmit={handleSendOtp}>
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Nhập email của bạn"
                                            required
                                            className="form-input"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" onClick={handleClose} className="btn-cancel">
                                            Hủy
                                        </button>
                                        <button type="submit" disabled={loading} className="btn-submit">
                                            {loading ? "Đang gửi..." : "Gửi OTP"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* STEP 2: INPUT OTP */}
                        {step === 2 && (
                            <>
                                <p className="forgot-instruction">
                                    Nhập mã OTP 6 chữ số được gửi đến <b>{email}</b>.
                                </p>
                                <form onSubmit={handleVerifyOtp}>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} // Only digits, max 6
                                            placeholder="------"
                                            required
                                            className="form-input"
                                            style={{ letterSpacing: "4px", textAlign: "center", fontSize: "18px" }}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" onClick={() => setStep(1)} className="btn-cancel">
                                            Quay lại
                                        </button>
                                        <button type="submit" disabled={loading || otp.length < 6} className="btn-submit">
                                            {loading ? "Đang xử lý..." : "Xác thực"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* STEP 3: RESET PASSWORD */}
                        {step === 3 && (
                            <>
                                <p className="forgot-instruction">
                                    Tạo mật khẩu mới cho tài khoản của bạn.
                                </p>
                                <form onSubmit={handleResetPassword}>
                                    <div className="form-group">
                                        <div className="password-input-container">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Mật khẩu mới"
                                                required
                                                className="form-input"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" onClick={handleClose} className="btn-cancel">
                                            Hủy
                                        </button>
                                        <button type="submit" disabled={loading} className="btn-submit">
                                            {loading ? "Đang đổi..." : "Đổi mật khẩu"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
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
        </>
    );
}
