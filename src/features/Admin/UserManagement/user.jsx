import React, { useMemo, useState, useEffect, useRef } from "react";
import { userService } from "@utils/userService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import { ShieldUser } from "lucide-react";


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

			<header style={styles.header}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>

					{/* Icon Box */}
					<div
						style={{
							width: 48,
							height: 48,
							background: 'linear-gradient(135deg,  #f97316, #ea580c)',
							borderRadius: 12,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'white',
							boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
							flexShrink: 0
						}}
					>
						<ShieldUser size={24} />
					</div>

					{/* Text */}
					<div>
						<h1
							style={{
								fontSize: 24,
								fontWeight: 700,
								color: '#111827',
								margin: '0 0 4px 0',
								lineHeight: 1.2
							}}
						>
							Quản lý người dùng
						</h1>

						<p
							style={{
								fontSize: 14,
								color: '#6b7280',
								margin: 0,
								fontWeight: 500
							}}
						>
							Danh sách người dùng và quản lý quyền truy cập
						</p>
					</div>
				</div>

				<button
					type="button"
					style={styles.primaryButton}
					onClick={() => setIsAddOpen(true)}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = '#ea580c';
						e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.3)';
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = '#f97316';
						e.currentTarget.style.boxShadow = '0 2px 4px rgba(249, 115, 22, 0.2)';
					}}
				>
					<span style={styles.plusIcon}>+</span> Thêm người dùng
				</button>
			</header>

			{/* Toolbar */}
			<section style={styles.toolbar} className="_um-toolbar">
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
			</section>

			{/* Table */}
			<div style={styles.card}>
				<div style={{ overflowX: "auto" }}>
					<table style={styles.table}>
						<thead>
							<tr>
								<th style={styles.th}>Họ và tên</th>
								<th style={styles.th}>Email</th>
								<th style={styles.th}>Vai trò</th>
								<th style={styles.th}>Trạng thái</th>
								<th style={styles.th}>Ngày tham gia</th>
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
						confirmLabel="🗑️ Xóa"
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
						confirmLabel={confirmLock.isActive ? '🔒 Khóa' : '🔓 Mở khóa'}
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
							✏️ Lưu thay đổi
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
					style={{ ...styles.iconButton, marginLeft: 6 }}
				>
					{isActive ? "🔒" : "🔓"}
				</button>
			)}

			{/* Nút Chỉnh sửa (Trực tiếp) */}
			{!isAdmin && (
				<button
					type="button"
					aria-label="Chỉnh sửa"
					title="Chỉnh sửa"
					onClick={() => onEdit && onEdit()}
					style={{ ...styles.iconButton, marginLeft: 6 }}
				>
					✏️
				</button>
			)}

			{/* Nút Xóa (Trực tiếp) */}
			{!isAdmin && (
				<button
					type="button"
					aria-label="Xóa"
					title="Xóa"
					onClick={() => onDelete && onDelete()}
					style={{ ...styles.iconButton, marginLeft: 6 }}
				>
					🗑️
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
		minHeight: "100%"
	},
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 32
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
		background: "#f97316",
		color: "#fff",
		border: "none",
		padding: "10px 20px",
		borderRadius: 8,
		fontWeight: 600,
		fontSize: 14,
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		gap: 8,
		boxShadow: "0 2px 4px rgba(249, 115, 22, 0.2)",
		transition: "all 0.2s"
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



