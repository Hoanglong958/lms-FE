// Example: Phần đầu của user.jsx SAU KHI refactor
// So sánh với file gốc để thấy sự khác biệt

import React, { useMemo, useState, useEffect, useRef } from "react";
import { userService } from "@utils/userService";
import "./user.css"; // ← THÊM DÒNG NÀY

export default function UserManagement({ currentUserRole = "admin" }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [users, setUsers] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [confirmLock, setConfirmLock] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const res = await userService.getAllUsers({
                page: 0,
                size: 1000,
                keyword: searchQuery,
                role: roleFilter === "all" ? null : roleFilter
            });

            let apiData = [];
            if (res.data.data && res.data.data.content) {
                apiData = res.data.data.content;
            } else if (res.data.content) {
                apiData = res.data.content;
            } else if (res.data.data && Array.isArray(res.data.data)) {
                apiData = res.data.data;
            } else if (Array.isArray(res.data)) {
                apiData = res.data;
            }

            setUsers(Array.isArray(apiData) ? apiData : []);
        } catch (error) {
            // Handle error
        }
    }

    // ... các handlers khác giữ nguyên ...

    const filteredUsers = useMemo(() => {
        const usersToFilter = Array.isArray(users) ? users : [];
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return usersToFilter.filter((u) => {
            const matchQuery =
                normalizedQuery.length === 0 ||
                (u.fullName && u.fullName.toLowerCase().includes(normalizedQuery)) ||
                (u.gmail && u.gmail.toLowerCase().includes(normalizedQuery));

            const matchRole = roleFilter === "all" ? true : u.role === roleFilter;

            return matchQuery && matchRole;
        });
    }, [users, searchQuery, roleFilter]);

    return (
        {/* ✨ BẮT ĐẦU PHẦN THAY ĐỔI - Từ style={} sang className */ }
        < div className = "um-page" > {/* ← ĐÃ THAY ĐỔI TỪ: style={styles.page} */ }

    {/* Header */ }
    <header className="um-header"> {/* ← ĐÃ THAY ĐỔI */}
        <div>
            <h1 className="um-title">Quản lý người dùng</h1> {/* ← ĐÃ THAY ĐỔI */}
            <p className="um-subtitle">Danh sách người dùng và quản lý quyền truy cập</p> {/* ← ĐÃ THAY ĐỔI */}
        </div>
        <button
            type="button"
            className="um-primary-button" {/* ← ĐÃ THAY ĐỔI */}
            onClick={() => setIsAddOpen(true)}
        >
            <span className="um-plus-icon">+</span> {/* ← ĐÃ THAY ĐỔI */}
            Thêm người dùng
        </button>
    </header>

    {/* Toolbar */ }
    <section className="um-toolbar _um-toolbar"> {/* ← ĐÃ THAY ĐỔI */}
        <div className="um-search-wrap _um-search"> {/* ← ĐÃ THAY ĐỔI */}
            <span aria-hidden="true" className="um-search-icon"> {/* ← ĐÃ THAY ĐỔI */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
            </span>
            <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="um-search-input" {/* ← ĐÃ THAY ĐỔI */}
            />
        </div>

        <label className="um-filter-wrap"> {/* ← ĐÃ THAY ĐỔI */}
            <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="um-select" {/* ← ĐÃ THAY ĐỔI */}
            >
                <option value="all">Tất cả vai trò</option>
                <option value="ROLE_ADMIN">Quản trị viên</option>
                <option value="ROLE_USER">Người dùng</option>
            </select>
            <span className="um-select-chevron" aria-hidden="true">▾</span> {/* ← ĐÃ THAY ĐỔI */}
        </label>
    </section>

    {/* Table */ }
    <div className="um-card"> {/* ← ĐÃ THAY ĐỔI */}
        <div style={{ overflowX: "auto" }}> {/* ← GIỮ NGUYÊN inline style */}
            <table className="um-table"> {/* ← ĐÃ THAY ĐỔI */}
                <thead>
                    <tr>
                        <th className="um-th">Họ và tên</th> {/* ← ĐÃ THAY ĐỔI */}
                        <th className="um-th">Email</th>
                        <th className="um-th">Vai trò</th>
                        <th className="um-th">Trạng thái</th>
                        <th className="um-th">Khóa học</th>
                        <th className="um-th">Ngày tham gia</th>
                        <th className="um-th">Lần đăng nhập cuối</th>
                        <th className="um-th" />
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((u) => (
                        <tr key={u.id} className="um-tr"> {/* ← ĐÃ THAY ĐỔI */}
                            <td className="um-td"> {/* ← ĐÃ THAY ĐỔI */}
                                <div className="um-name-text">{u.fullName}</div> {/* ← ĐÃ THAY ĐỔI */}
                            </td>
                            <td className="um-td">
                                <div className="um-email-text">{u.gmail}</div> {/* ← ĐÃ THAY ĐỔI */}
                            </td>
                            <td className="um-td">
                                <RoleBadge role={u.role} />
                            </td>
                            <td className="um-td">
                                <StatusBadge status={u.isActive ? 'active' : 'paused'} />
                            </td>
                            <td className="um-td">{u.courseCount || 0}</td>
                            <td className="um-td">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : "---"}</td>
                            <td className="um-td">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('vi-VN') : "---"}</td>
                            <td className="um-td-action"> {/* ← ĐÃ THAY ĐỔI */}
                                <RowActions
                                    onView={() => handleViewUser(u)}
                                    onLock={() => handleRequestLock(u)}
                                    onEdit={() => setEditingUser(u)}
                                    onDelete={() => handleRequestDelete(u)}
                                />
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td className="um-empty-cell" colSpan={8}> {/* ← ĐÃ THAY ĐỔI */}
                                Không tìm thấy người dùng phù hợp
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>

    {/* Modals - tương tự thay đổi */ }
    {
        isAddOpen && (
            <AddUserModal
                onClose={() => setIsAddOpen(false)}
                onSubmit={handleAddUser}
                allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}
            />
        )
    }

    {/* ... các modals khác ... */ }
		</div >
	);
}

