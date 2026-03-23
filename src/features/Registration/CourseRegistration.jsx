import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { registrationService } from "@utils/registrationService";
import { courseService } from "@utils/courseService";
import { SERVER_URL } from "@config";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import PaymentModal from "./PaymentModal";
import "./CourseRegistration.css";

export default function CourseRegistration() {
    const [courses, setCourses] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ isOpen: false, title: "", message: "", type: "info" });
    const [paymentReg, setPaymentReg] = useState(null); // registration currently being paid
    const location = useLocation();
    const hasHandledDeepLink = useRef(false);

    useEffect(() => { 
        fetchData(); 
    }, []);

    const getReg = (id) => {
        const regs = myRegistrations.filter(r => r.courseId === id);
        if (regs.length === 0) return null;
        // Ưu tiên bản ghi chưa hủy
        const activeReg = regs.find(r => r.paymentStatus !== "CANCELLED");
        return activeReg || regs[0];
    };

    useEffect(() => {
        if (!loading && courses.length > 0 && !hasHandledDeepLink.current) {
            const params = new URLSearchParams(location.search);
            const courseId = params.get("courseId");
            const isPayment = params.get("payment") === "true";

            if (courseId) {
                // Scroll to the course
                setTimeout(() => {
                    const element = document.getElementById(`course-${courseId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                        element.classList.add("highlight-card");
                        setTimeout(() => element.classList.remove("highlight-card"), 3000);
                    }

                    // If payment requested, find registration and open modal
                    if (isPayment) {
                        const reg = getReg(parseInt(courseId));
                        if (reg && reg.paymentStatus === "PENDING") {
                            setPaymentReg(reg);
                        }
                    }
                }, 100);
                hasHandledDeepLink.current = true;
            }
        }
    }, [loading, courses, myRegistrations, location.search]);

    const fetchData = async () => {
        try {
            const [cRes, mRes] = await Promise.all([
                courseService.getCourses(),
                registrationService.getMyRegistrations()
            ]);
            setCourses(cRes.data?.data?.content || cRes.data?.data || []);
            setMyRegistrations(mRes.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (courseId) => {
        try {
            const res = await registrationService.register(courseId);
            setNotification({
                isOpen: true,
                title: "Đăng ký thành công!",
                message: "Khóa học đã được thêm vào mục chờ thanh toán. Vui lòng thanh toán học phí để được xếp vào lớp.",
                type: "success"
            });
            await fetchData();
        } catch (err) {
            setNotification({
                isOpen: true,
                title: "Lỗi",
                message: err.response?.data?.data || "Lỗi đăng ký",
                type: "error"
            });
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "PAID": return { label: "✓ Đã nộp học phí", className: "status-paid" };
            case "CANCELLED": return { label: "✗ Đã hủy", className: "status-cancelled" };
            default: return { label: "⏳ Chờ thanh toán", className: "status-pending" };
        }
    };

    if (loading) return (
        <div className="course-registration-container">
            <div className="registration-loading">Đang tải danh sách khóa học...</div>
        </div>
    );

    return (
        <div className="course-registration-container">
            <div className="registration-header">
                <h2>Đăng ký khóa học</h2>
                <p className="registration-subtitle">Chọn khóa học phù hợp và thanh toán học phí để bắt đầu học</p>
            </div>

            <div className="registration-grid">
                {(Array.isArray(courses) ? courses : []).map(c => {
                    const reg = getReg(c.id);
                    const { label, className } = reg ? getStatusLabel(reg.paymentStatus) : {};
                    return (
                        <div className="reg-course-card" id={`course-${c.id}`} key={c.id}>
                            <div className="course-img">
                                <img
                                    src={c.imageUrl
                                        ? (c.imageUrl.startsWith("http") ? c.imageUrl : `${SERVER_URL}${c.imageUrl}`)
                                        : "https://placehold.co/600x400"}
                                    alt={c.title}
                                />
                                {c.tuitionFee > 0 && (
                                    <div className="course-price-badge">
                                        {new Intl.NumberFormat("vi-VN").format(c.tuitionFee)} VNĐ
                                    </div>
                                )}
                            </div>
                            <div className="course-details">
                                <h3>{c.title}</h3>
                                <p className="course-desc">{c.description || "Không có mô tả"}</p>

                                <div className="course-card-footer">
                                    {reg && reg.paymentStatus !== "CANCELLED" ? (
                                        <div className="reg-status-block">
                                            <span className={`status-badge ${className}`}>{label}</span>
                                            {reg.paymentStatus === "PENDING" && (
                                                <button
                                                    className="btn-pay"
                                                    onClick={() => setPaymentReg(reg)}
                                                >
                                                    💳 Thanh toán ngay
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {reg && reg.paymentStatus === "CANCELLED" && (
                                                <span className={`status-badge ${className}`} style={{ alignSelf: "center" }}>{label}</span>
                                            )}
                                            <button className="btn-register" onClick={() => handleRegister(c.id)}>
                                                {reg && reg.paymentStatus === "CANCELLED" ? "Đăng ký lại" : "Đăng ký ngay"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Payment Modal */}
            {paymentReg && (
                <PaymentModal
                    registration={paymentReg}
                    onClose={() => setPaymentReg(null)}
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
