import React, { useState } from "react";
import { quizAttemptService } from "@utils/quizAttemptService.js";
import { quizResultService } from "@utils/quizResultService.js";
import "./ExamManagement.css";

export default function QuizAttemptsTest() {
    const [resultsData, setResultsData] = useState(null);
    const [attemptsData, setAttemptsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [quizId, setQuizId] = useState("1");

    const testQuizResults = async () => {
        setLoading(true);
        try {
            const res = await quizResultService.getResults();
            console.log("📝 Quiz Results API Response:", res);
            setResultsData(res.data);
        } catch (err) {
            console.error("❌ Quiz Results Error:", err);
            setResultsData({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const testQuizAttempts = async () => {
        setLoading(true);
        try {
            const res = await quizAttemptService.getAttemptsByQuiz(quizId);
            console.log("📋 Quiz Attempts API Response:", res);
            setAttemptsData(res.data);
        } catch (err) {
            console.error("❌ Quiz Attempts Error:", err);
            setAttemptsData({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="exam-management-container" style={{ padding: 20 }}>
            <h1>🧪 Quiz API Test Page</h1>

            <div style={{ marginBottom: 30, padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
                <h2>1️⃣ Test Quiz Results API</h2>
                <p><code>GET /api/v1/quiz-results</code></p>
                <button
                    className="exam-btn add"
                    onClick={testQuizResults}
                    disabled={loading}
                >
                    Call Quiz Results API
                </button>

                {resultsData && (
                    <div style={{ marginTop: 20, padding: 15, background: 'white', borderRadius: 5 }}>
                        <h3>Response:</h3>
                        <pre style={{ overflow: 'auto', maxHeight: 300 }}>
                            {JSON.stringify(resultsData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: 30, padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
                <h2>2️⃣ Test Quiz Attempts API</h2>
                <p><code>GET /api/v1/quiz-attempts/by-quiz/{"{quizId}"}</code></p>
                <div style={{ marginBottom: 10 }}>
                    <label>Quiz ID: </label>
                    <input
                        type="text"
                        value={quizId}
                        onChange={(e) => setQuizId(e.target.value)}
                        style={{ marginLeft: 10, padding: 5 }}
                    />
                </div>
                <button
                    className="exam-btn add"
                    onClick={testQuizAttempts}
                    disabled={loading}
                >
                    Call Quiz Attempts API
                </button>

                {attemptsData && (
                    <div style={{ marginTop: 20, padding: 15, background: 'white', borderRadius: 5 }}>
                        <h3>Response:</h3>
                        <pre style={{ overflow: 'auto', maxHeight: 300 }}>
                            {JSON.stringify(attemptsData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <div style={{ padding: 20, background: '#e3f2fd', borderRadius: 8 }}>
                <h3>📊 Summary:</h3>
                <ul>
                    <li><strong>Quiz Results:</strong> {resultsData ? (Array.isArray(resultsData) ? `${resultsData.length} items` : 'Error or Object') : 'Not tested yet'}</li>
                    <li><strong>Quiz Attempts:</strong> {attemptsData ? (Array.isArray(attemptsData) ? `${attemptsData.length} items` : 'Error or Object') : 'Not tested yet'}</li>
                </ul>
            </div>
        </div>
    );
}
