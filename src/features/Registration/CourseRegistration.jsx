import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { registrationService } from "@utils/registrationService";
import { courseService } from "@utils/courseService";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { SERVER_URL } from "@config";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import PaymentModal from "./PaymentModal";
import CourseDetailModal from "./CourseDetailModal";
import "./CourseRegistration.css";
import AdminPagination from "@shared/components/Admin/AdminPagination";

export default function CourseRegistration() {
    const [courses, setCourses] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ isOpen: false, title: "", message: "", type: "info" });
    const [paymentReg, setPaymentReg] = useState(null); // registration currently being paid
    const [detailCourseId, setDetailCourseId] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    
    // New states for Search, Sort, Pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize] = useState(6);
    const [sortBy, setSortBy] = useState("createdAt,desc");
    const [regStatus, setRegStatus] = useState("ALL");
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [openSort, setOpenSort] = useState(false);

    const location = useLocation();
    const hasHandledDeepLink = useRef(false);

    useEffect(() => { 
        fetchData(); 
    }, [page, sortBy, regStatus]); // Re-fetch on page, sort, or status change

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
        setLoading(true);
        try {
            const params = {
                q: searchTerm,
                page: page,
                size: pageSize,
                sort: sortBy,
                regStatus: regStatus
            };

            const [cRes, mRes] = await Promise.all([
                courseService.getCoursesPaging(params),
                registrationService.getMyRegistrations()
            ]);
            
            const courseData = cRes.data?.data;
            setCourses(courseData?.content || []);
            setTotalPages(courseData?.totalPages || 0);
            setTotalElements(courseData?.totalElements || 0);
            setMyRegistrations(mRes.data?.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setPage(0);
        fetchData();
    };


    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
            // Scroll to top of grid
            const header = document.querySelector(".registration-header");
            if (header) header.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleRegister = async (courseId) => {
        try {
            const res = await registrationService.register(courseId);
            setNotification({
                isOpen: true,
                title: "Đăng ký thành công!",
                message: "Khóa học đã được thêm vào mục chờ thanh toán. Vui lòng chuyển khoản đúng mã để hệ thống tự động xác nhận và xếp lớp.",
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
            default: return { label: "⏳ Chờ hệ thống xác nhận", className: "status-pending" };
        }
    };

    // No early return for loading to prevent unmounting filters

    return (
        <div className="course-registration-container">
            <div className="registration-header">
                <h2>Đăng ký khóa học</h2>
                <p className="registration-subtitle">Chọn khóa học phù hợp và thanh toán học phí để bắt đầu học</p>
            </div>

            {/* Search and Sort Row */}
            <div className="registration-filters-container">
                <div className="reg-search-wrapper">
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="Tìm kiếm khóa học..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onPressEnter={handleSearchSubmit}
                        size="large"
                        allowClear
                    />
                </div>

                <div className="reg-status-wrapper">
                    <Select
                        value={regStatus}
                        onChange={(val) => {
                            setRegStatus(val);
                            setPage(0);
                        }}
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="Chọn trạng thái"
                    >
                        <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
                        <Select.Option value="NONE">Chưa đăng ký</Select.Option>
                        <Select.Option value="PENDING">Chờ thanh toán</Select.Option>
                        <Select.Option value="PAID">Đã thanh toán</Select.Option>
                    </Select>
                </div>

                <div className="sort-dropdown-wrapper">
                    <div
                        className="sort-selected"
                        onClick={() => setOpenSort(!openSort)}
                    >
                        {sortBy === "createdAt,desc" ? "Mới nhất" : 
                         sortBy === "createdAt,asc" ? "Cũ nhất" : 
                         sortBy === "title,asc" ? "Tên A-Z" : "Tên Z-A"} ▼
                    </div>

                    {openSort && (
                        <div className="sort-menu">
                            <span
                                className={sortBy === "createdAt,desc" ? "active" : ""}
                                onClick={() => {
                                    setSortBy("createdAt,desc");
                                    setPage(0);
                                    setOpenSort(false);
                                }}
                            >
                                Mới nhất
                            </span>
                            <span
                                className={sortBy === "createdAt,asc" ? "active" : ""}
                                onClick={() => {
                                    setSortBy("createdAt,asc");
                                    setPage(0);
                                    setOpenSort(false);
                                }}
                            >
                                Cũ nhất
                            </span>
                            <span
                                className={sortBy === "title,asc" ? "active" : ""}
                                onClick={() => {
                                    setSortBy("title,asc");
                                    setPage(0);
                                    setOpenSort(false);
                                }}
                            >
                                Tên A-Z
                            </span>
                            <span
                                className={sortBy === "title,desc" ? "active" : ""}
                                onClick={() => {
                                    setSortBy("title,desc");
                                    setPage(0);
                                    setOpenSort(false);
                                }}
                            >
                                Tên Z-A
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className={`registration-content ${loading ? "loading-active" : ""}`}>
                {totalElements > 0 && (
                    <div className="registration-results-count">
                        Tìm thấy <b>{totalElements}</b> khóa học
                    </div>
                )}
                {!loading && totalElements === 0 && (
                    <div className="registration-results-count">
                        Không tìm thấy khóa học nào phù hợp.
                    </div>
                )}

                <div className="registration-grid">
                    {(Array.isArray(courses) ? courses : []).map(c => {
                            const reg = getReg(c.id);
                            const { label, className } = reg ? getStatusLabel(reg.paymentStatus) : {};
                            return (
                                <div
                                    className="reg-course-card"
                                    id={`course-${c.id}`}
                                    key={c.id}
                                    onClick={(event) => {
                                        const targetButton = event.target.closest("button");
                                        if (targetButton) return;
                                        setDetailCourseId(c.id);
                                        setDetailVisible(true);
                                    }}
                                >
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
                                        <div className="course-card-actions">
                                            {/* <button className="btn-details" onClick={() => {
                                                setDetailCourseId(c.id);
                                                setDetailVisible(true);
                                            }}>
                                                Xem chi tiết
                                            </button> */}
                                        </div>

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

                    {/* Unified Admin Pagination */}
                    <AdminPagination
                        currentPage={page + 1}
                        totalPages={totalPages}
                        onPageChange={(p) => handlePageChange(p - 1)}
                    />
            </div>

            {/* Payment Modal */}
            {paymentReg && (
                <PaymentModal
                    registration={paymentReg}
                    onClose={() => setPaymentReg(null)}
                    onPaymentConfirmed={() => {
                        setPaymentReg(null);
                        setNotification({
                            isOpen: true,
                            title: "Đang chờ hệ thống xác nhận",
                            message: "Khi SePay nhận giao dịch khớp mã chuyển khoản và số tiền, hệ thống sẽ tự động cập nhật và thêm bạn vào lớp.",
                            type: "info"
                        });
                    }}
                />
            )}

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(n => ({ ...n, isOpen: false }))}
                {...notification}
            />
            <CourseDetailModal
                courseId={detailCourseId}
                open={detailVisible}
                onClose={() => {
                    setDetailVisible(false);
                    setDetailCourseId(null);
                }}
            />
        </div>
    );
}
