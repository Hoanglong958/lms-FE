import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminHeader from '@components/Admin/AdminHeader';
import { useOutletContext } from "react-router-dom";
import './Roadmap.css';

export default function Roadmap() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const classId = searchParams.get('classId');
    const [roadmapData, setRoadmapData] = useState([]); // Will be populated by API later

    // Get toggleSidebar from context (similar to other admin pages)
    let toggleSidebar = () => { };
    try {
        toggleSidebar = useOutletContext()?.toggleSidebar || (() => { });
    } catch { }

    return (
        <div className="roadmap-page">
            <AdminHeader
                title="Lộ trình học tập"
                breadcrumb={[
                    { label: "Dashboard", to: "/admin/dashboard" },
                    { label: "Lớp học", to: "/admin/classes" },
                    { label: classId ? `Chi tiết lớp` : "Lộ trình", to: classId ? `/admin/classes/${classId}` : "#" },
                    { label: "Lộ trình", to: "#" },
                ]}
                onMenuToggle={toggleSidebar}
                onBack={() => navigate(-1)}
            />

            <div className="roadmap-content">
                <div className="roadmap-container">
                    <div className="roadmap-placeholder">
                        <div className="roadmap-empty-state">
                            <div className="roadmap-icon-circle">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </div>
                            <h3>Lộ trình học tập</h3>
                            <p>Chức năng đang được phát triển. Dữ liệu lộ trình sẽ được hiển thị tại đây.</p>
                            <button className="roadmap-btn-primary" onClick={() => navigate(-1)}>
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
