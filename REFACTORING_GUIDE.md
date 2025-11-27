# Hướng dẫn Refactoring User.jsx và Class.jsx

## Tổng quan
Đã tạo 2 file CSS riêng:
- `user.css` - Chứa tất cả styles cho User Management
- `class.css` - Chứa tất cả styles cho Class Management

## Các thay đổi cần thực hiện

### 1. Import CSS vào đầu file

**user.jsx:**
```javascript
import React, { useMemo, useState, useEffect, useRef } from "react";
import { userService } from "@utils/userService";
import "./user.css"; // ← THÊM DÒNG NÀY
```

**class.jsx:**
```javascript
import React, { useMemo, useState, useEffect, useRef } from "react";
import { classService } from "@utils/classService";
import "./class.css"; // ← THÊM DÒNG NÀY
```

### 2. Mapping styles object sang className

#### USER.JSX - Style Mappings:

| Style Object | → | className |
|--------------|---|-----------|
| `styles.page` | → | `className="um-page"` |
| `styles.header` | → | `className="um-header"` |
| `styles.title` | → | `className="um-title"` |
| `styles.subtitle` | → | `className="um-subtitle"` |
| `styles.primaryButton` | → | `className="um-primary-button"` |
| `styles.plusIcon` | → | `className="um-plus-icon"` |
| `styles.toolbar` | → | `className="um-toolbar _um-toolbar"` |
| `styles.searchWrap` | → | `className="um-search-wrap _um-search"` |
| `styles.searchIcon` | → | `className="um-search-icon"` |
| `styles.searchInput` | → | `className="um-search-input"` |
| `styles.filterWrap` | → | `className="um-filter-wrap"` |
| `styles.select` | → | `className="um-select"` |
| `styles.selectChevron` | → | `className="um-select-chevron"` |
| `styles.card` | → | `className="um-card"` |
|`styles.table` | → | `className="um-table"` |
| `styles.th` | → | `className="um-th"` |
| `styles.tr` | → | `className="um-tr"` |
| `styles.td` | → | `className="um-td"` |
| `styles.nameText` | → | `className="um-name-text"` |
| `styles.emailText` | → | `className="um-email-text"` |
| `styles.tdAction` | → | `className="um-td-action"` |
| `styles.actionWrap` | → | `className="um-action-wrap"` |
| `styles.iconButton` | → | `className="um-icon-button"` |
| `styles.menu` | → | `className="um-menu"` |
| `styles.menuItem` | → | `className="um-menu-item"` |
| `styles.menuBtn` | → | `className="um-menu-btn"` |
| `styles.menuBtnDanger` | → | `className="um-menu-btn-danger"` |
| `styles.emptyCell` | → | `className="um-empty-cell"` |
| `badgeStyles.base` + `badgeStyles.roleAdmin` | → | `className="um-badge-base um-badge-role-admin"` |
| `badgeStyles.base` + `badgeStyles.roleUser` | → | `className="um-badge-base um-badge-role-user"` |
| `badgeStyles.base` + `badgeStyles.statusActive` | → | `className="um-badge-base um-badge-status-active"` |
| `badgeStyles.base` + `badgeStyles.statusPaused` | → | `className="um-badge-base um-badge-status-paused"` |
| `modalStyles.backdrop` | → | `className="um-modal-backdrop"` |
| `modalStyles.container` | → | `className="um-modal-container"` |
| `modalStyles.header` | → | `className="um-modal-header"` |
| `modalStyles.title` | → | `className="um-modal-title"` |
| `modalStyles.body` | → | `className="um-modal-body"` |
| `modalStyles.label` | → | `className="um-modal-label"` |
| `modalStyles.input` | → | `className="um-modal-input"` |
| `modalStyles.error` | → | `className="um-modal-error"` |
| `modalStyles.footer` | → | `className="um-modal-footer"` |
| `modalStyles.ghostBtn` | → | `className="um-modal-ghost-btn"` |
| `modalStyles.dangerBtn` | → | `className="um-modal-danger-btn"` |
| `modalStyles.primaryBtn` | → | `className="um-modal-primary-btn"` |

#### CLASS.JSX - Style Mappings:

