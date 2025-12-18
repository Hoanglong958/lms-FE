import React from "react";
import "../css/WeekSelector.css";

export default function WeekSelectionModal({ weeks, selectedWeek, onSelectWeek, onClose }) {
    const formatWeekRange = (week) => {
        if (!week.startDate || !week.endDate) return `Tuần ${week.weekNumber}`;

        const start = week.startDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        });
        const end = week.endDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        });
        return `${start} - ${end}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                width: '400px',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                overflow: 'hidden'
            }}>
                <div className="modal-header" style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Chọn tuần</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                </div>

                <div className="modal-body" style={{ padding: '20px', overflowY: 'auto' }}>
                    <div className="weeksList" style={{ display: 'grid', gap: '10px' }}>
                        {weeks.map((week) => (
                            <button
                                key={week.weekNumber}
                                type="button"
                                onClick={() => {
                                    onSelectWeek && onSelectWeek(week);
                                    onClose();
                                }}
                                className={`weekButton ${selectedWeek?.weekNumber === week.weekNumber ? "selected" : ""}`}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    padding: '12px',
                                    border: selectedWeek?.weekNumber === week.weekNumber ? '1px solid #ff6600' : '1px solid #ddd',
                                    borderRadius: '6px',
                                    backgroundColor: selectedWeek?.weekNumber === week.weekNumber ? '#fff5eb' : '#fff',
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'left'
                                }}
                            >
                                <div className="weekNumber" style={{ fontWeight: 600, color: '#333' }}>Tuần {week.weekNumber}</div>
                                <div className="weekRange" style={{ fontSize: '13px', color: '#666' }}>{formatWeekRange(week)}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
