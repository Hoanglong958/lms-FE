import React, { useEffect, useState } from "react";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./ExamManagement.css"; // Reuse CSS or create new
import { useNavigate, useOutletContext } from "react-router-dom";
import AdminHeader from "@components/Admin/AdminHeader";
import { quizAttemptService } from "@utils/quizAttemptService.js";
import { quizResultService } from "@utils/quizResultService.js";

export default function QuizManagement() {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Filter states
    const [searchQuizId, setSearchQuizId] = useState("");
    const [searchUserId, setSearchUserId] = useState("");

    const [notification, setNotification] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const showNotification = (title, message, type = "info") => {
        setNotification({ isOpen: true, title, message, type });
    };

    const loadAttempts = async () => {
        setLoading(true);
        try {
            let res;
            // Priority: Search by User -> Search by Quiz -> List All
            if (searchUserId) {
                res = await quizAttemptService.getAttemptsByUser(searchUserId);
            } else if (searchQuizId) {
                res = await quizAttemptService.getAttemptsByQuiz(searchQuizId);
            } else {
                // Return all results using the valid endpoint found for results
                res = await quizResultService.getResults();
            }

            const raw = res?.data ?? {};
            const apiArr = Array.isArray(raw)
                ? raw
                : Array.isArray(raw.data)
                    ? raw.data
                    : Array.isArray(raw.content)
                        ? raw.content
                        : [];

            const mapped = apiArr.map(a => ({
                id: a.id,
                quizTitle: a.quizTitle || a.quiz?.title || `Quiz #${a.quizId}`,
                userName: a.userName || a.user?.fullName || a.user?.username || `User #${a.userId}`,
                score: a.score ?? 0,
                status: a.status || "Completed",
                submittedAt: a.submittedAt || a.createdAt,
            }));

            setAttempts(mapped);
        } catch (err) {
            console.error("Failed to load quiz attempts", err);
            // Don't clear attempts immediately to avoid flickering if just a filter fail, 
            // but for now let's clear if it's a "load all" fail
            if (!searchQuizId && !searchUserId) {
                setAttempts([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttempts();
    }, [searchQuizId, searchUserId]);
    // Note: Debounce handling for searches would be better in real app

    const { toggleSidebar } = useOutletContext() || {};

    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(attempts.length / pageSize));
    const curPage = Math.min(page, totalPages);
    const start = (curPage - 1) * pageSize;
    const pageItems = attempts.slice(start, start + pageSize);

    return (
        <div className="exam-management-container">
            <AdminHeader
                title="Quản lý bài Quiz (Attempts)"
                breadcrumb={[
                    { label: "Dashboard", to: "/admin/dashboard" },
                    { label: "Bài Quiz", to: "/admin/quiz" },
                ]}
                onMenuToggle={toggleSidebar}
            />

            <div className="exam-content-page">
                {/* Stats or Filters */}
                <div className="exam-stats">
                    <div className="exam-card">
                        <p className="exam-card-title">Tổng lượt làm</p>
                        <h3>{attempts.length}</h3>
                    </div>
                    {/* Add more stats if needed */}
                </div>

                {/* Search Bar */}
                <div className="exam-searchbar" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Tìm theo ID người dùng..."
                        value={searchUserId}
                        onChange={(e) => setSearchUserId(e.target.value)}
                        className="exam-search-input"
                        style={{ maxWidth: 200 }}
                    />
                    <input
                        type="text"
                        placeholder="Tìm theo ID Quiz..."
                        value={searchQuizId}
                        onChange={(e) => setSearchQuizId(e.target.value)}
                        className="exam-search-input"
                        style={{ maxWidth: 200 }}
                    />
                    <button className="exam-btn add" onClick={loadAttempts}>
                        Tìm kiếm
                    </button>
                </div>

                {/* Table */}
                <div className="exam-table-container">
                    <table className="exam-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Người dùng</th>
                                <th>Quiz</th>
                                <th>Điểm số</th>
                                <th>Ngày nộp</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>Đang tải...</td></tr>
                            ) : pageItems.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 20 }}>Không có dữ liệu</td></tr>
                            ) : (
                                pageItems.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.userName}</td>
                                        <td>{item.quizTitle}</td>
                                        <td>{item.score}</td>
                                        <td>{new Date(item.submittedAt).toLocaleDateString("vi-VN")}</td>
                                        <td>
                                            <span className={`status-badge ${item.status === 'Completed' ? 'done' : 'ongoing'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon"
                                                onClick={() => showNotification("Info", "Xem chi tiết: " + item.id)}
                                                title="Chi tiết"
                                            >
                                                👁️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="exam-pagination">
                    <button
                        className="page-btn"
                        disabled={curPage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        ‹ Trước
                    </button>
                    <span className="page-info">
                        Trang {curPage}/{totalPages}
                    </span>
                    <button
                        className="page-btn"
                        disabled={curPage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        Sau ›
                    </button>
                </div>

            </div>

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
