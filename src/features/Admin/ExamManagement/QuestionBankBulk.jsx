import React, { useState } from "react";
import "./QuestionBankCreate.css"; // Reuse the clean styling
import { useNavigate } from "react-router-dom";
import NotificationModal from "@components/NotificationModal/NotificationModal"; // Reuse notification
import { questionService } from "@utils/questionService";

export default function QuestionBankBulk() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // State for list of questions
    const [questions, setQuestions] = useState([
        {
            category: "",
            questionText: "",
            options: ["", "", "", ""],
            correctAnswer: "",
            explanation: "",
            type: "MULTIPLE_CHOICE"
        }
    ]);

    const [notification, setNotification] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    const showNotification = (title, message, type = "info") => {
        setNotification({ isOpen: true, title, message, type });
    };

    // --- Handlers ---

    const handleFieldChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        // Auto sync correct answer if logic needed (simple version: keep as text)
        setQuestions(newQuestions);
    };

    const addOption = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push("");
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setQuestions(newQuestions);
    };

    const addNewQuestionForm = () => {
        setQuestions([
            ...questions,
            {
                category: "Java", // Default suggestion
                questionText: "",
                options: ["", "", "", ""],
                correctAnswer: "",
                explanation: "",
                type: "MULTIPLE_CHOICE"
            }
        ]);
    };

    const removeQuestionForm = (index) => {
        if (questions.length === 1) {
            showNotification("Lỗi", "Cần nhập ít nhất 1 câu hỏi", "error");
            return;
        }
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const payload = [];

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText.trim()) continue; // Skip empty questions? Or validate?

            const cleanedOptions = q.options.filter(o => o && o.trim());
            if (cleanedOptions.length < 2) {
                showNotification("Lỗi", `Câu hỏi #${i + 1}: Cần ít nhất 2 đáp án`, "error");
                setLoading(false);
                return;
            }

            let finalCorrect = q.correctAnswer;
            if (!finalCorrect || !cleanedOptions.includes(finalCorrect)) {
                finalCorrect = cleanedOptions[0];
            }

            payload.push({
                category: q.category || "General",
                questionText: q.questionText,
                options: cleanedOptions,
                correctAnswer: finalCorrect,
                explanation: q.explanation || "",
                type: "MULTIPLE_CHOICE"
            });
        }

        if (payload.length === 0) {
            showNotification("Lỗi", "Vui lòng nhập nội dung cho ít nhất 1 câu hỏi", "error");
            setLoading(false);
            return;
        }

        try {
            await questionService.bulkCreate(payload);
            showNotification("Thành công", `Đã tạo ${payload.length} câu hỏi thành công!`, "success");
            setTimeout(() => navigate("/admin/question-bank"), 1500);
        } catch (error) {
            console.error(error);
            showNotification("Lỗi", "Tạo thất bại. Vui lòng kiểm tra lại.", "error");
            setLoading(false);
        }
    };

    return (
        <div className="qb-create-container" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '100px' }}>

            <h2 className="qb-title">Tạo nhiều câu hỏi</h2>
            <p className="qb-sub">Nhập danh sách câu hỏi để thêm vào ngân hàng</p>

            {questions.map((q, qIndex) => (
                <div key={qIndex} className="qb-card" style={{ marginBottom: '30px', position: 'relative', borderTop: '5px solid #f97316' }}>
                    {/* Header of Card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#f97316' }}>Câu hỏi #{qIndex + 1}</div>
                        {questions.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeQuestionForm(qIndex)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}
                            >
                                🗑️ Xóa câu này
                            </button>
                        )}
                    </div>

                    {/* Content Form - MATCHING EXACTLY THE ORIGINAL DESIGN */}

                    {/* Câu hỏi */}
                    <label className="qb-label">Câu hỏi *</label>
                    <input
                        type="text"
                        className="qb-input"
                        placeholder="Nhập nội dung câu hỏi..."
                        value={q.questionText}
                        onChange={(e) => handleFieldChange(qIndex, 'questionText', e.target.value)}
                    />

                    {/* Danh mục */}
                    <label className="qb-label">Danh mục *</label>
                    <input
                        type="text"
                        className="qb-input"
                        placeholder="VD: React Advanced"
                        value={q.category}
                        onChange={(e) => handleFieldChange(qIndex, 'category', e.target.value)}
                    />

                    {/* Loại câu hỏi - Hardcode label for visual consistency */}
                    <label className="qb-label">Loại câu hỏi *</label>
                    <select className="qb-input" disabled value="Trắc nghiệm">
                        <option value="Trắc nghiệm">Trắc nghiệm</option>
                    </select>

                    {/* Các lựa chọn */}
                    <label className="qb-label">Các lựa chọn *</label>
                    {q.options.map((op, oIndex) => (
                        <div key={oIndex} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                type="text"
                                className="qb-input"
                                placeholder={`Đáp án ${oIndex + 1}`}
                                value={op}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                style={{ marginBottom: '10px', marginTop: '0' }}
                            />
                            {q.options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    style={{ background: 'transparent', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer', marginBottom: '10px' }}
                                >
                                    −
                                </button>
                            )}
                        </div>
                    ))}

                    <div style={{ marginBottom: '20px' }}>
                        <button
                            type="button"
                            className="qb-btn submit"
                            style={{ padding: '8px 16px', fontSize: '14px' }}
                            onClick={() => addOption(qIndex)}
                        >
                            Thêm đáp án
                        </button>
                    </div>

                    {/* Đáp án đúng */}
                    <label className="qb-label">Đáp án đúng *</label>
                    <select
                        className="qb-input"
                        value={q.correctAnswer}
                        onChange={(e) => handleFieldChange(qIndex, 'correctAnswer', e.target.value)}
                    >
                        <option value="">-- Chọn đáp án đúng --</option>
                        {q.options.map((op, i) => (
                            op && op.trim() ? <option key={i} value={op}>{op}</option> : null
                        ))}
                    </select>

                    {/* Giải thích */}
                    <label className="qb-label">Giải thích</label>
                    <textarea
                        className="qb-textarea"
                        placeholder="Giải thích đáp án..."
                        value={q.explanation}
                        onChange={(e) => handleFieldChange(qIndex, 'explanation', e.target.value)}
                        style={{ height: '100px' }}
                    />

                </div>
            ))}

            {/* Footer Actions Fixed or Bottom */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                    type="button"
                    className="qb-btn"
                    style={{ background: 'white', border: '2px dashed #cbd5e1', color: '#64748b', width: '100%' }}
                    onClick={addNewQuestionForm}
                >
                    + Thêm câu hỏi nữa
                </button>
            </div>

            <div className="qb-actions" style={{ maxWidth: '1100px', margin: '30px auto 0' }}>
                <button className="qb-btn cancel" onClick={() => navigate("/admin/question-bank")}>Hủy bỏ</button>
                <button className="qb-btn submit" onClick={handleSubmit} disabled={loading} style={{ minWidth: '150px' }}>
                    {loading ? "Đang lưu..." : "Lưu tất cả"}
                </button>
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
