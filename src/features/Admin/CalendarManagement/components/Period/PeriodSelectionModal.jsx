import React, { useState, useEffect } from "react";
import "./PeriodSelectionModal.css";

export default function PeriodSelectionModal({
    periods = [],
    selectedPeriodIds = [],
    onApply,
    onClose,
}) {
    // Local state for checkboxes
    const [localSelected, setLocalSelected] = useState([]);

    useEffect(() => {
        // Initialize with currently selected ids
        setLocalSelected(selectedPeriodIds);
    }, [selectedPeriodIds]);

    const handleToggle = (id) => {
        setLocalSelected((prev) => {
            if (prev.includes(id)) {
                return prev.filter((pid) => pid !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = () => {
        if (localSelected.length === periods.length) {
            setLocalSelected([]);
        } else {
            setLocalSelected(periods.map((p) => p.id));
        }
    };

    const handleSubmit = () => {
        onApply(localSelected);
        onClose();
    };

    return (
        <div className="period-select-backdrop" onClick={onClose}>
            <div className="period-select-modal" onClick={(e) => e.stopPropagation()}>
                <div className="period-select-header">
                    <h3>Chọn ca học hiển thị</h3>
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="period-select-body">
                    <div className="select-actions">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={
                                    periods.length > 0 && localSelected.length === periods.length
                                }
                                onChange={handleSelectAll}
                            />
                            Chọn tất cả
                        </label>
                    </div>

                    <ul className="period-check-list">
                        {periods.length === 0 && (
                            <p className="empty-text">Chưa có ca học nào được tạo.</p>
                        )}
                        {periods.map((p) => (
                            <li key={p.id} className="period-check-item">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={localSelected.includes(p.id)}
                                        onChange={() => handleToggle(p.id)}
                                    />
                                    <div className="period-info">
                                        <span className="period-name">{p.name}</span>
                                        <span className="period-time">
                                            {typeof p.startTime === "string" ? p.startTime : "..."} -{" "}
                                            {typeof p.endTime === "string" ? p.endTime : "..."}
                                        </span>
                                    </div>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="period-select-footer">
                    <button className="btn ghost" onClick={onClose}>
                        Hủy
                    </button>
                    <button className="btn primary" onClick={handleSubmit}>
                        Áp dụng
                    </button>
                </div>
            </div>
        </div>
    );
}
