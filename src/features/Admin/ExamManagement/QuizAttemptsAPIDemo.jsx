import React, { useState, useEffect } from "react";
import { quizAttemptService } from "@utils/quizAttemptService";

/**
 * Demo component for Quiz Attempts API
 * Demonstrates:
 * - GET /api/v1/quiz-attempts (all attempts)
 * - GET /api/v1/quiz-attempts/{attemptId} (specific attempt detail)
 */
export default function QuizAttemptsAPIDemo() {
    const [attempts, setAttempts] = useState([]);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    /**
     * Fetch all quiz attempts
     * API: GET /api/v1/quiz-attempts
     */
    const fetchAllAttempts = async () => {
        setLoading(true);
        try {
            const response = await quizAttemptService.getAllAttempts();
            console.log("✅ All Attempts Response:", response.data);

            // Handle response structure
            const data = response?.data;
            let attemptsList = [];

            if (Array.isArray(data)) {
                attemptsList = data;
            } else if (Array.isArray(data?.content)) {
                attemptsList = data.content;
            } else if (data?.data && Array.isArray(data.data)) {
                attemptsList = data.data;
            }

            setAttempts(attemptsList);
        } catch (error) {
            console.error("❌ Error fetching attempts:", error);
            alert("Không thể tải danh sách quiz attempts");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch specific attempt detail
     * API: GET /api/v1/quiz-attempts/{attemptId}
     */
    const fetchAttemptDetail = async (attemptId) => {
        setDetailLoading(true);
        try {
            const response = await quizAttemptService.getAttemptDetail(attemptId);
            console.log(`✅ Attempt ${attemptId} Detail:`, response.data);

            setSelectedAttempt(response.data);
        } catch (error) {
            console.error(`❌ Error fetching attempt ${attemptId}:`, error);
            alert(`Không thể tải chi tiết attempt #${attemptId}`);
        } finally {
            setDetailLoading(false);
        }
    };

    // Load attempts on mount
    useEffect(() => {
        fetchAllAttempts();
    }, []);

    // Calculate statistics
    const stats = {
        total: attempts.length,
        passed: attempts.filter(a => a.passed).length,
        failed: attempts.filter(a => !a.passed).length,
        averageScore: attempts.length > 0
            ? (attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length).toFixed(2)
            : 0
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Quiz Attempts API Demo</h1>

            {/* Controls */}
            <div style={styles.controls}>
                <button
                    onClick={fetchAllAttempts}
                    disabled={loading}
                    style={styles.button}
                >
                    🔄 Reload All Attempts
                </button>

                {selectedAttempt && (
                    <button
                        onClick={() => setSelectedAttempt(null)}
                        style={{ ...styles.button, background: "#6b7280" }}
                    >
                        ← Back to List
                    </button>
                )}
            </div>

            {/* Statistics */}
            <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderLeftColor: "#f97316" }}>
                    <div style={styles.statValue}>{stats.total}</div>
                    <div style={styles.statLabel}>Total Attempts</div>
                </div>
                <div style={{ ...styles.statCard, borderLeftColor: "#10b981" }}>
                    <div style={styles.statValue}>{stats.passed}</div>
                    <div style={styles.statLabel}>Passed</div>
                </div>
                <div style={{ ...styles.statCard, borderLeftColor: "#ef4444" }}>
                    <div style={styles.statValue}>{stats.failed}</div>
                    <div style={styles.statLabel}>Failed</div>
                </div>
                <div style={{ ...styles.statCard, borderLeftColor: "#3b82f6" }}>
                    <div style={styles.statValue}>{stats.averageScore}%</div>
                    <div style={styles.statLabel}>Average Score</div>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div style={styles.loading}>Loading attempts...</div>
            ) : selectedAttempt ? (
                // Detail View
                <AttemptDetail
                    attempt={selectedAttempt}
                    loading={detailLoading}
                />
            ) : attempts.length === 0 ? (
                <div style={styles.empty}>
                    <p>No quiz attempts found</p>
                    <p style={styles.emptyHint}>Start a quiz to see attempts here</p>
                </div>
            ) : (
                // List View
                <div style={styles.attemptsList}>
                    {attempts.map((attempt) => (
                        <div
                            key={attempt.attemptId}
                            style={styles.attemptCard}
                            onClick={() => fetchAttemptDetail(attempt.attemptId)}
                        >
                            <div style={styles.attemptHeader}>
                                <div>
                                    <h3 style={styles.attemptTitle}>
                                        {attempt.quizTitle || `Quiz #${attempt.quizId}`}
                                    </h3>
                                    <p style={styles.attemptId}>Attempt #{attempt.attemptId}</p>
                                </div>
                                <div style={{
                                    ...styles.statusBadge,
                                    background: attempt.passed ? "#f0fdf4" : "#fef2f2",
                                    color: attempt.passed ? "#16a34a" : "#dc2626"
                                }}>
                                    {attempt.passed ? "✅ Passed" : "❌ Failed"}
                                </div>
                            </div>

                            <div style={styles.attemptMeta}>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Score:</span>
                                    <span style={styles.metaValue}>{attempt.score}%</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Correct:</span>
                                    <span style={styles.metaValue}>
                                        {attempt.correctCount}/{attempt.totalCount}
                                    </span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Time:</span>
                                    <span style={styles.metaValue}>
                                        {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
                                    </span>
                                </div>
                                <div style={styles.metaItem}>
                                    <span style={styles.metaLabel}>Status:</span>
                                    <span style={styles.metaValue}>{attempt.status}</span>
                                </div>
                            </div>

                            <div style={styles.attemptFooter}>
                                <span>🗓️ {new Date(attempt.startTime).toLocaleString()}</span>
                                <span style={styles.clickHint}>Click for details →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* API Documentation */}
            <div style={styles.apiDocs}>
                <h3>📚 API Documentation</h3>

                <div style={styles.apiSection}>
                    <strong>GET /api/v1/quiz-attempts</strong>
                    <p>Lấy danh sách tất cả lượt làm quiz</p>
                    <pre style={styles.code}>
                        {`// Example usage:
const response = await quizAttemptService.getAllAttempts();

// With parameters (if API supports pagination):
const response = await quizAttemptService.getAllAttempts({
  page: 0,
  size: 20,
  sort: "startTime,desc"
});

console.log("Attempts:", response.data);`}
                    </pre>
                </div>

                <div style={styles.apiSection}>
                    <strong>GET /api/v1/quiz-attempts/{'{attemptId}'}</strong>
                    <p>Lấy chi tiết một lượt làm quiz</p>
                    <pre style={styles.code}>
                        {`// Example usage:
const attemptId = 123;
const response = await quizAttemptService.getAttemptDetail(attemptId);

// Response:
{
  "attemptId": 123,
  "quizId": 10,
  "quizTitle": "Kiểm tra kiến thức Java Core",
  "userId": 1001,
  "startTime": "2025-12-24T16:11:29.988Z",
  "endTime": "2025-12-24T16:11:29.988Z",
  "score": 85,
  "correctCount": 17,
  "totalCount": 20,
  "passed": true,
  "status": "COMPLETED",
  "attemptNumber": 1,
  "timeSpentSeconds": 1200,
  "createdAt": "2025-12-24T16:11:29.988Z"
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}

// Attempt Detail Component
function AttemptDetail({ attempt, loading }) {
    if (loading) {
        return <div style={styles.loading}>Loading attempt details...</div>;
    }

    return (
        <div style={styles.detailCard}>
            <div style={styles.detailHeader}>
                <h2 style={styles.detailTitle}>
                    {attempt.quizTitle || `Quiz #${attempt.quizId}`}
                </h2>
                <div style={{
                    ...styles.statusBadge,
                    fontSize: "16px",
                    background: attempt.passed ? "#f0fdf4" : "#fef2f2",
                    color: attempt.passed ? "#16a34a" : "#dc2626"
                }}>
                    {attempt.passed ? "✅ Passed" : "❌ Failed"}
                </div>
            </div>

            <div style={styles.detailGrid}>
                <DetailItem label="Attempt ID" value={`#${attempt.attemptId}`} />
                <DetailItem label="Quiz ID" value={attempt.quizId} />
                <DetailItem label="User ID" value={attempt.userId} />
                <DetailItem label="Attempt Number" value={attempt.attemptNumber} />

                <DetailItem label="Score" value={`${attempt.score}%`} highlight />
                <DetailItem
                    label="Correct Answers"
                    value={`${attempt.correctCount} / ${attempt.totalCount}`}
                />

                <DetailItem label="Start Time" value={new Date(attempt.startTime).toLocaleString()} />
                <DetailItem label="End Time" value={new Date(attempt.endTime).toLocaleString()} />

                <DetailItem
                    label="Time Spent"
                    value={`${Math.floor(attempt.timeSpentSeconds / 60)}m ${attempt.timeSpentSeconds % 60}s`}
                />
                <DetailItem label="Status" value={attempt.status} />

                <DetailItem label="Created At" value={new Date(attempt.createdAt).toLocaleString()} />
            </div>

            <div style={styles.jsonPreview}>
                <h4>📄 Full Response Data:</h4>
                <pre style={styles.code}>
                    {JSON.stringify(attempt, null, 2)}
                </pre>
            </div>
        </div>
    );
}

function DetailItem({ label, value, highlight }) {
    return (
        <div style={styles.detailItem}>
            <div style={styles.detailLabel}>{label}</div>
            <div style={{
                ...styles.detailValue,
                ...(highlight && { fontSize: "20px", fontWeight: "700", color: "#f97316" })
            }}>
                {value}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "32px",
        maxWidth: "1400px",
        margin: "0 auto",
        fontFamily: '"Inter", sans-serif',
        background: "#f7f8fa",
        minHeight: "100vh"
    },
    title: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#111827",
        marginBottom: "24px"
    },
    controls: {
        display: "flex",
        gap: "12px",
        marginBottom: "24px"
    },
    button: {
        padding: "10px 20px",
        background: "#f97316",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "32px"
    },
    statCard: {
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        borderLeft: "4px solid",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    },
    statValue: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#111827",
        marginBottom: "4px"
    },
    statLabel: {
        fontSize: "14px",
        color: "#6b7280",
        fontWeight: "500"
    },
    loading: {
        textAlign: "center",
        padding: "48px",
        fontSize: "18px",
        color: "#6b7280"
    },
    empty: {
        textAlign: "center",
        padding: "48px",
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb"
    },
    emptyHint: {
        fontSize: "14px",
        color: "#9ca3af",
        marginTop: "8px"
    },
    attemptsList: {
        display: "grid",
        gap: "16px",
        marginBottom: "32px"
    },
    attemptCard: {
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    },
    attemptHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
        marginBottom: "16px"
    },
    attemptTitle: {
        fontSize: "18px",
        fontWeight: "600",
        color: "#111827",
        margin: "0 0 4px 0"
    },
    attemptId: {
        fontSize: "12px",
        color: "#9ca3af",
        margin: 0
    },
    statusBadge: {
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "13px",
        fontWeight: "600"
    },
    attemptMeta: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "12px",
        marginBottom: "16px"
    },
    metaItem: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    metaLabel: {
        fontSize: "12px",
        color: "#6b7280",
        fontWeight: "500"
    },
    metaValue: {
        fontSize: "16px",
        color: "#111827",
        fontWeight: "600"
    },
    attemptFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "13px",
        color: "#6b7280",
        paddingTop: "12px",
        borderTop: "1px solid #f3f4f6"
    },
    clickHint: {
        color: "#f97316",
        fontWeight: "500"
    },
    detailCard: {
        background: "white",
        padding: "32px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "32px"
    },
    detailHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
        paddingBottom: "16px",
        borderBottom: "2px solid #f3f4f6"
    },
    detailTitle: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#111827",
        margin: 0
    },
    detailGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "32px"
    },
    detailItem: {
        padding: "16px",
        background: "#f9fafb",
        borderRadius: "8px"
    },
    detailLabel: {
        fontSize: "12px",
        color: "#6b7280",
        fontWeight: "500",
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    detailValue: {
        fontSize: "16px",
        color: "#111827",
        fontWeight: "600"
    },
    jsonPreview: {
        marginTop: "32px"
    },
    apiDocs: {
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb"
    },
    apiSection: {
        marginBottom: "24px"
    },
    code: {
        background: "#1f2937",
        color: "#f9fafb",
        padding: "16px",
        borderRadius: "8px",
        fontSize: "13px",
        overflow: "auto",
        marginTop: "8px",
        lineHeight: "1.6"
    }
};
