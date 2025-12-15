import React, { useState } from "react";
import { authService } from "@utils/authService";
import NotificationModal from "@components/NotificationModal/NotificationModal";

export default function ForgotPasswordModal({ isOpen, onClose }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const showNotification = (title, message, type = "info") => {
        setNotification({ isOpen: true, title, message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authService.forgotPassword({ gmail: email });
            showNotification("Thành công", "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.", "success");
            setTimeout(() => {
                onClose();
                setEmail("");
            }, 2000);
        } catch (err) {
            console.error("Forgot password error:", err);
            const data = err?.response?.data;
            let message = "Có lỗi xảy ra, vui lòng thử lại sau.";
            if (data) {
                message = typeof data === "string" ? data : (data.message || data.error || message);
            }
            showNotification("Lỗi", message, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-container" style={{ maxWidth: "400px" }}>
                    <div className="modal-header">
                        <h3>Quên mật khẩu</h3>
                        <button className="close-btn" onClick={onClose}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <p style={{ marginBottom: "1rem", color: "#666" }}>
                            Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: "1rem" }}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email của bạn"
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        border: "1px solid #ddd",
                                        background: "#f5f5f5",
                                        cursor: "pointer",
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        border: "none",
                                        background: "#f28c38",
                                        color: "white",
                                        cursor: "pointer",
                                    }}
                                >
                                    {loading ? "Đang gửi..." : "Gửi yêu cầu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Re-use NotificationModal inside this modal's portal context if needed, 
          or ensuring z-index is high enough. 
          Ideally NotificationModal should be at root, but localized here for simplicity. 
      */}
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
