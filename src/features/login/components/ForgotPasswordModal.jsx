import React, { useState } from "react";
import { authService } from "@utils/authService";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ForgotPasswordModal.css";

export default function ForgotPasswordModal({ isOpen, onClose }) {
    // Steps: 1 = Email, 2 = OTP, 3 = Reset Password
    const [step, setStep] = useState(1);

    // Form data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetToken, setResetToken] = useState("");

    // UI state
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Inline message state
    const [inlineMessage, setInlineMessage] = useState({ text: "", type: "" }); // type: "success" | "error" | ""

    const clearMessage = () => setInlineMessage({ text: "", type: "" });

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setStep(1);
            setEmail("");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setResetToken("");
            setShowPassword(false);
            setShowConfirmPassword(false);
            clearMessage();
        }, 300);
    };

    // Step 1: Send OTP to Email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        clearMessage();
        try {
            await authService.forgotPasswordOtp({ gmail: email });
            setInlineMessage({ text: "Mã OTP đã được gửi đến email của bạn.", type: "success" });
            setTimeout(() => {
                setStep(2);
                clearMessage();
            }, 1000);
        } catch (err) {
            console.error("Send OTP error:", err);
            const message = err?.response?.data?.message || err?.response?.data || "Có lỗi xảy ra, vui lòng thử lại.";
            setInlineMessage({ text: typeof message === 'string' ? message : JSON.stringify(message), type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        clearMessage();
        try {
            const res = await authService.verifyOtp({ gmail: email, otp });
            const token = res.data?.data?.token || res.data?.token;
            if (token) {
                setResetToken(token);
                setInlineMessage({ text: "OTP Hợp lệ.", type: "success" });
                setTimeout(() => {
                    setStep(3);
                    clearMessage();
                }, 1000);
            } else {
                throw new Error("Không nhận được token đặt lại mật khẩu.");
            }
        } catch (err) {
            console.error("Verify OTP error:", err);
            const message = err?.response?.data?.message || err?.response?.data || "Mã OTP không chính xác.";
            setInlineMessage({ text: typeof message === 'string' ? message : JSON.stringify(message), type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        clearMessage();

        if (newPassword !== confirmPassword) {
            setInlineMessage({ text: "Mật khẩu xác nhận không khớp.", type: "error" });
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({ token: resetToken, newPassword });
            setInlineMessage({ text: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập.", type: "success" });
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            console.error("Reset Password error:", err);
            const message = err?.response?.data?.message || err?.response?.data || "Không thể đặt lại mật khẩu.";
            setInlineMessage({ text: typeof message === 'string' ? message : JSON.stringify(message), type: "error" });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
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
                    {/* Inline Message */}
                    {inlineMessage.text && (
                        <div className={`inline-message ${inlineMessage.type}`}>
                            {inlineMessage.text}
                        </div>
                    )}

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
                                Tạo mật khẩu mới an toàn cho tài khoản của bạn.
                            </p>
                            <form onSubmit={handleResetPassword}>
                                <div className="form-group">
                                    <label className="field-label">Mật khẩu mới *</label>
                                    <div className="password-input-container">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mật khẩu mới"
                                            required
                                            className="form-input password-input"
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
                                <div className="form-group">
                                    <label className="field-label">Xác nhận mật khẩu mới *</label>
                                    <div className="password-input-container">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Xác nhận mật khẩu mới"
                                            required
                                            className="form-input password-input"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="requirements-card">
                                    <div className="requirements-title">Yêu cầu mật khẩu</div>
                                    <ul className="requirements-list">
                                        <li>Ít nhất 8 ký tự</li>
                                        <li>Chữ hoa và chữ thường</li>
                                        <li>Ít nhất 1 chữ số</li>
                                        <li>Ít nhất 1 ký tự đặc biệt</li>
                                    </ul>
                                </div>
                                <div className="modal-actions reset-actions">
                                    <button type="button" onClick={handleClose} className="btn-cancel">
                                        Hủy
                                    </button>
                                    <button type="submit" disabled={loading} className="btn-submit">
                                        {loading ? "Đang đổi..." : "Đặt lại mật khẩu"}
                                    </button>
                                </div>
                                <div className="note-card">
                                    <div className="note-title">Lưu ý bảo mật</div>
                                    <p>Mật khẩu của bạn không nên chia sẻ với bất kỳ ai. Chúng tôi sẽ không bao giờ yêu cầu mật khẩu của bạn qua email hoặc điện thoại.</p>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
