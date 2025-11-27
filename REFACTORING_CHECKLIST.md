# 📋 Checklist Refactoring - User & Class Components

## ✅ Files đã được tạo sẵn

- [ ] `user.css` - CSS cho User Management (516 dòng)
- [ ] `class.css` - CSS cho Class Management (474 dòng)
- [ ] `REFACTORING_GUIDE.md` - Hướng dẫn chi tiết
- [ ] `REFACTORING_SUMMARY.md` - Tóm tắt dự án
- [ ] `user_refactored_example.jsx` - Ví dụ code đã refactor
- [ ] `refactor_styles.py` - Script tự động (experimental)

## 📝 Các bước thực hiện (Khuyến nghị làm thủ công)

### Phase 1: Chuẩn bị

- [ ] Backup file gốc:
  ```powershell
  Copy-Item src/features/Admin/UserManagement/user.jsx user.jsx.backup
  Copy-Item src/features/Admin/ClassManagement/class.jsx class.jsx.backup
  ```

- [ ] Mở cả 3 files cùng lúc: 
  - `user.jsx` (để edit)
  - `user.css` (để tham khảo class names)
  - `user_refactored_example.jsx` (để xem ví dụ)

### Phase 2: Refactor user.jsx

#### Step 1: Import CSS
- [ ] Thêm `import "./user.css";` sau các import khác

#### Step 2: Replace Header Section
- [ ] `style={styles.page}` → `className="um-page"`
- [ ] `style={styles.header}` → `className="um-header"`
- [ ] `style={styles.title}` → `className="um-title"`
- [ ] `style={styles.subtitle}` → `className="um-subtitle"`
- [ ] `style={styles.primaryButton}` → `className="um-primary-button"`
- [ ] `style={styles.plusIcon}` → `className="um-plus-icon"`

#### Step 3: Replace Toolbar Section
- [ ] `style={styles.toolbar}` → `className="um-toolbar _um-toolbar"`
- [ ] `style={styles.searchWrap}` → `className="um-search-wrap _um-search"`
- [ ] `style={styles.searchIcon}` → `className="um-search-icon"`
- [ ] `style={styles.searchInput}` → `className="um-search-input"`
- [ ] `style={styles.filterWrap}` → `className="um-filter-wrap"`
- [ ] `style={styles.select}` → `className="um-select"`
- [ ] `style={styles.selectChevron}` → `className="um-select-chevron"`

#### Step 4: Replace Table Section
- [ ] `style={styles.card}` → `className="um-card"`
- [ ] `style={styles.table}` → `className="um-table"`
- [ ] `style={styles.th}` → `className="um-th"`
- [ ] `style={styles.tr}` → `className="um-tr"`
- [ ] `style={styles.td}` → `className="um-td"`
- [ ] `style={styles.tdAction}` → `className="um-td-action"`
- [ ] `style={styles.nameText}` → `className="um-name-text"`
- [ ] `style={styles.emailText}` → `className="um-email-text"`
- [ ] `style={styles.emptyCell}` → `className="um-empty-cell"`

#### Step 5: Replace Component Functions
- [ ] Update `RoleBadge` component
- [ ] Update `StatusBadge` component
- [ ] Update `RowActions` component
- [ ] Update `AddUserModal` component
- [ ] Update `EditUserModal` component
- [ ] Update `ConfirmModal` component

#### Step 6: Cleanup
- [ ] Comment out hoặc xóa `const styles = { ... }`
- [ ] Comment out hoặc xóa `const badgeStyles = { ... }`
- [ ] Comment out hoặc xóa `const modalStyles = { ... }`
- [ ] Xóa `function PageStyles() { ... }`
- [ ] Xóa `<PageStyles />` trong JSX

#### Step 7: Test user.jsx
- [ ] Lưu file
- [ ] Check console browser - không có error
- [ ] Check UI - hiển thị đúng
- [ ] Test search - hoạt động
- [ ] Test filter - hoạt động
- [ ] Test thêm user - hoạt động
- [ ] Test sửa user - hoạt động
- [ ] Test xóa user - hoạt động
- [ ] Test khóa/mở khóa - hoạt động
- [ ] Test responsive (resize browser)

### Phase 3: Refactor class.jsx

#### Step 1: Import CSS
- [ ] Thêm `import "./class.css";` sau các import khác

#### Step 2: Replace Header Section
- [ ] `style={styles.page}` → `className="cm-page"`
- [ ] `style={styles.header}` → `className="cm-header"`
- [ ] `style={styles.title}` → `className="cm-title"`
- [ ] `style={styles.subtitle}` → `className="cm-subtitle"`
- [ ] `style={styles.primaryButton}` → `className="cm-primary-button"`
- [ ] `style={styles.plusIcon}` → `className="cm-plus-icon"`

#### Step 3: Replace KPI Section
- [ ] `style={styles.kpis}` → `className="cm-kpis"`
- [ ] `style={styles.statCard}` → `className="cm-stat-card"`
- [ ] `style={styles.statIcon}` → `className="cm-stat-icon"`
- [ ] `style={styles.statLabel}` → `className="cm-stat-label"`
- [ ] `style={styles.statValue}` → `className="cm-stat-value"`

