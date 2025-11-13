import React, { useMemo, useState, useEffect, useRef } from "react";

/**
 * User Management Page (Vietnamese UI)
 * - Pure JSX/CSS, no external UI deps
 * - Search by name/email
 * - Filter by role
 * - Polished badges and table layout
 */
export default function UserManagement({ currentUserRole = "admin" }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const initialUsers = useMemo(
		() => [
			{
				id: 1,
				name: "Nguyễn Văn A",
				email: "user@mankai.edu.vn",
				role: "user",
				status: "active",
				courses: 5,
				joinedAt: "15/1/2024",
				lastLoginAt: "3/11/2024"
			},
			{
				id: 2,
				name: "Hoàng Văn Admin",
				email: "admin@mankai.edu.vn",
				role: "admin",
				status: "active",
				courses: 0,
				joinedAt: "1/12/2023",
				lastLoginAt: "3/11/2024"
			},
			{
				id: 3,
				name: "Lê Văn C",
				email: "levanc@email.com",
				role: "user",
				status: "active",
				courses: 3,
				joinedAt: "10/3/2024",
				lastLoginAt: "2/11/2024"
			},
			{
				id: 4,
				name: "Phạm Thị D",
				email: "phamthid@email.com",
				role: "user",
				status: "paused",
				courses: 2,
				joinedAt: "25/1/2024",
				lastLoginAt: "28/10/2024"
			},
			{
				id: 5,
				name: "Trần Văn E",
				email: "tranvane@email.com",
				role: "user",
				status: "active",
				courses: 4,
				joinedAt: "10/2/2024",
				lastLoginAt: "1/11/2024"
			},
			{
				id: 6,
				name: "Đinh Thị F",
				email: "dinhthif@email.com",
				role: "user",
				status: "active",
				courses: 6,
				joinedAt: "20/1/2024",
				lastLoginAt: "3/11/2024"
			}
		],
		[]
	);
	const [users, setUsers] = useState(initialUsers);
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(null);
	const [confirmLock, setConfirmLock] = useState(null);

	function handleAddUser(payload) {
		// Role guard: user can only create user
		if (currentUserRole !== "admin" && payload.role === "admin") {
			alert("Bạn không có quyền tạo tài khoản Quản trị viên.");
			return;
		}
		const nextId = Math.max(0, ...users.map((u) => u.id)) + 1;
		const today = new Date();
		const formatDate = (d) =>
			`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
		const newUser = {
			id: nextId,
			name: payload.name.trim(),
			email: payload.email.trim(),
			role: payload.role,
			status: "active",
			courses: 0,
			joinedAt: formatDate(today),
			lastLoginAt: formatDate(today)
		};
		setUsers((prev) => [newUser, ...prev]);
		setIsAddOpen(false);
	}

	function handleEditUser(id, payload) {
		// Guard: non-admin cannot set admin role
		if (currentUserRole !== "admin" && payload.role === "admin") {
			alert("Bạn không có quyền gán vai trò Quản trị viên.");
			return;
		}
		setUsers((prev) =>
			prev.map((u) => (u.id === id ? { ...u, ...payload } : u))
		);
		setEditingUser(null);
	}

	function handleRequestDelete(user) {
		if (currentUserRole !== "admin" && user.role === "admin") {
			alert("Bạn không có quyền xóa tài khoản Quản trị viên.");
			return;
		}
		setConfirmDelete(user);
	}

	function handleConfirmDelete() {
		if (!confirmDelete) return;
		setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
		setConfirmDelete(null);
	}

	function handleToggleStatus(user) {
		// Only admin can change status of admin accounts
		if (currentUserRole !== "admin" && user.role === "admin") {
			alert("Bạn không có quyền đổi trạng thái tài khoản Quản trị viên.");
			return;
		}
		setUsers((prev) =>
			prev.map((u) =>
				u.id === user.id
					? { ...u, status: u.status === "active" ? "paused" : "active" }
					: u
			)
		);
	}

	function handleViewUser(user) {
		// Placeholder: replace with navigation if available
		alert(`Xem tài khoản:\n${user.name} (${user.email})`);
	}

	function handleLockUser(user) {
		// Only admin can lock/unlock admin accounts
		if (currentUserRole !== "admin" && user.role === "admin") {
			alert("Bạn không có quyền khóa tài khoản Quản trị viên.");
			return;
		}
		// If active -> ask for confirmation to lock
		if (user.status === "active") {
			setConfirmLock(user);
			return;
		}
		// If paused -> unlock immediately
		if (user.status === "paused") {
			setUsers((prev) =>
				prev.map((u) => (u.id === user.id ? { ...u, status: "active" } : u))
			);
		}
	}

	function handleConfirmLock() {
		if (!confirmLock) return;
		setUsers((prev) =>
			prev.map((u) => (u.id === confirmLock.id ? { ...u, status: "paused" } : u))
		);
		setConfirmLock(null);
	}

	const filteredUsers = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		return users.filter((u) => {
			const matchQuery =
				normalizedQuery.length === 0 ||
				u.name.toLowerCase().includes(normalizedQuery) ||
				u.email.toLowerCase().includes(normalizedQuery);
			const matchRole = roleFilter === "all" ? true : u.role === roleFilter;
			return matchQuery && matchRole;
		});
	}, [users, searchQuery, roleFilter]);

	return (
		<div style={styles.page}>
			<PageStyles />
			<header style={styles.header}>
				<div>
					<h1 style={styles.title}>Quản lý người dùng</h1>
					<p style={styles.subtitle}>
						Danh sách và phân quyền người dùng
					</p>
				</div>
				<button type="button" style={styles.primaryButton} onClick={() => setIsAddOpen(true)}>
					<span style={styles.plusIcon}>+</span> Thêm người dùng
				</button>
			</header>

			<section style={styles.toolbar}>
				<div style={styles.searchWrap}>
					<span aria-hidden="true" style={styles.searchIcon}>
						{/* magnifier */}
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
							<path
								d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
								stroke="currentColor"
								strokeWidth="1.6"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</span>
					<input
						type="text"
						placeholder="Tìm kiếm theo tên hoặc email..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						style={styles.searchInput}
					/>
				</div>

				<label style={styles.filterWrap}>
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
						style={styles.select}
					>
						<option value="all">Tất cả vai trò</option>
						<option value="admin">Quản trị viên</option>
						<option value="user">Người dùng</option>
					</select>
					<span style={styles.selectChevron} aria-hidden="true">▾</span>
				</label>
			</section>

			<div style={styles.card}>
				<div style={{ overflowX: "auto" }}>
					<table style={styles.table}>
						<thead>
							<tr>
								<th style={{ ...styles.th, width: 320 }}>Họ và tên</th>
								<th style={styles.th}>Email</th>
								<th style={{ ...styles.th, width: 140 }}>Vai trò</th>
								<th style={{ ...styles.th, width: 140 }}>Trạng thái</th>
								<th style={{ ...styles.th, width: 90 }}>Khóa học</th>
								<th style={{ ...styles.th, width: 80, textAlign: "right" }}>
									Thao tác
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredUsers.map((u) => (
								<tr key={u.id} style={styles.tr}>
									<td style={styles.td}>
										<div style={styles.nameCell}>
											<div style={styles.avatar} aria-hidden="true">
												{getInitials(u.name)}
											</div>
											<div>
												<div style={styles.nameText}>{u.name}</div>
											</div>
										</div>
									</td>
									<td style={styles.td}>
										<span style={styles.emailText}>{u.email}</span>
									</td>
									<td style={styles.td}>
										<RoleBadge role={u.role} />
									</td>
									<td style={styles.td}>
										<StatusBadge status={u.status} />
									</td>
									<td style={styles.tdCenter}>{u.courses}</td>
									<td style={styles.tdAction}>
										<RowActions
											onView={() => handleViewUser(u)}
											onLock={() => handleLockUser(u)}
											onEdit={() => setEditingUser(u)}
											onDelete={() => handleRequestDelete(u)}
										/>
									</td>
								</tr>
							))}
							{filteredUsers.length === 0 && (
								<tr>
									<td style={styles.emptyCell} colSpan={6}>
										Không tìm thấy người dùng phù hợp
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
			{isAddOpen && (
				<AddUserModal
					onClose={() => setIsAddOpen(false)}
					onSubmit={handleAddUser}
					allowedRoles={currentUserRole === "admin" ? ["user", "admin"] : ["user"]}
				/>
			)}
			{editingUser && (
				<EditUserModal
					user={editingUser}
					onClose={() => setEditingUser(null)}
					onSubmit={(payload) => handleEditUser(editingUser.id, payload)}
					allowedRoles={currentUserRole === "admin" ? ["user", "admin"] : ["user"]}
				/>
			)}
			{confirmDelete && (
				<ConfirmModal
					title="Xóa người dùng"
					message={`Bạn có chắc muốn xóa '${confirmDelete.name}'?`}
					onCancel={() => setConfirmDelete(null)}
					onConfirm={handleConfirmDelete}
				/>
			)}
			{confirmLock && (
				<ConfirmModal
					title="Khóa tài khoản"
					message={`Bạn có chắc chắn muốn khóa tài khoản '${confirmLock.name}'? Bạn có thể mở khóa lại bất cứ lúc nào.`}
					onCancel={() => setConfirmLock(null)}
					onConfirm={handleConfirmLock}
					confirmLabel="Khóa"
				/>
			)}
		</div>
	);
}

function AddUserModal({ onClose, onSubmit, allowedRoles }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState(allowedRoles[0] || "user");
	const [errors, setErrors] = useState({});

	function validate() {
		const nextErrors = {};
		if (!name.trim()) nextErrors.name = "Vui lòng nhập họ và tên";
		if (!email.trim()) nextErrors.email = "Vui lòng nhập email";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
			nextErrors.email = "Email không hợp lệ";
		if (!allowedRoles.includes(role)) nextErrors.role = "Vai trò không hợp lệ";
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (!validate()) return;
		onSubmit({ name, email, role });
	}

	return (
		<div style={modalStyles.backdrop} role="dialog" aria-modal="true">
			<div style={modalStyles.container} className="_add-user-modal">
				<div style={modalStyles.header}>
					<h3 style={modalStyles.title}>Thêm người dùng</h3>
					<button type="button" onClick={onClose} style={styles.iconButton} aria-label="Đóng">
						×
					</button>
				</div>
				<form onSubmit={handleSubmit}>
					<div style={modalStyles.body}>
						<label style={modalStyles.label}>
							Họ và tên
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								style={modalStyles.input}
								placeholder="Ví dụ: Nguyễn Văn A"
							/>
							{errors.name && <div style={modalStyles.error}>{errors.name}</div>}
						</label>
						<label style={modalStyles.label}>
							Email
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								style={modalStyles.input}
								placeholder="email@domain.com"
							/>
							{errors.email && <div style={modalStyles.error}>{errors.email}</div>}
						</label>
						<label style={modalStyles.label}>
							Vai trò
							<select
								value={role}
								onChange={(e) => setRole(e.target.value)}
								style={{ ...styles.select, width: "100%" }}
							>
								{allowedRoles.map((r) => (
									<option key={r} value={r}>
										{r === "admin" ? "Quản trị viên" : "Người dùng"}
									</option>
								))}
							</select>
							{errors.role && <div style={modalStyles.error}>{errors.role}</div>}
						</label>
					</div>
					<div style={modalStyles.footer}>
						<button type="button" onClick={onClose} style={modalStyles.ghostBtn}>
							Hủy
						</button>
						<button type="submit" style={styles.primaryButton}>
							Lưu
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

function EditUserModal({ user, onClose, onSubmit, allowedRoles }) {
	const [name, setName] = useState(user.name || "");
	const [email, setEmail] = useState(user.email || "");
	const [role, setRole] = useState(
		allowedRoles.includes(user.role) ? user.role : allowedRoles[0] || "user"
	);
	const [errors, setErrors] = useState({});

	function validate() {
		const nextErrors = {};
		if (!name.trim()) nextErrors.name = "Vui lòng nhập họ và tên";
		if (!email.trim()) nextErrors.email = "Vui lòng nhập email";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
			nextErrors.email = "Email không hợp lệ";
		if (!allowedRoles.includes(role)) nextErrors.role = "Vai trò không hợp lệ";
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (!validate()) return;
		onSubmit({ name: name.trim(), email: email.trim(), role });
	}

	return (
		<div style={modalStyles.backdrop} role="dialog" aria-modal="true">
			<div style={modalStyles.container}>
				<div style={modalStyles.header}>
					<h3 style={modalStyles.title}>Chỉnh sửa người dùng</h3>
					<button type="button" onClick={onClose} style={styles.iconButton} aria-label="Đóng">
						×
					</button>
				</div>
				<form onSubmit={handleSubmit}>
					<div style={modalStyles.body}>
						<label style={modalStyles.label}>
							Họ và tên
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								style={modalStyles.input}
							/>
							{errors.name && <div style={modalStyles.error}>{errors.name}</div>}
						</label>
						<label style={modalStyles.label}>
							Email
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								style={modalStyles.input}
							/>
							{errors.email && <div style={modalStyles.error}>{errors.email}</div>}
						</label>
						<label style={modalStyles.label}>
							Vai trò
							<select
								value={role}
								onChange={(e) => setRole(e.target.value)}
								style={{ ...styles.select, width: "100%" }}
							>
								{allowedRoles.map((r) => (
									<option key={r} value={r}>
										{r === "admin" ? "Quản trị viên" : "Người dùng"}
									</option>
								))}
							</select>
							{errors.role && <div style={modalStyles.error}>{errors.role}</div>}
						</label>
					</div>
					<div style={modalStyles.footer}>
						<button type="button" onClick={onClose} style={modalStyles.ghostBtn}>
							Hủy
						</button>
						<button type="submit" style={styles.primaryButton}>
							Lưu thay đổi
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

function ConfirmModal({ title, message, onCancel, onConfirm, confirmLabel = "Xóa" }) {
	return (
		<div style={modalStyles.backdrop} role="dialog" aria-modal="true">
			<div style={modalStyles.container}>
				<div style={modalStyles.header}>
					<h3 style={modalStyles.title}>{title}</h3>
				</div>
				<div style={modalStyles.body}>
					<div style={{ color: "#374151", fontSize: 14 }}>{message}</div>
				</div>
				<div style={modalStyles.footer}>
					<button type="button" onClick={onCancel} style={modalStyles.ghostBtn}>
						Hủy
					</button>
					<button
						type="button"
						onClick={onConfirm}
						style={{ ...styles.primaryButton, background: "#b91c1c" }}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}

function RoleBadge({ role }) {
	const label = role === "admin" ? "Quản trị viên" : "Người dùng";
	const style =
		role === "admin" ? badgeStyles.roleAdmin : badgeStyles.roleUser;
	return <span style={{ ...badgeStyles.base, ...style }}>{label}</span>;
}

function StatusBadge({ status }) {
	const mapping = {
		active: { label: "Hoạt động", style: badgeStyles.statusActive },
		paused: { label: "Ngừng hoạt động", style: badgeStyles.statusPaused }
	};
	const { label, style } = mapping[status] ?? mapping.active;
	return <span style={{ ...badgeStyles.base, ...style }}>{label}</span>;
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
		<div ref={containerRef} style={styles.actionWrap}>
			<button
				type="button"
				aria-label="Xem tài khoản"
				title="Xem tài khoản"
				onClick={() => onView && onView()}
				style={styles.iconButton}
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
				style={{ ...styles.iconButton, marginLeft: 6 }}
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
				style={{ ...styles.iconButton, marginLeft: 6 }}
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
					<circle cx="5" cy="12" r="2" />
					<circle cx="12" cy="12" r="2" />
					<circle cx="19" cy="12" r="2" />
				</svg>
			</button>
			{open && (
				<ul style={styles.menu}>
					<li style={styles.menuItem}>
						<button type="button" style={styles.menuBtn} onClick={() => { setOpen(false); onEdit && onEdit(); }}>Chỉnh sửa</button>
					</li>
					<li style={styles.menuItem}>
						<button type="button" style={styles.menuBtnDanger} onClick={() => { setOpen(false); onDelete && onDelete(); }}>Xóa</button>
					</li>
				</ul>
			)}
		</div>
	);
}

function PageStyles() {
	return (
		<style>{`
			@media (max-width: 760px) {
				._um-toolbar {
					flex-direction: column;
					gap: 12px;
					align-items: stretch;
				}
				._um-search {
					width: 100%;
				}
			}

			/* AddUserModal placeholder styling (lighter and thinner) */
			._add-user-modal input::placeholder {
				color: #9ca3af; /* gray-400 */
				opacity: 0.6;
				font-weight: 400;
			}
		`}</style>
	);
}

// Styles
const styles = {
	page: {
		padding: "28px 24px",
		background: "#f7f8fa",
		minHeight: "100%"
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 16
	},
	title: {
		fontSize: 28,
		fontWeight: 700,
		color: "#111827",
		margin: 0
	},
	subtitle: {
		margin: "6px 0 0",
		color: "#6b7280",
		fontSize: 14
	},
	primaryButton: {
		background: "#ef6c00",
		color: "#fff",
		border: "none",
		padding: "10px 16px",
		borderRadius: 10,
		fontWeight: 600,
		cursor: "pointer",
		boxShadow: "0 2px 8px rgba(239,108,0,0.25)"
	},
	secondaryButton: {
		background: "#ffffff",
		color: "#111827",
		border: "1px solid #e5e7eb",
		padding: "8px 12px",
		borderRadius: 10,
		fontWeight: 600,
		cursor: "pointer",
		boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
	},
	lockButton: {
		background: "#fff7ed",
		color: "#9a3412",
		border: "1px solid #fed7aa",
		padding: "8px 12px",
		borderRadius: 10,
		fontWeight: 600,
		cursor: "pointer",
		display: "inline-flex",
		alignItems: "center",
		boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
	},
	plusIcon: {
		display: "inline-block",
		marginRight: 8,
		fontSize: 18,
		lineHeight: "18px",
		fontWeight: 700
	},
	toolbar: {
		display: "flex",
		gap: 12,
		alignItems: "center",
		marginBottom: 16
	},
	searchWrap: {
		display: "flex",
		alignItems: "center",
		background: "#fff",
		border: "1px solid #e5e7eb",
		borderRadius: 10,
		padding: "0 12px",
		height: 42,
		minWidth: 360,
		boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
	},
	searchIcon: {
		color: "#9ca3af",
		marginRight: 8,
		display: "flex",
		alignItems: "center"
	},
	searchInput: {
		border: "none",
		outline: "none",
		flex: 1,
		height: 38,
		fontSize: 14
	},
	filterWrap: {
		position: "relative",
		display: "inline-flex",
		alignItems: "center"
	},
	select: {
		appearance: "none",
		WebkitAppearance: "none",
		MozAppearance: "none",
		background: "#fff",
		border: "1px solid #e5e7eb",
		borderRadius: 10,
		height: 42,
		padding: "0 36px 0 12px",
		fontSize: 14,
		color: "#111827",
		boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
	},
	selectChevron: {
		position: "absolute",
		right: 12,
		pointerEvents: "none",
		color: "#6b7280",
		fontSize: 14
	},
	card: {
		background: "#fff",
		border: "1px solid #e5e7eb",
		borderRadius: 14,
		boxShadow: "0 6px 24px rgba(17,24,39,0.06)"
	},
	table: {
		width: "100%",
		borderCollapse: "separate",
		borderSpacing: 0
	},
	th: {
		textAlign: "left",
		fontSize: 12,
		textTransform: "uppercase",
		letterSpacing: 0.4,
		color: "#6b7280",
		padding: "14px 16px",
		borderBottom: "1px solid #e5e7eb",
		background: "#fafafa"
	},
	tr: {
		borderBottom: "1px solid #f3f4f6"
	},
	td: {
		padding: "14px 16px",
		color: "#111827",
		fontSize: 14,
		verticalAlign: "middle",
		borderBottom: "1px solid #f3f4f6",
		whiteSpace: "nowrap"
	},
	tdCenter: {
		padding: "14px 16px",
		color: "#111827",
		fontSize: 14,
		textAlign: "center",
		borderBottom: "1px solid #f3f4f6"
	},
	tdAction: {
		padding: "8px 12px",
		textAlign: "right",
		borderBottom: "1px solid #f3f4f6"
	},
	nameCell: {
		display: "flex",
		alignItems: "center",
		gap: 12
	},
	avatar: {
		width: 36,
		height: 36,
		borderRadius: 8,
		background:
			"linear-gradient(135deg, rgba(239,108,0,0.9), rgba(255,138,76,0.9))",
		color: "#fff",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontWeight: 700,
		fontSize: 13,
		boxShadow: "0 2px 10px rgba(239,108,0,0.22)"
	},
	nameText: {
		fontWeight: 600,
		color: "#111827"
	},
	emailText: {
		color: "#374151"
	},
	actionWrap: {
		position: "relative",
		display: "inline-block"
	},
	iconButton: {
		background: "transparent",
		border: "1px solid #e5e7eb",
		borderRadius: 8,
		cursor: "pointer",
		padding: 6,
		color: "#6b7280"
	},
	menu: {
		position: "absolute",
		right: 0,
		top: "calc(100% + 6px)",
		background: "#fff",
		border: "1px solid #e5e7eb",
		borderRadius: 10,
		boxShadow: "0 8px 24px rgba(17,24,39,0.12)",
		minWidth: 160,
		padding: 6,
		zIndex: 20
	},
	menuItem: {
		listStyle: "none"
	},
	menuItemDivider: {
		listStyle: "none",
		borderTop: "1px solid #f3f4f6",
		margin: "6px 0"
	},
	menuBtn: {
		display: "block",
		width: "100%",
		textAlign: "left",
		background: "transparent",
		border: "none",
		padding: "10px 10px",
		borderRadius: 8,
		cursor: "pointer",
		color: "#111827",
		fontSize: 14
	},
	menuBtnDanger: {
		display: "block",
		width: "100%",
		textAlign: "left",
		background: "transparent",
		border: "none",
		padding: "10px 10px",
		borderRadius: 8,
		cursor: "pointer",
		color: "#b91c1c",
		fontSize: 14
	},
	emptyCell: {
		padding: "36px 16px",
		textAlign: "center",
		color: "#6b7280"
	}
};

const badgeStyles = {
	base: {
		display: "inline-flex",
		alignItems: "center",
		padding: "4px 10px",
		borderRadius: 999,
		fontSize: 12,
		fontWeight: 600
	},
	roleAdmin: {
		background: "rgba(59,130,246,0.1)",
		color: "#1d4ed8"
	},
	roleUser: {
		background: "rgba(16,185,129,0.12)",
		color: "#047857"
	},
	statusActive: {
		background: "rgba(16,185,129,0.12)",
		color: "#047857"
	},
	statusPaused: {
		background: "rgba(107,114,128,0.12)",
		color: "#374151"
	}
};

function getInitials(fullName) {
	const parts = String(fullName || "")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	if (parts.length === 0) return "NA";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	const first = parts[0][0] ?? "";
	const last = parts[parts.length - 1][0] ?? "";
	return `${first}${last}`.toUpperCase();
}

const modalStyles = {
	backdrop: {
		position: "fixed",
		inset: 0,
		background: "rgba(17,24,39,0.45)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 50,
		padding: 16
	},
	container: {
		width: "100%",
		maxWidth: 520,
		background: "#fff",
		borderRadius: 14,
		border: "1px solid #e5e7eb",
		boxShadow: "0 24px 48px rgba(17,24,39,0.18)",
		overflow: "hidden"
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "14px 16px",
		borderBottom: "1px solid #f3f4f6"
	},
	title: {
		margin: 0,
		fontSize: 18,
		fontWeight: 700,
		color: "#111827"
	},
	body: {
		padding: 16,
		display: "grid",
		rowGap: 12
	},
	label: {
		display: "grid",
		gap: 6,
		fontSize: 13,
		color: "#374151",
		fontWeight: 600
	},
	input: {
		border: "1px solid #e5e7eb",
		borderRadius: 10,
		height: 40,
		padding: "0 12px",
		fontSize: 14
	},
	error: {
		color: "#b91c1c",
		fontSize: 12,
		fontWeight: 600
	},
	footer: {
		display: "flex",
		justifyContent: "flex-end",
		gap: 8,
		padding: 16,
		borderTop: "1px solid #f3f4f6"
	},
	ghostBtn: {
		background: "transparent",
		border: "1px solid #e5e7eb",
		color: "#111827",
		padding: "10px 16px",
		borderRadius: 10,
		fontWeight: 600,
		cursor: "pointer"
	}
};



