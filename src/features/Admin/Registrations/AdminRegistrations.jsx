import React, { useState, useEffect } from "react";
import { registrationService } from "@utils/registrationService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./AdminRegistrations.css";

export default function AdminRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ isOpen: false, title: "", message: "", type: "info" });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const res = await registrationService.getAllRegistrations();
            setRegistrations(res.data?.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleConfirm = async (id) => {
        try {
            await registrationService.confirmPayment(id);
            setNotification({ isOpen: true, title: "Thành công", message: "Đã xác nhận thanh toán và thêm sinh viên vào lớp.", type: "success" });
            fetchAll();
        } catch (err) {
            setNotification({ isOpen: true, title: "Lỗi", message: "Không thể xác nhận thanh toán.", type: "error" });
        }
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="admin-registrations-container">
            <h2>Quản lý Đăng ký & Học phí</h2>
            <table className="reg-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Sinh viên</th>
                        <th>Khóa học</th>
                        <th>Học phí</th>
                        <th>Ngày đăng ký</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {registrations.map(r => (
                        <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.studentName}</td>
                            <td>{r.courseTitle}</td>
                            <td>{new Intl.NumberFormat('vi-VN').format(r.amount)} VNĐ</td>
                            <td>{new Date(r.registrationDate).toLocaleDateString()}</td>
                            <td>
                                <span className={`status-badge status-${r.paymentStatus.toLowerCase()}`}>
                                    {r.paymentStatus === "PAID" ? "Đã nộp" : "Chờ xử lý"}
                                </span>
                            </td>
                            <td>
                                {r.paymentStatus === "PENDING" && (
                                    <button className="btn-confirm" onClick={() => handleConfirm(r.id)}>Xác nhận nộp tiền</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification(n => ({ ...n, isOpen: false }))} {...notification} />
        </div>
    );
}
