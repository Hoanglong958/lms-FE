import React, { useEffect, useState } from "react";
import { quizAttemptService } from "@utils/quizAttemptService.js";
import { userService } from "@utils/userService.js";
import "./QuizManagement.css";

// Helper function to generate avatar color based on name
const getAvatarColor = (name) => {
    const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
};

// Helper function to get initials from name
const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export default function QuizManagement() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const loadAttempts = async () => {
        setLoading(true);
        try {
            // ✅ FIXED: Get ALL attempts instead of just quiz ID 1
            const res = await quizAttemptService.getAllAttempts();

            console.log("🔍 Quiz Attempts Response:", res);

            let apiArr = [];
            if (Array.isArray(res?.data)) {
                apiArr = res.data;
            } else if (res?.data && typeof res.data === 'object') {
                const raw = res.data;
                if (Array.isArray(raw.data)) {
                    apiArr = raw.data;
                } else if (Array.isArray(raw.content)) {
                    apiArr = raw.content;
                }
            }

            console.log("📊 Parsed attempts:", apiArr);
            console.log(`✅ Total attempts loaded: ${apiArr.length}`);

            // ✨ ĐỒNG BỘ DỮ LIỆU TỪ BẢNG USERS (Lấy FullName và Gmail)
            let usersMap = {};
            try {
                const usersResponse = await userService.getAllUsers({ size: 1000 });
                let userList = [];

                // Trích xuất mảng user từ API (kiểm tra mọi trường hợp cấu trúc trả về)
                if (Array.isArray(usersResponse?.data?.content)) {
                    userList = usersResponse.data.content;
                } else if (Array.isArray(usersResponse?.data?.data)) {
                    userList = usersResponse.data.data;
                } else if (Array.isArray(usersResponse?.data)) {
                    userList = usersResponse.data;
                } else if (usersResponse?.data && typeof usersResponse.data === 'object') {
                    // Trường hợp data là 1 object lồng array (hiếm gặp nhưng cứ check)
                    const potentialArray = Object.values(usersResponse.data).find(Array.isArray);
                    if (potentialArray) userList = potentialArray;
                }

                // Tạo Map để tra cứu theo ID
                usersMap = userList.reduce((map, u) => {
                    // Chuyển ID sang string để so sánh chính xác
                    const id = String(u.id);
                    map[id] = u;
                    return map;
                }, {});

                console.log("📁 Bản đồ User từ database:", usersMap);
            } catch (err) {
                console.error("❌ Không thể lấy danh sách User:", err);
            }

            const mapped = apiArr.map((attempt, idx) => {
                // Lấy User ID từ attempt (thử mọi trường hợp có thể có)
                const rawUid = attempt.userId || (attempt.user && attempt.user.id);
                const uid = rawUid ? String(rawUid) : "";

                // Tìm User tương ứng trong bảng Users
                const userObj = usersMap[uid];

                // TRUY XUẤT THÔNG TIN THẬT (Dựa theo ảnh Database)
                // 1. Tên: Ưu tiên fullName từ bảng User
                const finalName = userObj?.fullName || attempt.userName || `Học viên #${uid || idx + 1}`;

                // 2. Email: Ưu tiên gmail từ bảng User (đúng tên cột gmail trong DB)
                const finalEmail = userObj?.gmail || userObj?.email || attempt.userEmail || `user${uid}@edu.vn`;

                if (idx === 0) {
                    console.log("🔍 Debug dòng đầu tiên:", {
                        "Attempt ID": attempt.id || attempt.attemptId,
                        "User ID trích xuất": uid,
                        "Dữ liệu User tìm thấy": userObj,
                        "Tên sẽ hiển thị": finalName
                    });
                }

                return {
                    id: attempt.attemptId || attempt.id,
                    quizId: attempt.quizId,
                    userId: uid,
                    userName: finalName,
                    userEmail: finalEmail,
                    quizTitle: attempt.quizTitle || `Bài thi #${attempt.quizId}`,
                    quizSubtitle: `ID Quiz: ${attempt.quizId}`,
                    score: attempt.score ?? 0,
                    maxScore: attempt.totalCount ? attempt.totalCount * 5 : 10,
                    correctCount: attempt.correctCount,
                    totalCount: attempt.totalCount,
                    passed: attempt.passed,
                    status: attempt.status || "SUBMITTED",
                    submittedAt: attempt.endTime || attempt.submittedAt || attempt.createdAt,
                    timeSpent: attempt.timeSpentSeconds,
                };
            });

            console.log("✅ Final mapped attempts with user names:", mapped);
            setAttempts(mapped);
        } catch (err) {
            console.error("❌ Failed to load quiz attempts", err);
            setAttempts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttempts();
    }, []);

    // Calculate stats
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.status === "SUBMITTED").length;
    const ongoingAttempts = attempts.filter(a => a.status !== "SUBMITTED").length;
    const avgScore = attempts.length > 0
        ? Math.round((attempts.reduce((sum, a) => sum + (a.score / a.maxScore * 100), 0) / attempts.length))
        : 0;

    // Filter attempts
    const filteredAttempts = attempts.filter(a => {
        const matchesSearch = searchQuery === "" ||
            a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.quizTitle.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus === "all" || a.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredAttempts.length / pageSize));
    const curPage = Math.min(page, totalPages);
    const start = (curPage - 1) * pageSize;
    const pageItems = filteredAttempts.slice(start, start + pageSize);

    return (
        <div className="quiz-management-container">
            {/* Breadcrumb */}
            <div className="quiz-breadcrumb">
                <a href="/admin/dashboard">Dashboard</a>
                <span>/</span>
                <span>Bài Quiz</span>
            </div>

            {/* Header */}
            <div className="quiz-header">
                <div className="quiz-header-left">
                    <div className="quiz-icon">❓</div>
                    <div className="quiz-title-section">
                        <h1>Quản lý bài Quiz</h1>
                        <p>Quản lý danh sách câu hỏi sẵn sàng cho các quiz</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="quiz-stats-grid">
                <div className="quiz-stat-card orange">
                    <div className="quiz-stat-icon">📋</div>
                    <div className="quiz-stat-content">
                        <h3>{totalAttempts}</h3>
                        <p>Tổng lượt làm</p>
                    </div>
                </div>

                <div className="quiz-stat-card green">
                    <div className="quiz-stat-icon">✅</div>
                    <div className="quiz-stat-content">
                        <h3>{completedAttempts}</h3>
                        <p>Hoàn thành</p>
                    </div>
                </div>

                <div className="quiz-stat-card blue">
                    <div className="quiz-stat-icon">⏱️</div>
                    <div className="quiz-stat-content">
                        <h3>{ongoingAttempts}</h3>
                        <p>Đang làm</p>
                    </div>
                </div>

                <div className="quiz-stat-card purple">
                    <div className="quiz-stat-icon">🏆</div>
                    <div className="quiz-stat-content">
                        <h3>{avgScore}%</h3>
                        <p>Điểm TB</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="quiz-search-section">
                <input
                    type="text"
                    className="quiz-search-input"
                    placeholder="Tìm theo ID Quiz, tên học viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="quiz-filter-btn">
                    ⚙️ Tất cả trạng thái
                </button>
                <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
                    Tìm thấy: <span className="quiz-count-badge">{filteredAttempts.length}</span> lượt làm
                </div>
            </div>

            {/* Table */}
            <div className="quiz-table-container">
                <table className="quiz-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>👤 NGƯỜI DÙNG</th>
                            <th>📚 QUIZ</th>
                            <th>🎯 ĐIỂM SỐ</th>
                            <th>🕐 NGÀY NỘP</th>
                            <th>TRẠNG THÁI</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="quiz-loading">
                                    <div>⏳ Đang tải dữ liệu...</div>
                                </td>
                            </tr>
                        ) : pageItems.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="quiz-empty">
                                    <div className="quiz-empty-icon">📭</div>
                                    <div>Không có dữ liệu</div>
                                </td>
                            </tr>
                        ) : (
                            pageItems.map((item, index) => (
                                <tr key={item.id}>
                                    <td>#{item.id}</td>
                                    <td>
                                        <div className="quiz-user-cell">
                                            <div
                                                className="quiz-user-avatar"
                                                style={{ background: getAvatarColor(item.userName) }}
                                            >
                                                {getInitials(item.userName)}
                                            </div>
                                            <div className="quiz-user-info">
                                                <h4>{item.userName}</h4>
                                                <p>{item.userEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <strong>{item.quizTitle}</strong>
                                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                                {item.quizSubtitle}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="quiz-score">
                                            🎯 {item.score}/{item.maxScore}
                                            <span className="quiz-score-percent">
                                                {Math.round((item.score / item.maxScore) * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            {new Date(item.submittedAt).toLocaleDateString('vi-VN')}
                                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                                {new Date(item.submittedAt).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`quiz-status-badge ${item.status === 'SUBMITTED' ? 'completed' :
                                            item.status === 'PENDING' ? 'pending' : 'submitted'
                                            }`}>
                                            {item.status === 'SUBMITTED' && '✓ Hoàn thành'}
                                            {item.status === 'PENDING' && '⏳ Đang chờ'}
                                            {item.status !== 'SUBMITTED' && item.status !== 'PENDING' && item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="quiz-actions">
                                            <button
                                                className="quiz-action-btn"
                                                title="Xem chi tiết"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="quiz-action-btn delete"
                                                title="Xóa"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && pageItems.length > 0 && (
                    <div className="quiz-pagination">
                        <button
                            className="quiz-page-btn"
                            disabled={curPage <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            ‹ Trước
                        </button>
                        <span className="quiz-page-info">
                            Trang {curPage}/{totalPages}
                        </span>
                        <button
                            className="quiz-page-btn"
                            disabled={curPage >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                            Sau ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
