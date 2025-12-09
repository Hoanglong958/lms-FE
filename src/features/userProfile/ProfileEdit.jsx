import React, { useState } from "react";
import { authService } from "@utils/authService";
import "./ProfileEdit.css";

export default function ProfileEdit() {
    const [formData, setFormData] = useState({
        lastName: "Nguyễn",
        firstName: "Ánh Viên",
        email: "vien@gmail.com",
        birthDate: "15/03/2006",
        phone: "0981 965 304",
        studentId: "PT242",
    });

    const [profileImage, setProfileImage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ["image/png", "image/jpeg", "image/jpg"];
            if (!validTypes.includes(file.type)) {
                alert("Vui lòng chọn file ảnh định dạng PNG hoặc JPG");
                return;
            }

            // Validate file size (200x200px requirement would be checked on image load)
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
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
            alert("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp");
            return;
        }

        if (newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }

        try {
            await authService.changePassword({ oldPassword, newPassword });
            alert("Đổi mật khẩu thành công!");
            handleClosePasswordModal();
        } catch (error) {
            console.error("Change password error:", error);
            const msg = error.response?.data?.message || "Đổi mật khẩu thất bại";
            alert(msg);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement save logic
        console.log("Form data:", formData);
        alert("Thông tin đã được lưu!");
    };

    return (
        <div className="profile-edit-container">
            <div className="profile-edit-wrapper">
                <div className="profile-page-header">
                    <h1 className="profile-edit-title">Chỉnh sửa thông tin</h1>

                    <div className="profile-edit-notice">
                        <p>
                            Tại đây bạn có thể xem các thông tin hiển thị của mình và chỉnh sửa ảnh đại diện.
                        </p>
                        <p>
                            Các thông tin cá nhân còn lại là mặc định và không thể chỉnh sửa.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="profile-edit-form">
                    <div className="profile-edit-content">
                        {/* Left Side - Profile Picture */}
                        <div className="profile-picture-section">
                            <h2 className="section-title">Ảnh đại diện</h2>

                            <div className="profile-picture-wrapper">
                                <div className="profile-picture">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" />
                                    ) : (
                                        <div className="profile-picture-placeholder">
                                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                                <circle cx="40" cy="30" r="12" fill="#D9D9D9" />
                                                <path d="M20 65C20 55 28 48 40 48C52 48 60 55 60 65" fill="#D9D9D9" />
                                            </svg>
                                        </div>
                                    )}
                                    <label htmlFor="profile-upload" className="upload-button">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" />
                                            <path d="M20 7H17L15 5H9L7 7H4C2.9 7 2 7.9 2 9V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V9C22 7.9 21.1 7 20 7Z" />
                                        </svg>
                                    </label>
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={handleImageUpload}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>

                            <p className="image-requirements">
                                Kích thước ảnh cho nhất: 200 x 200px, định dạng PNG hoặc JPG
                            </p>
                        </div>

                        {/* Right Side - Personal Information */}
                        <div className="personal-info-section">
                            <h2 className="section-title">Thông tin cá nhân</h2>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="lastName">Họ</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        readOnly
                                        className="form-input readonly"
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
                                        readOnly
                                        className="form-input readonly"
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
                                    <label htmlFor="birthDate">Ngày sinh</label>
                                    <input
                                        type="text"
                                        id="birthDate"
                                        name="birthDate"
                                        value={formData.birthDate}
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

                                <div className="form-group">
                                    <label htmlFor="studentId">Mã sinh viên</label>
                                    <input
                                        type="text"
                                        id="studentId"
                                        name="studentId"
                                        value={formData.studentId}
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
        </div>
    );
}
