import { useState, useRef, useEffect, useCallback } from "react";
import "./AIChatWidget.css";
import { askAI, checkAIHealth } from "./aiService";

const QUICK_ACTIONS = [
    {
        type: "DEADLINE",
        emoji: "📚",
        label: "Deadline bài tập",
        defaultQ: "Tôi có những bài tập nào sắp đến hạn nộp?",
    },
    {
        type: "EXAM",
        emoji: "📅",
        label: "Lịch thi",
        defaultQ: "Lịch thi sắp tới của tôi như thế nào?",
    },
    {
        type: "MATERIAL",
        emoji: "📖",
        label: "Tài liệu môn học",
        defaultQ: "Bài học này có những tài liệu gì?",
    },
    {
        type: "QA",
        emoji: "💬",
        label: "Hỏi đáp bài học",
        defaultQ: "",
    },
];

export default function AIChatWidget({ lessonId, courseId }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeType, setActiveType] = useState("QA");
    const [ollamaOnline, setOllamaOnline] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Kiểm tra Ollama health khi mở widget lần đầu
    useEffect(() => {
        if (open && messages.length === 0) {
            checkAIHealth().then((ok) => {
                setOllamaOnline(ok);
                if (!ok) {
                    addMessage(
                        "assistant",
                        "⚠️ Trợ lý AI đang không kết nối được với Ollama. " +
                        "Hãy đảm bảo Ollama đang chạy với lệnh: `ollama serve`"
                    );
                } else {
                    addMessage(
                        "assistant",
                        "👋 Xin chào! Tôi là trợ lý học tập AI.\n" +
                        "Bạn có thể hỏi tôi về:\n" +
                        "📚 Deadline bài tập\n" +
                        "📅 Lịch thi\n" +
                        "📖 Tài liệu môn học\n" +
                        "💬 Giải đáp thắc mắc bài học\n" +
                        "\nHãy chọn chủ đề hoặc gõ câu hỏi bên dưới!"
                    );
                }
            });
        }
    }, [open]);

    // Scroll xuống cuối mỗi khi có tin mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const addMessage = useCallback((role, content) => {
        setMessages((prev) => [
            ...prev,
            { role, content, id: Date.now() + Math.random() },
        ]);
    }, []);

    const handleQuickAction = async (action) => {
        setActiveType(action.type);

        if (action.type === "QA") {
            // Chỉ đổi mode, không gửi ngay
            inputRef.current?.focus();
            return;
        }

        const question = action.defaultQ;
        addMessage("user", `${action.emoji} ${question}`);
        await sendToAI(action.type, question);
    };

    const handleSend = async () => {
        const q = input.trim();
        if (!q || loading) return;

        setInput("");
        addMessage("user", q);
        await sendToAI(activeType, q);
    };

    const sendToAI = async (type, question) => {
        setLoading(true);
        try {
            const res = await askAI(type, question, { lessonId, courseId });
            if (res.success) {
                addMessage("assistant", res.answer);
            } else {
                addMessage("error", res.errorMessage || "Có lỗi xảy ra.");
            }
        } catch (err) {
            const msg =
                err.code === "ECONNABORTED"
                    ? "⏱️ Ollama mất quá nhiều thời gian. Với câu hỏi phức tạp, hãy thử lại hoặc đặt câu hỏi ngắn hơn."
                    : "❌ Lỗi kết nối: " + (err.response?.data?.errorMessage || err.message);
            addMessage("error", msg);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const currentAction = QUICK_ACTIONS.find((a) => a.type === activeType);

    return (
        <>
            {/* Floating Action Button */}
            <button
                className="ai-fab"
                onClick={() => setOpen((v) => !v)}
                title="Trợ lý AI học tập"
                aria-label="Mở trợ lý AI"
            >
                {open ? "✕" : "🤖"}
            </button>

            {/* Panel */}
            {open && (
                <div className="ai-panel">
                    {/* Header */}
                    <div className="ai-header">
                        <span className="ai-header-icon">🤖</span>
                        <span className="ai-header-title">Trợ lý AI học tập</span>
                        <span className={`ai-header-status ${ollamaOnline ? "" : "offline"}`}>
                            {ollamaOnline ? "Online" : "Offline"}
                        </span>
                        <button className="ai-close-btn" onClick={() => setOpen(false)} aria-label="Đóng">
                            ✕
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="ai-quick-actions">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.type}
                                className={`ai-quick-btn ${activeType === action.type ? "active" : ""}`}
                                onClick={() => handleQuickAction(action)}
                                disabled={loading}
                            >
                                {action.emoji} {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div className="ai-messages">
                        {messages.length === 0 ? (
                            <div className="ai-empty">
                                <div className="ai-empty-icon">✨</div>
                                <div>Chào mừng bạn!</div>
                                <div className="ai-empty-hint">
                                    Chọn chủ đề bên trên hoặc gõ câu hỏi của bạn
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`ai-bubble ${msg.role}`}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="ai-bubble-label">🤖 AI</div>
                                    )}
                                    {msg.role === "user" && (
                                        <div className="ai-bubble-label">Bạn</div>
                                    )}
                                    {msg.content}
                                </div>
                            ))
                        )}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="ai-typing">
                                <span>AI đang suy nghĩ</span>
                                <div className="ai-typing-dots">
                                    <div className="ai-typing-dot" />
                                    <div className="ai-typing-dot" />
                                    <div className="ai-typing-dot" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="ai-input-area">
                        <textarea
                            ref={inputRef}
                            className="ai-input"
                            rows={1}
                            placeholder={
                                activeType === "QA"
                                    ? "Hỏi về bài học, khái niệm, bài tập..."
                                    : currentAction
                                        ? `Hỏi về ${currentAction.label.toLowerCase()}...`
                                        : "Nhập câu hỏi của bạn..."
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button
                            className="ai-send-btn"
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            aria-label="Gửi"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
