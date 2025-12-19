import React, { useState } from "react";
import SubjectCard from "./SubjectCard";
import "../css/SubjectList.css";

export default function SubjectListSidebar({ subjects, onDragStart, onDragEnd, draggingSubject, isOpen, onClose }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSubjects = subjects.filter(subject =>
        subject.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            {isOpen && (
                <div className="sidebar-overlay" onClick={onClose} style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 3000, // Covers Header (1000) but below Calendar (3001)
                }} />
            )}
            <div className={`subject-sidebar ${isOpen ? 'open' : ''}`} style={{
                position: 'fixed',
                top: 0,
                left: 0, // Left side
                bottom: 0,
                width: '280px',
                backgroundColor: '#fff',
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                zIndex: 3002, // Topmost
                transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease-in-out',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="sidebar-header" style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Môn học</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>×</button>
                </div>

                <div className="sidebar-search" style={{ padding: '16px 20px', borderBottom: '1px solid #eee' }}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm môn học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div className="subjectList" style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div className="subjectListSubtitle" style={{ marginBottom: '10px', fontSize: '13px', color: '#666' }}>
                        Kéo thả vào lịch học
                    </div>
                    {filteredSubjects.map((subject, index) => (
                        <SubjectCard
                            key={index}
                            subject={subject}
                            isDragging={draggingSubject?.courseId === subject.courseId}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))}
                    {filteredSubjects.length === 0 && (
                        <div className="subjectListEmpty" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                            {subjects.length === 0 ? "Chưa có môn học nào" : "Không tìm thấy kết quả"}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
