#!/usr/bin/env python3
"""
Script tự động refactor user.jsx và class.jsx
Chuyển đổi inline styles thành CSS classNames
"""

import re
import sys

# Mapping cho user.jsx
USER_MAPPINGS = [
    (r'style={styles\.page}', 'className="um-page"'),
    (r'style={styles\.header}', 'className="um-header"'),
    (r'style={styles\.title}', 'className="um-title"'),
    (r'style={styles\.subtitle}', 'className="um-subtitle"'),
    (r'style={styles\.primaryButton}', 'className="um-primary-button"'),
    (r'style={styles\.secondaryButton}', 'className="um-secondary-button"'),
    (r'style={styles\.lockButton}', 'className="um-lock-button"'),
    (r'style={styles\.plusIcon}', 'className="um-plus-icon"'),
    (r'style={styles\.toolbar}', 'className="um-toolbar _um-toolbar"'),
    (r'style={styles\.searchWrap}', 'className="um-search-wrap _um-search"'),
    (r'style={styles\.searchIcon}', 'className="um-search-icon"'),
    (r'style={styles\.searchInput}', 'className="um-search-input"'),
    (r'style={styles\.filterWrap}', 'className="um-filter-wrap"'),
    (r'style={styles\.select}', 'className="um-select"'),
    (r'style={styles\.selectChevron}', 'className="um-select-chevron"'),
    (r'style={styles\.card}', 'className="um-card"'),
    (r'style={styles\.table}', 'className="um-table"'),
    (r'style={styles\.th}', 'className="um-th"'),
    (r'style={styles\.tr}', 'className="um-tr"'),
    (r'style={styles\.td}', 'className="um-td"'),
    (r'style={styles\.tdCenter}', 'className="um-td-center"'),
    (r'style={styles\.tdAction}', 'className="um-td-action"'),
    (r'style={styles\.nameCell}', 'className="um-name-cell"'),
    (r'style={styles\.avatar}', 'className="um-avatar"'),
    (r'style={styles\.nameText}', 'className="um-name-text"'),
    (r'style={styles\.emailText}', 'className="um-email-text"'),
    (r'style={styles\.actionWrap}', 'className="um-action-wrap"'),
    (r'style={styles\.iconButton}', 'className="um-icon-button"'),
    (r'style={styles\.menu}', 'className="um-menu"'),
    (r'style={styles\.menuItem}', 'className="um-menu-item"'),
    (r'style={styles\.menuItemDivider}', 'className="um-menu-item-divider"'),
    (r'style={styles\.menuBtn}', 'className="um-menu-btn"'),
    (r'style={styles\.menuBtnDanger}', 'className="um-menu-btn-danger"'),
    (r'style={styles\.emptyCell}', 'className="um-empty-cell"'),
    (r'style={modalStyles\.backdrop}', 'className="um-modal-backdrop"'),
    (r'style={modalStyles\.container}', 'className="um-modal-container"'),
    (r'style={modalStyles\.header}', 'className="um-modal-header"'),
    (r'style={modalStyles\.title}', 'className="um-modal-title"'),
    (r'style={modalStyles\.body}', 'className="um-modal-body"'),
    (r'style={modalStyles\.label}', 'className="um-modal-label"'),
    (r'style={modalStyles\.input}', 'className="um-modal-input"'),
    (r'style={modalStyles\.error}', 'className="um-modal-error"'),
    (r'style={modalStyles\.footer}', 'className="um-modal-footer"'),
    (r'style={modalStyles\.ghostBtn}', 'className="um-modal-ghost-btn"'),
    (r'style={modalStyles\.dangerBtn}', 'className="um-modal-danger-btn"'),
    (r'style={modalStyles\.primaryBtn}', 'className="um-modal-primary-btn"'),
    # Badges
    (r'style={{ \.\.\.badgeStyles\.base, \.\.\.badgeStyles\.roleAdmin }}', 'className="um-badge-base um-badge-role-admin"'),
    (r'style={{ \.\.\.badgeStyles\.base, \.\.\.badgeStyles\.roleUser }}', 'className="um-badge-base um-badge-role-user"'),
    (r'style={{ \.\.\.badgeStyles\.base, \.\.\.badgeStyles\.statusActive }}', 'className="um-badge-base um-badge-status-active"'),
    (r'style={{ \.\.\.badgeStyles\.base, \.\.\.badgeStyles\.statusPaused }}', 'className="um-badge-base um-badge-status-paused"'),
    # Special cases
    (r'style={{ \.\.\.styles\.select, width: "100%" }}', 'className="um-select" style={{ width: "100%" }}'),
    (r'style={{ \.\.\.styles\.primaryButton, background: "#b91c1c" }}', 'className="um-primary-button" style={{ background: "#b91c1c" }}'),
]