| Style Object | → | className |
|--------------|---|-----------|
| `styles.page` | → | `className="cm-page"` |
| `styles.header` | → | `className="cm-header"` |
| `styles.title` | → | `className="cm-title"` |
| `styles.subtitle` | → | `className="cm-subtitle"` |
| `styles.primaryButton` | → | `className="cm-primary-button"` |
| `styles.plusIcon` | → | `className="cm-plus-icon"` |
| `styles.kpis` | → | `className="cm-kpis"` |
| `styles.statCard` | → | `className="cm-stat-card"` |
| `styles.statIcon` | → | `className="cm-stat-icon"` |
| `styles.statLabel` | → | `className="cm-stat-label"` |
| `styles.statValue` | → | `className="cm-stat-value"` |
| `styles.toolbar` | → | `className="cm-toolbar _cm-toolbar"` |
| `styles.searchWrap` | → | `className="cm-search-wrap _cm-search"` |
| `styles.searchIcon` | → | `className="cm-search-icon"` |
| `styles.searchInput` | → | `className="cm-search-input"` |
| `styles.filterWrap` | → | `className="cm-filter-wrap"` |
| `styles.select` | → | `className="cm-select"` |
| `styles.selectChevron` | → | `className="cm-select-chevron"` |
| `styles.card` | → | `className="cm-card"` |
| `styles.table` | → | `className="cm-table"` |
| `styles.th` | → | `className="cm-th"` |
| `styles.tr` | → | `className="cm-tr"` |
| `styles.td` | → | `className="cm-td"` |
| `styles.className` | → | `className="cm-class-name"` |
| `styles.classSubtitle` | → | `className="cm-class-subtitle"` |
| `styles.badgeCode` | → | `className="cm-badge-code"` |
| `styles.activeWrap` | → | `className="cm-active-wrap"` |
| `styles.progressOuter` | → | `className="cm-progress-outer"` |
| `styles.progressInner` | → | `className="cm-progress-inner"` |
| `styles.emptyCell` | → | `className="cm-empty-cell"` |
| `styles.actionWrap` | → | `className="cm-action-wrap"` |
| `styles.iconButton` | → | `className="cm-icon-button"` |
| `styles.menu` | → | `className="cm-menu"` |
| `styles.menuItem` | → | `className="cm-menu-item"` |
| `styles.menuBtn` | → | `className="cm-menu-btn"` |
| `styles.menuBtnDanger` | → | `className="cm-menu-btn-danger"` |
| `badgeStyles.base` + `badgeStyles.statusActive` | → | `className="cm-badge-base cm-badge-status-active"` |
| `badgeStyles.base` + `badgeStyles.statusUpcoming` | → | `className="cm-badge-base cm-badge-status-upcoming"` |
| `badgeStyles.base` + `badgeStyles.statusEnded` | → | `className="cm-badge-base cm-badge-status-ended"` |
| `modalStyles.backdrop` | → | `className="cm-modal-backdrop"` |
| `modalStyles.container` | → | `className="cm-modal-container"` |
| `modalStyles.header` | → | `className="cm-modal-header"` |
| `modalStyles.title` | → | `className="cm-modal-title"` |
| `modalStyles.body` | → | `className="cm-modal-body"` |
| `modalStyles.label` | → | `className="cm-modal-label"` |
| `modalStyles.input` | → | `className="cm-modal-input"` |
| `modalStyles.error` | → | `className="cm-modal-error"` |
| `modalStyles.footer` | → | `className="cm-modal-footer"` |
| `modalStyles.ghostBtn` | → | `className="cm-modal-ghost-btn"` |

### 3. Xóa các style objects

Sau khi đã chuyển hết sang className, xóa các dòng:
- Toàn bộ `const styles = { ... }`
- Toàn bộ `const badgeStyles = { ... }`
- Toàn bộ `const modalStyles = { ... }`
- Function `PageStyles()` hoặc `LocalStyles()` (đã chuyển vào CSS)
- Function `getInitials()` nếu không dùng (hoặc để lại nếu cần)

### 4. Các inline styles đặc biệt cần giữ lại

Một số inline styles động KHÔNG nên chuyển sang CSS:

**user.jsx:** - Không có styles động đặc biệt

**class.jsx:**
```jsx
// Giữ lại inline style này vì width động dựa trên percent
<div style={{ ...styles.progressInner, width: `${clamped}%` }} />
// → Chuyển thành:
<div className="cm-progress-inner" style={{ width: `${clamped}%` }} />
```

```jsx
// Modal với className đặc biệt
<div style={modalStyles.container} className="_add-user-modal">
// → Chuyển thành:
<div className="um-modal-container _add-user-modal">
```

### 5. Các spread operator cần chú ý

Khi có spread operator như:
```jsx
style={{ ...styles.th, width: 360 }}
```
Chuyển thành:
```jsx
className="cm-th" style={{ width: 360 }}
```

## Tự động hóa với Find & Replace

Bạn có thể dùng tính năng Find & Replace của VSCode với regex:

### Cho user.jsx:
1. `style={styles\.page}` → `className="um-page"`
2. `style={styles\.header}` → `className="um-header"`
3. ... (tương tự cho tất cả mappings)

### Cho class.jsx:
1. `style={styles\.page}` → `className="cm-page"`  
2. `style={styles\.header}` → `className="cm-header"`
3. ... (tương tự cho tất cả mappings)

## Kiểm tra sau khi refactor

1. ✅ Import CSS đã được thêm
2. ✅ Không còn `style={styles.*}` nào
3. ✅ Tất cả đều dùng `className`
4. ✅ Xóa các style objects
5. ✅ App vẫn chạy bình thường
6. ✅ UI trông giống hệt như trước

---
**Lưu ý:** Do file rất lớn, tôi khuyến nghị làm từng bước nhỏ và test sau mỗi thay đổi để đảm bảo không có lỗi.
