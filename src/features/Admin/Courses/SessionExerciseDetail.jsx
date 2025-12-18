import React, { useState, useEffect } from "react";
import { sessionExerciseService } from "@utils/sessionExerciseService";
import NotificationModal from "@components/NotificationModal/NotificationModal";

export default function SessionExerciseDetail({ exercise, onUpdated }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        title: "",
        instructions: "",
        requiredFields: "",
        exampleCode: "",
        notes: "",
    });

    const [notification, setNotification] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });

    useEffect(() => {
        if (!exercise) return;
        setForm({
            title: exercise.title || "",
            instructions: exercise.instructions || "",
            requiredFields: exercise.requiredFields || "",
            exampleCode: exercise.exampleCode || "",
            notes: exercise.notes || "",
        });
        setEditing(false);
    }, [exercise]);

    const showNotification = (title, message, type = "info") => {
        setNotification({ isOpen: true, title, message, type });
    };

    const closeNotification = () => {
        setNotification((prev) => ({ ...prev, isOpen: false }));
    };

    const handleSave = async () => {
        if (!form.title) {
            showNotification("Lỗi", "Tiêu đề không được để trống", "error");
            return;
        }

        try {
            const res = await sessionExerciseService.updateSessionExercise(
                exercise.exerciseId,
                {
                    ...form,
                    sessionId: exercise.sessionId,
                }
            );
            // Assuming API returns the updated object
            onUpdated && onUpdated(res.data || { ...exercise, ...form });
            setEditing(false);
            showNotification("Thành công", "Cập nhật bài tập thành công", "success");
        } catch (err) {
            showNotification("Lỗi", "Cập nhật thất bại", "error");
        }
    };

    const containerStyle = {
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    };

    const headerStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        borderBottom: "1px solid #eee",
        paddingBottom: "10px",
    };

    const titleStyle = {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333",
        margin: 0,
    };

    const btnStyle = {
        padding: "8px 16px",
        backgroundColor: "#fff",
        color: "#ff6600",
        border: "1px solid #ff6600",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "6px",
    };

    const btnPrimaryStyle = {
        ...btnStyle,
        backgroundColor: "#ff6600",
        color: "#fff",
    };

    const sectionStyle = {
        marginBottom: "20px",
    };

    const labelStyle = {
        display: "block",
        fontWeight: "600",
        marginBottom: "8px",
        color: "#555",
    };

    const textStyle = {
        lineHeight: "1.6",
        color: "#333",
        whiteSpace: "pre-wrap",
    };

    const codeBlockStyle = {
        backgroundColor: "#f4f4f4",
        padding: "15px",
        borderRadius: "4px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        border: "1px solid #ddd",
        overflowX: "auto",
    };

    // Form styles
    const inputStyle = {
        width: "100%",
        padding: "10px",
        borderRadius: "4px",
        border: "1px solid #ddd",
        fontSize: "14px",
    };

    const textareaStyle = {
        ...inputStyle,
        minHeight: "100px",
        fontFamily: "inherit",
    };

    if (!exercise) return null;

    if (editing) {
        return (
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>{editing ? "Sửa Bài tập" : exercise.title}</h2>
                </div>

                <div style={sectionStyle}>
                    <label style={labelStyle}>Tiêu đề</label>
                    <input
                        style={inputStyle}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        autoFocus
                    />
                </div>

                <div style={sectionStyle}>
                    <label style={labelStyle}>Hướng dẫn</label>
                    <textarea
                        style={textareaStyle}
                        value={form.instructions}
                        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    />
                </div>

                <div style={sectionStyle}>
                    <label style={labelStyle}>Code mẫu</label>
                    <textarea
                        style={{ ...textareaStyle, fontFamily: "monospace" }}
                        value={form.exampleCode}
                        onChange={(e) => setForm({ ...form, exampleCode: e.target.value })}
                    />
                </div>

                <div style={sectionStyle}>
                    <label style={labelStyle}>Yêu cầu (Required Fields)</label>
                    <input
                        style={inputStyle}
                        value={form.requiredFields}
                        onChange={(e) =>
                            setForm({ ...form, requiredFields: e.target.value })
                        }
                        placeholder="Ví dụ: title,description"
                    />
                </div>

                <div style={sectionStyle}>
                    <label style={labelStyle}>Ghi chú</label>
                    <textarea
                        style={textareaStyle}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button style={btnStyle} onClick={() => setEditing(false)}>
                        Hủy
                    </button>
                    <button style={btnPrimaryStyle} onClick={handleSave}>
                        Lưu
                    </button>
                </div>

                <NotificationModal
                    isOpen={notification.isOpen}
                    onClose={closeNotification}
                    title={notification.title}
                    message={notification.message}
                    type={notification.type}
                />
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h2 style={titleStyle}>{exercise.title}</h2>
                <button style={btnStyle} onClick={() => setEditing(true)}>
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Sửa exercise
                </button>
            </div>

            <div style={sectionStyle}>
                <label style={labelStyle}>Hướng dẫn:</label>
                <div style={textStyle}>{exercise.instructions || <i>Chưa có hướng dẫn</i>}</div>
            </div>

            {exercise.requiredFields && (
                <div style={sectionStyle}>
                    <label style={labelStyle}>Yêu cầu:</label>
                    <div style={textStyle}>{exercise.requiredFields}</div>
                </div>
            )}

            {exercise.exampleCode && (
                <div style={sectionStyle}>
                    <label style={labelStyle}>Code mẫu:</label>
                    <pre style={codeBlockStyle}>{exercise.exampleCode}</pre>
                </div>
            )}

            {exercise.notes && (
                <div style={sectionStyle}>
                    <label style={labelStyle}>Ghi chú:</label>
                    <div style={textStyle}>{exercise.notes}</div>
                </div>
            )}

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={closeNotification}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </div>
    );
}