// ===== CÁC COMPONENT CON =====

function RoleBadge({ role }) {
    const label = role === "ROLE_ADMIN" ? "Quản trị viên" : "Người dùng";
    const badgeClass = role === "ROLE_ADMIN"
        ? "um-badge-base um-badge-role-admin"  // ← ĐÃ THAY ĐỔI
        : "um-badge-base um-badge-role-user";   // ← ĐÃ THAY ĐỔI

    return <span className={badgeClass}>{label}</span>; {/* ← ĐÃ THAY ĐỔI */ }
}

function StatusBadge({ status }) {
    const mapping = {
        active: {
            label: "Hoạt động",
            className: "um-badge-base um-badge-status-active" // ← ĐÃ THAY ĐỔI
        },
        paused: {
            label: "Ngừng hoạt động",
            className: "um-badge-base um-badge-status-paused" // ← ĐÃ THAY ĐỔI
        }
    };
    const { label, className } = mapping[status] ?? mapping.active;
    return <span className={className}>{label}</span>; {/* ← ĐÃ THAY ĐỔI */ }
}

function RowActions({ onView, onLock, onEdit, onDelete }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        function handleGlobalPointerDown(e) {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleGlobalPointerDown);
        document.addEventListener("touchstart", handleGlobalPointerDown, { passive: true });
        return () => {
            document.removeEventListener("mousedown", handleGlobalPointerDown);
            document.removeEventListener("touchstart", handleGlobalPointerDown);
        };
    }, [open]);

    return (
        <div ref={containerRef} className="um-action-wrap"> {/* ← ĐÃ THAY ĐỔI */}
            <button
                type="button"
                aria-label="Xem tài khoản"
                title="Xem tài khoản"
                onClick={() => onView && onView()}
                className="um-icon-button" {/* ← ĐÃ THAY ĐỔI */}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                </svg>
            </button>
            <button
                type="button"
                aria-label="Khóa/Mở khóa"
                title="Khóa/Mở khóa"
                onClick={() => onLock && onLock()}
                className="um-icon-button" {/* ← ĐÃ THAY ĐỔI */}
                style={{ marginLeft: 6 }} {/* ← GIỮ NGUYÊN vì nhỏ */}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M7 10V7a5 5 0 0 1 9.584-2.058" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                </svg>
            </button>
            <button
                type="button"
                aria-label="Thao tác"
                onClick={() => setOpen((v) => !v)}
                className="um-icon-button" {/* ← ĐÃ THAY ĐỔI */}
                style={{ marginLeft: 6 }} {/* ← GIỮ NGUYÊN */}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                </svg>
            </button>
            {open && (
                <ul className="um-menu"> {/* ← ĐÃ THAY ĐỔI */}
                    <li className="um-menu-item"> {/* ← ĐÃ THAY ĐỔI */}
                        <button
                            type="button"
                            className="um-menu-btn" {/* ← ĐÃ THAY ĐỔI */}
                            onClick={() => { setOpen(false); onEdit && onEdit(); }}
                        >
                            Chỉnh sửa
                        </button>
                    </li>
                    <li className="um-menu-item"> {/* ← ĐÃ THAY ĐỔI */}
                        <button
                            type="button"
                            className="um-menu-btn-danger" {/* ← ĐÃ THAY ĐỔI */}
                            onClick={() => { setOpen(false); onDelete && onDelete(); }}
                        >
                            Xóa
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
}

// ===== XÓA HOẶC COMMENT OUT CÁC STYLE OBJECTS =====
/*
const styles = { ... }; // ← XÓA HOẶC COMMENT
const badgeStyles = { ... }; // ← XÓA HOẶC COMMENT
const modalStyles = { ... }; // ← XÓA HOẶC COMMENT
function PageStyles() { ... } // ← XÓA HOẶC COMMENT
*/

// ... phần còn lại của file ...
