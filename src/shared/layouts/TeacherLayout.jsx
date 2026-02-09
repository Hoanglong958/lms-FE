import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "@components/Teacher/TeacherSidebar";
import "@pages/admin.css"; // Reuse existing admin layout styles for consistency

export default function TeacherLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 640) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="admin-layout"> {/* Use admin-layout class for structure */}
            {sidebarOpen && (
                <div className="admin-sidebar-overlay" onClick={closeSidebar}></div>
            )}
            <TeacherSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
            <div className="admin-main">
                <Outlet context={{ toggleSidebar }} />
            </div>
        </div>
    );
}
