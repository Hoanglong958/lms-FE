import React, { useState } from "react";
import { authService } from "@utils/authService";
import { uploadService } from "@utils/uploadService";
import { userService } from "@utils/userService";
import { SERVER_URL } from "@config";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./ProfileEdit.css";

export default function ProfileEdit() {
    // Safe user parsing
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem("loggedInUser") || "{}");
        } catch {
            return {};
        }
    })();

    // Split fullName into LastName and FirstName if possible
    let initLastName = "";
    let initFirstName = "";
    if (user.fullName) {
        const parts = user.fullName.trim().split(" ");
        if (parts.length > 1) {
            initFirstName = parts.pop();
            initLastName = parts.join(" ");
        } else {
            initFirstName = parts[0];
        }
    } else if (user.username) {
        initFirstName = user.username;
    }

    const [formData, setFormData] = useState({
        lastName: initLastName || "Nguyễn",
        firstName: initFirstName || "Ánh Viên",
        email: user.gmail || user.email || "vien@gmail.com",
        phone: user.phone || "0981 965 304",
        avatar: user.avatar || null,
    });

    const [uploading, setUploading] = useState(false);

    const [notification, setNotification] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const showNotification = (title, message, type = "info") => {
        setNotification({ isOpen: true, title, message, type });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadService.uploadImage(file);
            // Standardized response handling like ManageCourses
            const url = res.data?.url || res.data?.data || res.data;

            if (url) {
                setFormData(prev => ({ ...prev, avatar: url }));
                showNotification("Thành công", "Cập nhật ảnh đại diện thành công", "success");
            }
        } catch (e) {
            console.error(e);
            showNotification("Lỗi", "Tải ảnh thất bại", "error");
        } finally {
            setUploading(false);
        }
    };

    // Helper to get full avatar URL
    const getAvatarSrc = (path) => {
        if (!path) return "https://placehold.co/150?text=Avatar";
        if (path.startsWith("http") || path.startsWith("blob:")) return path;
        return `${SERVER_URL}${path}`;
    };



    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const handleChangePassword = () => {
        setShowPasswordModal(true);
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setShowPassword({ old: false, new: false, confirm: false });
    };

    const handlePasswordChangeInput = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const toggleShowPassword = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordSubmit = async () => {
        const { oldPassword, newPassword, confirmPassword } = passwordData;

        if (!oldPassword || !newPassword || !confirmPassword) {
            showNotification("Thiếu thông tin", "Vui lòng điền đầy đủ thông tin", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification("Lỗi", "Mật khẩu xác nhận không khớp", "error");
            return;
        }

        // Strong password validation
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        const isValidLength = newPassword.length >= 8;

        if (!isValidLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            showNotification("Mật khẩu yếu", "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt", "error");
            return;
        }

        try {
            await authService.changePassword({ oldPassword, newPassword, confirmPassword });
            showNotification("Thành công", "Đổi mật khẩu thành công!", "success");
            handleClosePasswordModal();
        } catch (error) {
            console.error("Change password error full:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
            }

            let msg = "Đổi mật khẩu thất bại";
            if (error.response) {
                if (typeof error.response.data === 'string') {
                    msg = error.response.data;
                } else if (error.response.data?.message) {
                    msg = error.response.data.message;
                } else {
                    msg = JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                msg = error.message;
            }
            showNotification("Lỗi", msg, "error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Schema: { "fullName": "string", "phone": "string", "avatar": "string" }
            const payload = {
                fullName: `${formData.lastName} ${formData.firstName}`.trim(),
                phone: formData.phone,
                avatar: formData.avatar
            };

            // Call the correct endpoint for personal profile update
            await authService.updateProfile(payload);

            // Update local storage to reflect changes immediately
            const updatedUser = {
                ...user,
                ...payload,
                // Ensure field names are consistent for other components
                imageUrl: payload.avatar 
            };
            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
            
            showNotification("Thành công", "Thông tin đã được lưu!", "success");
        } catch (err) {
            console.error("Update failed:", err);
            if (err.response) {
                console.error("Server response data:", err.response.data);
                console.error("Server response status:", err.response.status);
            }
            showNotification("Lỗi", "Cập nhật thất bại", "error");
        }
    };

    return (
        <div className="profile-edit-container">
            <div className="profile-edit-wrapper">
                <div className="profile-page-header">
                    <h1 className="profile-edit-title">Hồ sơ của tôi</h1>


                </div>

                <form onSubmit={handleSubmit} className="profile-edit-form">
                    <div className="profile-edit-content">
                        {/* Avatar Section */}
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                <img
                                    src={getAvatarSrc(formData.avatar)}
                                    alt="Profile"
                                    className="avatar-image"
                                />
                                <label htmlFor="avatar-upload" className="camera-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                </label>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    accept="image/*"
                                    onChange={onFileChange}
                                    style={{ display: "none" }}
                                    disabled={uploading}
                                />
                            </div>
                            {uploading && <span className="upload-status">Đang tải ảnh...</span>}
                        </div>

                        <div className="personal-info-section">

                            <div className="form-grid">

                                <div className="form-group">
                                    <label htmlFor="firstName">Họ và tên đệm</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="firstName">Tên</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        readOnly
                                        className="form-input readonly"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        readOnly
                                        className="form-input readonly"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleChangePassword}
                                className="change-password-btn"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 12.5c-3.033 0-5.5-2.467-5.5-5.5S4.967 2.5 8 2.5s5.5 2.467 5.5 5.5-2.467 5.5-5.5 5.5z" />
                                    <path d="M8 4.5c-.828 0-1.5.672-1.5 1.5v1.5H5v4.5h6V7.5h-1.5V6c0-.828-.672-1.5-1.5-1.5z" />
                                </svg>
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-btn">Lưu thay đổi</button>
                    </div>


                </form>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="password-modal-backdrop">
                    <div className="password-modal">
                        <h2>Đổi mật khẩu</h2>

                        <div className="password-input-wrapper">
                            <label>Mật khẩu cũ</label>
                            <input
                                type={showPassword.old ? "text" : "password"}
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChangeInput}
                                placeholder="*********"
                            />
                            <div className="password-toggle-icon" onClick={() => toggleShowPassword('old')}>
                                {showPassword.old ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                )}
                            </div>
                        </div>

                        <div className="password-input-wrapper">
                            <label>Mật khẩu mới</label>
                            <input
                                type={showPassword.new ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChangeInput}
                                placeholder="Nhập mật khẩu mới"
                            />
                            <div className="password-toggle-icon" onClick={() => toggleShowPassword('new')}>
                                {showPassword.new ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                )}
                            </div>
                        </div>

                        <div className="password-input-wrapper">
                            <label>Xác nhận mật khẩu mới</label>
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChangeInput}
                                placeholder="Xác nhận mật khẩu mới"
                            />
                            <div className="password-toggle-icon" onClick={() => toggleShowPassword('confirm')}>
                                {showPassword.confirm ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                )}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={handleClosePasswordModal}>Hủy</button>
                            <button className="btn-update" onClick={handlePasswordSubmit}>Cập nhật</button>
                        </div>
                    </div>
                </div>
            )}
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
