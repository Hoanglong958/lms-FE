import React, { useState, useEffect } from "react";
import { registrationService } from "@utils/registrationService";
import { courseService } from "@utils/courseService";
import { SERVER_URL } from "@config";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./CourseRegistration.css";

export default function CourseRegistration() {
    const [courses, setCourses] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ isOpen: false, title: "", message: "", type: "info" });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [cRes, mRes] = await Promise.all([courseService.getCourses(), registrationService.getMyRegistrations()]);
            setCourses(cRes.data?.data?.content || cRes.data?.data || []);
            setMyRegistrations(mRes.data?.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleRegister = async (courseId) => {
        try {
            await registrationService.register(courseId);
            setNotification({ isOpen: true, title: "Thành công", message: "Đã đăng ký! Vui lòng nộp học phí.", type: "success" });
            fetchData();
        } catch (err) {
            setNotification({ isOpen: true, title: "Lỗi", message: err.response?.data?.data || "Lỗi đăng ký", type: "error" });
        }
    };

    const isRegistered = (id) => myRegistrations.some(r => r.courseId === id);
    const getReg = (id) => myRegistrations.find(r => r.courseId === id);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="course-registration-container">
            <h2>Đăng ký khóa học</h2>
            <div className="registration-grid">
                {(Array.isArray(courses) ? courses : []).map(c => (
                    <div className="reg-course-card" key={c.id}>
                        <div className="course-img">
                            <img src={c.imageUrl ? (c.imageUrl.startsWith("http") ? c.imageUrl : `${SERVER_URL}${c.imageUrl}`) : "https://placehold.co/600x400"} alt={c.title} />
                        </div>
                        <div className="course-details">
                            <h3>{c.title}</h3>
                            <p className="fee">{new Intl.NumberFormat('vi-VN').format(c.tuitionFee || 0)} VNĐ</p>
                            {isRegistered(c.id) ? (
                                <span className={`status-badge status-${getReg(c.id).paymentStatus.toLowerCase()}`}>
                                    {getReg(c.id).paymentStatus === "PENDING" ? "Chờ thanh toán" : "Đã nộp học phí"}
                                </span>
                            ) : (
                                <button className="btn-register" onClick={() => handleRegister(c.id)}>Đăng ký</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification(n => ({ ...n, isOpen: false }))} {...notification} />
        </div>
    );
}
