import React, { useMemo, useState, useEffect, useRef } from "react";
// GIẢ ĐỊNH: userService.js đã implement các API createUser, updateUser, deleteUser, toggleStatus
import { userService } from "@utils/userService";
import NotificationModal from "@components/NotificationModal/NotificationModal";

// GIẢ ĐỊNH: Các component khác (AddUserModal, EditUserModal, ConfirmModal, 
// RoleBadge, StatusBadge, RowActions, PageStyles, getInitials, styles, modalStyles) tồn tại
// ... (Các imports giả định, styles, helper components)


export default function UserManagement({ currentUserRole = "admin" }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");

	const [users, setUsers] = useState([]);
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(null);
	const [confirmLock, setConfirmLock] = useState(null); // Sử dụng để xác nhận Khóa/Mở khóa

	const [notification, setNotification] = useState({
		isOpen: false,
		title: "",
		message: "",
		type: "info",
	});

	const showNotification = (title, message, type = "info") => {
		setNotification({ isOpen: true, title, message, type });
	};

	// 🔥 Gọi API lấy danh sách user
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

			// Xử lý nhiều cấu trúc response khác nhau
			let apiData = [];
			if (res.data.data && res.data.data.content) {
				// Cấu trúc: { data: { content: [...] } }
				apiData = res.data.data.content;
			} else if (res.data.content) {
				// Cấu trúc: { content: [...] }
				apiData = res.data.content;
			} else if (res.data.data && Array.isArray(res.data.data)) {
				// Cấu trúc: { data: [...] }
				apiData = res.data.data;
			} else if (Array.isArray(res.data)) {
				// Cấu trúc: [...]
				apiData = res.data;
			}

			setUsers(Array.isArray(apiData) ? apiData : []);
		} catch (error) {
		}
	}

	// ============================================
	// CRUD HANDLERS
	// ============================================

	async function handleAddUser(payload) {
		try {
			// Map fields: name -> fullName, email -> gmail
			const apiPayload = {
				fullName: payload.name,
				username: payload.email,
				gmail: payload.email,
				role: payload.role,
				password: "Password123!", // Mật khẩu mặc định
				isActive: true,
			};
			await userService.createUser(apiPayload);
			await fetchUsers();

			setIsAddOpen(false);
			showNotification("Thành công", "Tạo người dùng thành công", "success");
		} catch (err) {
			showNotification("Lỗi", "Không thể tạo người dùng: " + (err.response?.data?.message || err.message), "error");
		}
	}

	async function handleEditUser(id, payload) {
		try {
			const apiPayload = {
				fullName: payload.name,
				// gmail: payload.email, // Thường không cho sửa email
				role: payload.role,
				isActive: true // Giữ nguyên hoặc update nếu có field
			};
			await userService.updateUser(id, apiPayload);
			await fetchUsers();
			setEditingUser(null);
			showNotification("Thành công", "Cập nhật người dùng thành công", "success");
		} catch (err) {
			showNotification("Lỗi", "Không thể cập nhật người dùng", "error");
		}
	}

	function handleRequestDelete(user) {
		setConfirmDelete(user);
	}

	async function handleConfirmDelete() {
		if (!confirmDelete) return;
		try {
			// Gọi API DELETE /api/v1/users/{id}
			await userService.deleteUser(confirmDelete.id);
			// Cập nhật UI ngay lập tức bằng cách lọc bỏ user đã xóa
			setUsers((prev) => prev.filter((u) => u.id !== confirmDelete.id));
			setConfirmDelete(null);
			showNotification("Thành công", "Đã xóa người dùng thành công!", "success");
		} catch (err) {
			console.error("Delete Error:", err);
			showNotification("Lỗi", "Không thể xóa người dùng: " + (err.response?.data?.message || err.message), "error");
		}
	}

	// Hàm yêu cầu xác nhận Khóa/Mở khóa
	function handleRequestLock(user) {
		setConfirmLock(user);
	}

	// Hàm xác nhận và gọi API Khóa/Mở khóa (sử dụng toggleStatus)
	async function handleConfirmLock() {
		console.log("Clicked Confirm Lock/Unlock", confirmLock);
		if (!confirmLock) return;
		try {
			// Gọi API UPDATE (PUT) thay vì PATCH status riêng lẻ vì PATCH bị 403
			// Gửi đầy đủ thông tin để đảm bảo không bị mất dữ liệu
			const apiPayload = {
				fullName: confirmLock.fullName,
				gmail: confirmLock.gmail,
				role: confirmLock.role,
				isActive: !confirmLock.isActive, // Toggle status
				password: confirmLock.password // Nếu backend cần password, nhưng thường update không cần nếu ko đổi
			};

			// Nếu API update không cần password thì bỏ qua. Thường API update user admin sẽ không require password cũ.
			// Nếu PUT /api/v1/users/{id} hoạt động cho Edit, nó sẽ hoạt động cho Lock.

			await userService.updateUser(confirmLock.id, apiPayload);
			await fetchUsers();
			setConfirmLock(null);
			showNotification("Thành công", "Cập nhật trạng thái thành công", "success");
		} catch (err) {
			console.error("Lock/Unlock Error:", err);
			showNotification("Lỗi", "Có lỗi xảy ra khi thay đổi trạng thái tài khoản. " + (err.response?.data?.message || err.message), "error");
		}
	}

	// Giữ hàm này nếu bạn có nút toggle status không cần xác nhận
	async function handleToggleStatus(user) {
		try {
			await userService.toggleStatus(user.id);
			await fetchUsers();
		} catch (err) {
		}
	}


	function handleViewUser(user) {
		// Logic điều hướng đến trang chi tiết người dùng
		showNotification("Thông tin", `Xem tài khoản: ${user.fullName}`, "info");
	}

	// ============================================
	// FILTER USER
	// ============================================
	// ... (useMemo logic giữ nguyên)

	// user.jsx (dòng 105 - useMemo)

	const filteredUsers = useMemo(() => {
		// 🔥 Sửa lỗi: Đảm bảo users là một mảng trước khi gọi filter.
		// Nếu users là null, undefined, hoặc một đối tượng không phải array,
		// sử dụng mảng rỗng [] thay thế.
		const usersToFilter = Array.isArray(users) ? users : [];

		const normalizedQuery = searchQuery.trim().toLowerCase();

		const filtered = usersToFilter.filter((u) => {
			const matchQuery =
				normalizedQuery.length === 0 ||
				(u.fullName && u.fullName.toLowerCase().includes(normalizedQuery)) ||
				(u.gmail && u.gmail.toLowerCase().includes(normalizedQuery));

			const matchRole = roleFilter === "all" ? true : u.role === roleFilter;

			return matchQuery && matchRole;
		});

		// Sắp xếp: ROLE_USER -> ROLE_TEACHER -> ROLE_ADMIN
		const roleOrder = {
			"ROLE_USER": 1,
			"ROLE_TEACHER": 2,
			"ROLE_ADMIN": 3
		};

		return filtered.sort((a, b) => {
			const roleA = roleOrder[a.role] || 99;
			const roleB = roleOrder[b.role] || 99;
			return roleA - roleB;
		});

	}, [users, searchQuery, roleFilter]); // [users] là dependency



	return (
		<div style={styles.page}>
			<PageStyles />

			<div style={styles.mainCard}>
				{/* Header */}
				<div style={{ marginBottom: 24 }}>
					<div style={styles.breadcrumbs}>
						<span style={{ color: "#f97316", fontWeight: 500 }}>Quản lý người dùng</span>
						<span style={{ margin: "0 8px", color: "#d1d5db" }}>/</span>
						<span style={{ color: "#6b7280" }}>Dashboard</span>
						<span style={{ margin: "0 8px", color: "#d1d5db" }}>/</span>
						<span style={{ color: "#6b7280" }}>Tất cả người dùng</span>
					</div>

					<header style={styles.header}>
						<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
							<div style={styles.headerIcon}>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
									<circle cx="9" cy="7" r="4"></circle>
									<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
									<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
								</svg>
							</div>
							<div>
								<h1 style={styles.title}>Quản lý người dùng</h1>
								<p style={styles.subtitle}>Quản lý tài khoản và phân quyền người dùng</p>
							</div>
						</div>
						<div style={{ display: "flex", gap: 12 }}>
							<button
								type="button"
								style={styles.secondaryButton}
								onClick={() => {
									setSearchQuery("");
									setRoleFilter("all");
								}}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
									<path d="M23 4v6h-6"></path>
									<path d="M1 20v-6h6"></path>
									<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
								</svg>
								Làm mới
							</button>
							<button
								type="button"
								style={styles.primaryButton}
								onClick={() => setIsAddOpen(true)}
							>
								<span style={styles.plusIcon}>+</span> Thêm người dùng
							</button>
						</div>
					</header>
				</div>

				{/* Stats Cards */}
				<div style={styles.statsGrid}>
					{[
						{
							label: "Tổng người dùng",
							value: users.length,
							icon: (
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
									<circle cx="9" cy="7" r="4"></circle>
									<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
									<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
								</svg>
							),
							color: "#f97316", // Orange
							bg: "#fff7ed"
						},
						{
							label: "Đang hoạt động",
							value: users.filter(u => u.isActive).length,
							icon: (
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
									<circle cx="8.5" cy="7" r="4"></circle>
									<polyline points="22 4 12 14.01 9 11.01"></polyline>
								</svg>
							),
							color: "#10b981", // Green
							bg: "#ecfdf5"
						},
						{
							label: "Giảng viên",
							value: users.filter(u => u.role === "ROLE_TEACHER").length,
							icon: (
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
								</svg>
							),
							color: "#3b82f6", // Blue
							bg: "#eff6ff"
						},
						{
							label: "Học viên",
							value: users.filter(u => u.role === "ROLE_USER").length,
							icon: (
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
									<circle cx="12" cy="7" r="4"></circle>
								</svg>
							),
							color: "#a855f7", // Purple
							bg: "#faf5ff"
						}
					].map((stat, index) => (
						<div key={index} style={{ ...styles.statCard, backgroundColor: stat.bg, borderColor: "transparent" }}>
							<div style={{ ...styles.statIconWrapper, backgroundColor: stat.color, color: "#fff" }}>
								{stat.icon}
							</div>
							<div style={styles.statContent}>
								<div style={styles.statValue}>{stat.value}</div>
								<div style={styles.statLabel}>{stat.label}</div>
							</div>
							<div style={{ position: 'absolute', top: 24, right: 24 }}>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stat.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
								</svg>
							</div>
						</div>
					))}
				</div>

				{/* Toolbar */}
				<section style={styles.toolbar} className="_um-toolbar">
					<div style={{ display: "flex", gap: 12, flex: 1 }}>
						<div style={styles.searchWrap} className="_um-search">
							<span aria-hidden="true" style={styles.searchIcon}>
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
								style={styles.searchInput}
							/>
						</div>

						<label style={styles.filterWrap}>
							<span style={styles.filterIcon}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
								</svg>
							</span>
							<select
								value={roleFilter}
								onChange={(e) => setRoleFilter(e.target.value)}
								style={styles.select}
							>
								<option value="all">Tất cả vai trò</option>
								<option value="ROLE_ADMIN">Quản trị viên</option>
								<option value="ROLE_TEACHER">Giảng viên</option>
								<option value="ROLE_USER">Người dùng</option>
							</select>
							<span style={styles.selectChevron} aria-hidden="true">▾</span>
						</label>

						<label style={styles.filterWrap}>
							<span style={styles.filterIcon}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
								</svg>
							</span>
							<select
								style={styles.select}
								defaultValue="all"
							>
								<option value="all">Tất cả trạng thái</option>
								<option value="active">Hoạt động</option>
								<option value="inactive">Ngừng hoạt động</option>
							</select>
							<span style={styles.selectChevron} aria-hidden="true">▾</span>
						</label>
					</div>

					<div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
						Tìm thấy: <span style={{ color: "#f97316", fontWeight: 700, background: "#fff7ed", padding: "2px 8px", borderRadius: 6 }}>{filteredUsers.length}</span> người dùng
					</div>
				</section>

				{/* Table */}
				<div style={styles.card}>
					<div style={{ overflowX: "auto" }}>
						<table style={styles.table}>
							<thead>
								<tr>
									<th style={styles.th}>HỌ VÀ TÊN</th>
									<th style={styles.th}>EMAIL</th>
									<th style={styles.th}>VAI TRÒ</th>
									<th style={styles.th}>TRẠNG THÁI</th>
									<th style={styles.th}>NGÀY THAM GIA</th>
									<th style={styles.th} />
								</tr>
							</thead>
							<tbody>
								{filteredUsers.map((u) => (
									<tr key={u.id} style={styles.tr}>
										<td style={styles.td}>
											<div style={styles.nameText}>{u.fullName}</div>
										</td>
										<td style={styles.td}>
											<div style={styles.emailText}>{u.gmail}</div>
										</td>
										<td style={styles.td}>
											<RoleBadge role={u.role} />
										</td>
										<td style={styles.td}>
											<StatusBadge status={u.isActive ? 'active' : 'paused'} />
										</td>
										<td style={styles.td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : "---"}</td>
										<td style={styles.tdAction}>
											<RowActions
												onView={() => handleViewUser(u)}
												onLock={() => handleRequestLock(u)}
												onEdit={() => setEditingUser(u)}
												onDelete={() => handleRequestDelete(u)}
												isActive={u.isActive}
												role={u.role}
											/>
										</td>
									</tr>
								))}
								{filteredUsers.length === 0 && (
									<tr>
										<td style={styles.emptyCell} colSpan={8}>
											Không tìm thấy người dùng phù hợp
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Modals */}
			{
				isAddOpen && (
					<AddUserModal
						onClose={() => setIsAddOpen(false)}
						onSubmit={handleAddUser}
						allowedRoles={["ROLE_ADMIN", "ROLE_TEACHER", "ROLE_USER"]}
					/>
				)
			}

			{
				editingUser && (
					<EditUserModal
						user={editingUser}
						onClose={() => setEditingUser(null)}
						onSubmit={(payload) => handleEditUser(editingUser.id, payload)}
						allowedRoles={["ROLE_ADMIN", "ROLE_TEACHER", "ROLE_USER"]}
					/>
				)
			}

			{
				confirmDelete && (
					<ConfirmModal
						title="Xóa người dùng"
						message={`Bạn có chắc chắn muốn xóa người dùng '${confirmDelete.fullName}'?`}
						onCancel={() => setConfirmDelete(null)}
						onConfirm={handleConfirmDelete}
						confirmLabel="Xóa"
					/>
				)
			}

			{/* MODAL XÁC NHẬN KHÓA/MỞ KHÓA */}
			{
				confirmLock && (
					<ConfirmModal
						title={`${confirmLock.isActive ? 'Khóa' : 'Mở khóa'} tài khoản`}
						message={`Bạn có chắc chắn muốn ${confirmLock.isActive ? 'khóa' : 'mở khóa'} tài khoản '${confirmLock.fullName}'?`}
						onCancel={() => setConfirmLock(null)}
						onConfirm={handleConfirmLock}
						confirmLabel={confirmLock.isActive ? 'Khóa' : 'Mở khóa'}
						// Ensure style object is valid
						confirmStyle={confirmLock.isActive ? { ...modalStyles.dangerBtn } : { ...modalStyles.primaryBtn }}
					/>
				)
			}
		</div >
	);
}
// ... (Phần còn lại của các component AddUserModal, EditUserModal, v.v.)
function AddUserModal({ onClose, onSubmit, allowedRoles }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState(allowedRoles[0] || "ROLE_USER");
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
										{r === "ROLE_ADMIN"
											? "Quản trị viên"
											: r === "ROLE_TEACHER"
												? "Giảng viên"
												: "Người dùng"}
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
	const [name, setName] = useState(user.fullName || "");
	const [email, setEmail] = useState(user.gmail || "");
	const [role, setRole] = useState(
		allowedRoles.includes(user.role) ? user.role : allowedRoles[0] || "ROLE_USER"
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
										{r === "ROLE_ADMIN"
											? "Quản trị viên"
											: r === "ROLE_TEACHER"
												? "Giảng viên"
												: "Người dùng"}
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

function ConfirmModal({ title, message, onCancel, onConfirm, confirmLabel = "Xóa", confirmStyle }) {
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
					<button type="button" onClick={onCancel} style={{ ...modalStyles.ghostBtn, cursor: "pointer" }}>
						Hủy
					</button>
					<button
						type="button"
						onClick={onConfirm}
						style={{ ...(confirmStyle || { ...styles.primaryButton, background: "#b91c1c" }), cursor: "pointer", zIndex: 60 }}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}

function RoleBadge({ role }) {
	let label = "Người dùng";
	let style = badgeStyles.roleUser;

	if (role === "ROLE_ADMIN") {
		label = "Quản trị viên";
		style = badgeStyles.roleAdmin;
	} else if (role === "ROLE_TEACHER") {
		label = "Giảng viên";
		style = badgeStyles.roleTeacher;
	}

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

function RowActions({ onView, onLock, onEdit, onDelete, isActive, role }) {
	// Kiểm tra nếu là Admin thì không cho phép chỉnh sửa/xóa (theo yêu cầu)
	const isAdmin = role === "ROLE_ADMIN";

	return (
		<div style={styles.actionWrap}>

			{/* Nút Khóa / Mở khóa */}
			{!isAdmin && (
				<button
					type="button"
					aria-label={isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
					title={isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
					onClick={() => onLock && onLock()}
					style={{ ...styles.iconButton, marginLeft: 6, color: isActive ? "#6b7280" : "#ef4444" }}
				>
					{isActive ? (
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
							<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
							<path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
						</svg>
					) : (
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
							<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
							<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
						</svg>
					)}
				</button>
			)}

			{/* Nút Chỉnh sửa (Trực tiếp) */}
			{!isAdmin && (
				<button
					type="button"
					aria-label="Chỉnh sửa"
					title="Chỉnh sửa"
					onClick={() => onEdit && onEdit()}
					style={{ ...styles.iconButton, marginLeft: 6, color: "#3b82f6" }}
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
						<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
						<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
					</svg>
				</button>
			)}

			{/* Nút Xóa (Trực tiếp) */}
			{!isAdmin && (
				<button
					type="button"
					aria-label="Xóa"
					title="Xóa"
					onClick={() => onDelete && onDelete()}
					style={{ ...styles.iconButton, marginLeft: 6, color: "#ef4444" }}
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
						<polyline points="3 6 5 6 21 6"></polyline>
						<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
						<line x1="10" y1="11" x2="10" y2="17"></line>
						<line x1="14" y1="11" x2="14" y2="17"></line>
					</svg>
				</button>
			)}

			{isAdmin && (
				<span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic", padding: "0 8px" }}>
					(Admin)
				</span>
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
		minHeight: "100vh",
	},
	// Used for the table container
	card: {
		background: "#fff",
		borderRadius: 16,
		boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
		marginTop: 24,
		overflow: "hidden" // For clean borders
	},
	// Helper to unwrap mainCard
	mainCard: {
		background: "transparent",
		width: "100%",
	},
	breadcrumbs: {
		display: "flex",
		alignItems: "center",
		fontSize: 13,
		marginBottom: 12
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 32
	},
	headerIcon: {
		width: 44,
		height: 44,
		borderRadius: 12,
		background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
		color: "#fff",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		boxShadow: "0 4px 6px -1px rgba(249, 115, 22, 0.2)"
	},
	title: {
		fontSize: 24,
		fontWeight: 700,
		color: "#111827",
		margin: 0,
		lineHeight: "1.2"
	},
	subtitle: {
		margin: "4px 0 0",
		color: "#6b7280",
		fontSize: 14
	},
	primaryButton: {
		background: "#ea580c",
		color: "#fff",
		border: "none",
		padding: "0 20px",
		height: 40,
		borderRadius: 8,
		fontWeight: 600,
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		fontSize: 14,
		boxShadow: "0 2px 4px rgba(234,88,12,0.2)"
	},
	secondaryButton: {
		background: "#fff",
		color: "#374151",
		border: "1px solid #e5e7eb",
		padding: "0 16px",
		height: 40,
		borderRadius: 8,
		fontWeight: 600,
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		fontSize: 14,
		boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
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
		marginRight: 6,
		fontSize: 18,
		fontWeight: 500
	},
	statsGrid: {
		display: "grid",
		gridTemplateColumns: "repeat(4, 1fr)",
		gap: 24,
		marginBottom: 32
	},
	statCard: {
		borderRadius: 16,
		padding: "24px",
		display: "flex",
		flexDirection: "column",
		position: "relative",
		minHeight: 140,
		justifyContent: "space-between"
	},
	statIconWrapper: {
		width: 48,
		height: 48,
		borderRadius: 12,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 16
	},
	statContent: {
		display: "flex",
		flexDirection: "column"
	},
	statValue: {
		fontSize: 32,
		fontWeight: 700,
		color: "#111827",
		lineHeight: "1",
		marginBottom: 8
	},
	statLabel: {
		fontSize: 14,
		color: "#4b5563",
		fontWeight: 500
	},
	toolbar: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
		background: "transparent"
	},
	searchWrap: {
		display: "flex",
		alignItems: "center",
		background: "#fff", // White to stand out on gray
		border: "none",
		borderRadius: 8,
		padding: "0 12px",
		height: 44,
		flex: 1, // Expand to fill
		boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" // Small shadow like a card
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
		height: 40,
		fontSize: 14,
		background: "transparent",
		color: "#111827"
	},
	filterWrap: {
		position: "relative",
		display: "inline-flex",
		alignItems: "center"
	},
	filterIcon: {
		position: "absolute",
		left: 12,
		top: "50%",
		transform: "translateY(-50%)",
		color: "#9ca3af",
		pointerEvents: "none",
		zIndex: 1,
		display: "flex"
	},
	select: {
		appearance: "none",
		WebkitAppearance: "none",
		MozAppearance: "none",
		background: "#f9fafb", // Match search input
		border: "none",
		borderRadius: 8,
		height: 44,
		padding: "0 36px 0 40px", // Left padding for icon
		fontSize: 14,
		color: "#111827",
		cursor: "pointer",
		boxShadow: "inset 0 0 0 1px #e5e7eb"
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
	roleTeacher: {
		background: "rgba(245, 158, 11, 0.12)",
		color: "#b45309"
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
		zIndex: 9999,
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
	},
	dangerBtn: {
		background: "#dc2626",
		border: "none",
		color: "#fff",
		padding: "10px 16px",
		borderRadius: 10,
		fontWeight: 600,
		cursor: "pointer",
		boxShadow: "0 2px 8px rgba(220,38,38,0.25)"
	},
	primaryBtn: {
		background: "#10b981",
		border: "none",
		color: "#fff",
		padding: "10px 16px",
		borderRadius: 10,
		fontWeight: 600,
		cursor: "pointer",
		boxShadow: "0 2px 8px rgba(16,185,129,0.25)"
	}
};



