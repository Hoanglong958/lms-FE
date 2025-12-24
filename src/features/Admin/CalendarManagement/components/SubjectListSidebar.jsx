import React, { useState } from "react";
import SubjectCard from "./SubjectCard";
import "../css/SubjectList.css";

export default function SubjectListSidebar({
    subjects,
    onDragStart,
    onDragEnd,
    draggingSubject,
    isOpen,
    onClose,
    onSave, // New Prop
    onExit, // New Prop
    isSaving // New Prop
}) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredSubjects = subjects.filter(subject =>
        subject.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const titleRef = React.useRef(null);

    React.useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.setProperty('color', 'black', 'important');
        }
    }, [isOpen]);

    return (
        <>
            {isOpen && (
                <div className="sidebar-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 3000,
                }} />
            )}
            <div className={`subject-sidebar ${isOpen ? 'open' : ''}`} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '320px', // Slightly wider for buttons
                backgroundColor: '#fff',
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                zIndex: 3002,
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
                    backgroundColor: '#fff'
                }}>
                    <h3 ref={titleRef} className="sidebarHeaderTitle" style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Môn học</h3>
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
                    {/* ... List content ... */}
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

                {/* Footer with Actions */}
                <div className="sidebar-footer" style={{
                    padding: '20px',
                    borderTop: '1px solid #eee',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        style={{
                            flex: 1,
                            backgroundColor: '#198754',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>💾</span>
                        {isSaving ? "Đang lưu..." : "Lưu lịch học"}
                    </button>
                    <button
                        onClick={onExit}
                        style={{
                            flex: 0.5,
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '30px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        Thoát
                    </button>
                </div>
            </div>
        </>
    );
}