#### Step 4: Replace Toolbar Section
- [ ] `style={styles.toolbar}` → `className="cm-toolbar _cm-toolbar"`
- [ ] `style={styles.searchWrap}` → `className="cm-search-wrap _cm-search"`
- [ ] `style={styles.searchIcon}` → `className="cm-search-icon"`
- [ ] `style={styles.searchInput}` → `className="cm-search-input"`
- [ ] `style={styles.filterWrap}` → `className="cm-filter-wrap"`
- [ ] `style={styles.select}` → `className="cm-select"`
- [ ] `style={styles.selectChevron}` → `className="cm-select-chevron"`

#### Step 5: Replace Table Section
- [ ] `style={styles.card}` → `className="cm-card"`
- [ ] `style={styles.table}` → `className="cm-table"`
- [ ] `style={styles.th}` → `className="cm-th"`
- [ ] `style={styles.tr}` → `className="cm-tr"`
- [ ] `style={styles.td}` → `className="cm-td"`
- [ ] `style={styles.className}` → `className="cm-class-name"`
- [ ] `style={styles.classSubtitle}` → `className="cm-class-subtitle"`
- [ ] `style={styles.badgeCode}` → `className="cm-badge-code"`
- [ ] `style={styles.activeWrap}` → `className="cm-active-wrap"`
- [ ] `style={styles.progressOuter}` → `className="cm-progress-outer"`
- [ ] `style={styles.emptyCell}` → `className="cm-empty-cell"`

#### Step 6: Replace Component Functions
- [ ] Update `StatCard` component
- [ ] Update `BadgeCode` component
- [ ] Update `ProgressBar` component (CHÚ Ý: giữ width động)
- [ ] Update `StatusBadge` component
- [ ] Update `ActionCell` component
- [ ] Update `AddClassModal` component
- [ ] Update `EditClassModal` component
- [ ] Update `ViewClassModal` component
- [ ] Update `ConfirmModal` component

#### Step 7: Cleanup
- [ ] Comment out hoặc xóa `const styles = { ... }`
- [ ] Comment out hoặc xóa `const badgeStyles = { ... }`
- [ ] Comment out hoặc xóa `const modalStyles = { ... }`
- [ ] Xóa `function LocalStyles() { ... }`
- [ ] Xóa `<LocalStyles />` trong JSX

#### Step 8: Test class.jsx
- [ ] Lưu file
- [ ] Check console browser - không có error
- [ ] Check UI - hiển thị đúng
- [ ] Test KPI cards - hiển thị đúng
- [ ] Test search - hoạt động
- [ ] Test filter - hoạt động
- [ ] Test thêm lớp - hoạt động
- [ ] Test sửa lớp - hoạt động
- [ ] Test xóa lớp - hoạt động
- [ ] Test xem chi tiết - hoạt động
- [ ] Test progress bars - hiển thị và màu đúng
- [ ] Test responsive (resize browser)

### Phase 4: Final Testing

- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Hard reload (Ctrl+Shift+R)
- [ ] Test toàn bộ user flow:
  - [ ] Login
  - [ ] Navigate to User Management
  - [ ] Perform all CRUD operations
  - [ ] Navigate to Class Management
  - [ ] Perform all CRUD operations
- [ ] Test trên Chrome
- [ ] Test trên Firefox (nếu có)
- [ ] Test responsive mobile (DevTools)
- [ ] Test responsive tablet (DevTools)
- [ ] Không có warning trong console
- [ ] Không có error trong console

### Phase 5: Commit Changes

- [ ] Git add tất cả files mới và đã sửa
- [ ] Git commit với message có ý nghĩa:
  ```bash
  git add src/features/Admin/UserManagement/
  git add src/features/Admin/ClassManagement/
  git commit -m "refactor: Tách CSS ra khỏi user.jsx và class.jsx thành files riêng
  
  - Tạo user.css với 60+ classes cho User Management
  - Tạo class.css với 70+ classes cho Class Management
  - Chuyển đổi tất cả inline styles thành className
  - Giữ nguyên logic và functionality
  - Cải thiện code organization và maintainability"
  ```

## 🎯 Tiêu chí hoàn thành

- ✅ user.jsx và class.jsx không còn inline style objects
- ✅ Tất cả styling đều thông qua className
- ✅ UI nhìn và hoạt động giống hệt như trước
- ✅ Không có lỗi trong console
- ✅ Code dễ đọc và maintain hơn
- ✅ Files nhỏ hơn đáng kể

## 💡 Tips

1. **Làm từng phần nhỏ**: Đừng thay hết một lúc
2. **Test thường xuyên**: Sau mỗi section
3. **Dùng VSCode Find**: Ctrl+F để tìm `style={`
4. **Dùng Multiple Cursors**: Alt+Click để edit nhiều dòng cùng lúc
5. **Git commit thường xuyên**: Dễ rollback nếu cần
6. **Backup quan trọng**: Luôn giữ bản backup

## ⚠️ Common Pitfalls

- ❌ **Quên import CSS** → Không có style nào apply
- ❌ **Nhầm prefix** (um- vs cm-) → Class không tồn tại
- ❌ **Xóa styles dynamic** → UI bị lỗi
- ❌ **Quên test responsive** → Mobile/tablet bị lỗi
- ❌ **Không clear cache** → Vẫn thấy style cũ

## 🚀 Estimated Time

- **user.jsx**: 30-45 phút (nếu làm thủ công cẩn thận)
- **class.jsx**: 45-60 phút (phức tạp hơn)
- **Testing**: 20-30 phút
- **Total**: ~2 giờ

---

**Good luck!** 🎉

Nếu gặp vấn đề gì, check lại:
1. Import CSS đã đúng chưa?
2. ClassName có typo không?
3. Browser cache đã clear chưa?
4. Console có error gì không?