# Mapping cho class.jsx  
CLASS_MAPPINGS = [
    (r'style={styles\.page}', 'className="cm-page"'),
    (r'style={styles\.header}', 'className="cm-header"'),
    (r'style={styles\.title}', 'className="cm-title"'),
    (r'style={styles\.subtitle}', 'className="cm-subtitle"'),
    (r'style={styles\.primaryButton}', 'className="cm-primary-button"'),
    (r'style={styles\.plusIcon}', 'className="cm-plus-icon"'),
    (r'style={styles\.kpis}', 'className="cm-kpis"'),
    (r'style={styles\.statCard}', 'className="cm-stat-card"'),
    (r'style={styles\.statIcon}', 'className="cm-stat-icon"'),
    (r'style={styles\.statLabel}', 'className="cm-stat-label"'),
    (r'style={styles\.statValue}', 'className="cm-stat-value"'),
    (r'style={styles\.toolbar}', 'className="cm-toolbar _cm-toolbar"'),
    (r'style={styles\.searchWrap}', 'className="cm-search-wrap _cm-search"'),
    (r'style={styles\.searchIcon}', 'className="cm-search-icon"'),
    (r'style={styles\.searchInput}', 'className="cm-search-input"'),
    (r'style={styles\.filterWrap}', 'className="cm-filter-wrap"'),
    (r'style={styles\.select}', 'className="cm-select"'),
    (r'style={styles\.selectChevron}', 'className="cm-select-chevron"'),
    (r'style={styles\.card}', 'className="cm-card"'),
    (r'style={styles\.table}', 'className="cm-table"'),
    (r'style={styles\.th}', 'className="cm-th"'),
    (r'style={styles\.tr}', 'className="cm-tr"'),
    (r'style={styles\.td}', 'className="cm-td"'),
    (r'style={styles\.className}', 'className="cm-class-name"'),
    (r'style={styles\.classSubtitle}', 'className="cm-class-subtitle"'),
    (r'style={styles\.badgeCode}', 'className="cm-badge-code"'),
    (r'style={styles\.activeWrap}', 'className="cm-active-wrap"'),
    (r'style={styles\.progressOuter}', 'className="cm-progress-outer"'),
    (r'style={styles\.progressInner}', 'className="cm-progress-inner"'),
    (r'style={styles\.emptyCell}', 'className="cm-empty-cell"'),
    (r'style={styles\.actionWrap}', 'className="cm-action-wrap"'),
    (r'style={styles\.iconButton}', 'className="cm-icon-button"'),
    (r'style={styles\.menu}', 'className="cm-menu"'),
    (r'style={styles\.menuItem}', 'className="cm-menu-item"'),
    (r'style={styles\.menuBtn}', 'className="cm-menu-btn"'),
    (r'style={styles\.menuBtnDanger}', 'className="cm-menu-btn-danger"'),
    (r'style={modalStyles\.backdrop}', 'className="cm-modal-backdrop"'),
    (r'style={modalStyles\.container}', 'className="cm-modal-container"'),
    (r'style={modalStyles\.header}', 'className="cm-modal-header"'),
    (r'style={modalStyles\.title}', 'className="cm-modal-title"'),
    (r'style={modalStyles\.body}', 'className="cm-modal-body"'),
    (r'style={modalStyles\.label}', 'className="cm-modal-label"'),
    (r'style={modalStyles\.input}', 'className="cm-modal-input"'),
    (r'style={modalStyles\.error}', 'className="cm-modal-error"'),
    (r'style={modalStyles\.footer}', 'className="cm-modal-footer"'),
    (r'style={modalStyles\.ghostBtn}', 'className="cm-modal-ghost-btn"'),
    # Badges
    (r'style={{ \.\.\.badgeStyles\.base, \.\.\.style }}', 'className="cm-badge-base"'),
    # Special cases - giữ inline styles động
    (r'style={{ \.\.\.styles\.progressInner, width: `\$\{clamped\}%` }}', 'className="cm-progress-inner" style={{width: `${clamped}%`}}'),
    (r'style={{ \.\.\.styles\.th, width: (\d+) }}', r'className="cm-th" style={{ width: \1 }}'),
    (r'style={{ display: "grid", rowGap: 4 }}', 'style={{ display: "grid", rowGap: 4 }}'),  # Giữ nguyên
    (r'style={{ overflowX: "auto" }}', 'style={{ overflowX: "auto" }}'),  # Giữ nguyên
]


def refactor_file(input_file, output_file, mappings, css_import):
    """Refactor một file JSX"""
    print(f"📝 Đang refactor {input_file}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Thêm CSS import sau dòng import cuối cùng
    import_pattern = r'(import.*?from.*?;)\n(export|function|const)'
    content = re.sub(import_pattern, f'\\1\n{css_import}\n\n\\2', content, count=1)
    
    # Áp dụng các mappings
    for pattern, replacement in mappings:
        content = re.sub(pattern, replacement, content)
    
    # Xóa style objects (tìm và xóa toàn bộ const styles, badgeStyles, modalStyles)
    # This is tricky, so we'll just comment them out for now
    content = re.sub(r'^(const styles = {)', r'// \1', content, flags=re.MULTILINE)
    content = re.sub(r'^(const badgeStyles = {)', r'// \1', content, flags=re.MULTILINE)
    content = re.sub(r'^(const modalStyles = {)', r'// \1', content, flags=re.MULTILINE)
    
    # Xóa PageStyles hoặc LocalStyles component
    content = re.sub(r'function (PageStyles|LocalStyles)\(\).*?}\s*', '', content, flags=re.DOTALL)
    content = re.sub(r'<(PageStyles|LocalStyles) />', '', content)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Đã tạo {output_file}")


def main():
    # Refactor user.jsx
    refactor_file(
        'src/features/Admin/UserManagement/user.jsx',
        'src/features/Admin/UserManagement/user_refactored.jsx',
        USER_MAPPINGS,
        'import "./user.css";'
    )
    
    # Refactor class.jsx
    refactor_file(
        'src/features/Admin/ClassManagement/class.jsx',
        'src/features/Admin/ClassManagement/class_refactored.jsx',
        CLASS_MAPPINGS,
        'import "./class.css";'
    )
    
    print("\n✨ Hoàn tất! Kiểm tra các file *_refactored.jsx")
    print("📋 Sau khi kiểm tra, rename file:")
    print("   - user_refactored.jsx → user.jsx")
    print("   - class_refactored.jsx → class.jsx")


if __name__ == '__main__':
    main()
