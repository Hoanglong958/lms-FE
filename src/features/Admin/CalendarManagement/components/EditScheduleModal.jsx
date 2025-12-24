import React, { useState, useEffect } from "react";
import "../css/EditScheduleModal.css";

export default function EditScheduleModal({ onClose, onSave, scheduleItem, periods }) {
    const [date, setDate] = useState("");
    const [periodId, setPeriodId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (scheduleItem && scheduleItem.date) {
            // Format date YYYY-MM-DD
            try {
                const d = new Date(scheduleItem.date);
                if (!isNaN(d.getTime())) {
                    const dateStr = d.toISOString().split('T')[0];
                    setDate(dateStr);
                }
            } catch (e) {
                console.error("Invalid date", scheduleItem.date);
            }
            setPeriodId(scheduleItem.periodId);
        }
    }, [scheduleItem]);

    const handleSave = () => {
        if (!date) {
            setError("Vui lòng chọn ngày");
            return;
        }
        if (!periodId) {
            setError("Vui lòng chọn ca học");
            return;
        }

        onSave({
            ...scheduleItem,
            date,
            periodId: Number(periodId)
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '400px' }}>
                <div className="modal-header">
                    <h3>Cập nhật buổi học</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                    <div style={{ marginBottom: '15px' }}>
                        <strong>Môn học:</strong> {scheduleItem?.subjectName}
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Ngày học:</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Ca học:</label>
                        <select
                            value={periodId}
                            onChange={(e) => setPeriodId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                            }}
                        >
                            {periods.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.startTime} - {p.endTime})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="cancel-button" onClick={onClose}>Hủy</button>
                    <button
                        className="save-button"
                        onClick={handleSave}
                        style={{ backgroundColor: '#007bff', color: 'white' }}
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
}
