import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { authService } from "@utils/authService";
import { uploadService } from "@utils/uploadService";
import { userService } from "@utils/userService";
import { SERVER_URL } from "@config";
import getCroppedImg from "@utils/canvasUtils";
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
        lastName: "",
        firstName: "",
        email: "",
        phone: "",
        avatar: null,
    });

    const [uploading, setUploading] = useState(false);

    // Cropper State
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);

    const [notification, setNotification] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await authService.getProfile();
                const profile = res.data;

                // Split fullName into LastName and FirstName
                let lastName = "";
                let firstName = "";
                if (profile.fullName) {
                    const parts = profile.fullName.trim().split(" ");
                    if (parts.length > 1) {
                        firstName = parts.pop();
                        lastName = parts.join(" ");
                    } else {
                        firstName = parts[0];
                    }
                }

                setFormData({
                    lastName: lastName,
                    firstName: firstName,
                    email: profile.email || profile.gmail || "",
                    phone: profile.phone || "",
                    avatar: profile.avatar || profile.imageUrl || null,
                });
            } catch (error) {
                console.error("Fetch profile error:", error);
                showNotification("Lỗi", "Không thể tải thông tin cá nhân", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

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
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl);
            setShowCropModal(true);
        }
    };

    const readFile = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            setUploading(true);
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

            // Upload blob directly
            // We need to create a File object from Blob or append blob to FormData in logic
            // uploadService usually expects a File or Blob. Let's check uploadService usage. 
            // Usually we append to formData.

            // Create a file from blob to preserve name if needed, or just pass blob
            const file = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });

            const res = await uploadService.uploadImage(file);
            // Standardized response handling like ManageCourses
            const url = res.data?.url || res.data?.data || res.data;

            if (url) {
                setFormData(prev => ({ ...prev, avatar: url }));
                showNotification("Thành công", "Cập nhật ảnh đại diện thành công", "success");
                setShowCropModal(false);
                setImageSrc(null);
            }
        } catch (e) {
            console.error(e);
            showNotification("Lỗi", "Tải ảnh thất bại", "error");
        } finally {
            setUploading(false);
        }
    }, [imageSrc, croppedAreaPixels]);

    const handleCloseCrop = () => {
        setShowCropModal(false);
        setImageSrc(null);
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
        setUploading(true);
        try {
            const payload = {
                fullName: `${formData.lastName} ${formData.firstName}`.trim(),
                phone: formData.phone,
                avatar: formData.avatar
            };

            await authService.updateProfile(payload);

            // Update local storage 
            const updatedUser = {
                ...user,
                fullName: payload.fullName,
                phone: payload.phone,
                avatar: payload.avatar,
                imageUrl: payload.avatar
            };
            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

            showNotification("Thành công", "Thông tin đã được lưu!", "success");
        } catch (err) {
            console.error(err);
            showNotification("Lỗi", "Cập nhật thất bại", "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="profile-edit-container">
            <div className="profile-edit-wrapper">
                <div className="profile-page-header">
                    <h1 className="profile-edit-title">Hồ sơ của tôi</h1>
                </div>

                {loading ? (
                    <div className="profile-loading">Đang tải thông tin...</div>
                ) : (
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

                        {/* Crop Modal */}
                        {showCropModal && (
                            <div className="crop-modal-overlay">
                                <div className="crop-modal-container">
                                    <div className="crop-modal-header">
                                        <h3>Cập nhật ảnh đại diện</h3>
                                        <button type="button" className="close-btn" onClick={handleCloseCrop}>&times;</button>
                                    </div>
                                    <div className="crop-container">
                                        <Cropper
                                            image={imageSrc}
                                            crop={crop}
                                            zoom={zoom}
                                            aspect={1}
                                            cropShape="round"
                                            showGrid={false}
                                            onCropChange={setCrop}
                                            onCropComplete={onCropComplete}
                                            onZoomChange={setZoom}
                                        />
                                    </div>
                                    <div className="crop-controls">
                                        <div className="zoom-control">
                                            <label>Thu phóng</label>
                                            <input
                                                type="range"
                                                value={zoom}
                                                min={1}
                                                max={3}
                                                step={0.1}
                                                aria-labelledby="Zoom"
                                                onChange={(e) => setZoom(Number(e.target.value))}
                                                className="zoom-range"
                                            />
                                        </div>
                                        <div className="crop-actions">
                                            <button type="button" className="btn-cancel" onClick={handleCloseCrop}>Hủy</button>
                                            <button type="button" className="btn-save" onClick={showCroppedImage} disabled={uploading}>
                                                {uploading ? "Đang xử lý..." : "Lưu"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                )}
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
