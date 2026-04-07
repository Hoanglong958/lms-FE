import React, { useState, useCallback, useRef, useEffect } from 'react';
import api from '@config';
import './LoginAuditPage.css';

const LoginAuditPage = () => {
  const [role, setRole] = useState('');
  const [limit, setLimit] = useState(50);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canScroll, setCanScroll] = useState(false);
  
  const tableWrapperRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (role) params.append('role', role);
      
      const response = await api.get(`/admin/login-audits?${params.toString()}`);
      setLogs(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải nhật ký');
    } finally {
      setLoading(false);
    }
  }, [role, limit]);

  const getRoleBadgeClass = (role) => {
    return role === 'ROLE_TEACHER' ? 'badge-role-teacher' : 'badge-role-user';
  };

  // Check if scrolling is possible
  const checkScrollability = useCallback(() => {
    if (tableWrapperRef.current) {
      const isScrollable = 
        tableWrapperRef.current.scrollWidth > tableWrapperRef.current.clientWidth;
      setCanScroll(isScrollable);
    }
  }, []);

  // Run check on component mount and when logs change
  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [checkScrollability, logs]);

  // Mouse down - start drag
  const handleMouseDown = (e) => {
    if (!tableWrapperRef.current || !canScroll) return;
    
    isDraggingRef.current = true;
    startXRef.current = e.pageX - tableWrapperRef.current.offsetLeft;
    scrollLeftRef.current = tableWrapperRef.current.scrollLeft;
    tableWrapperRef.current.classList.add('dragging');
    tableWrapperRef.current.style.cursor = 'grabbing';
  };

  // Mouse move - drag scroll
  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !tableWrapperRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - tableWrapperRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // Multiply by 1.5 for faster scroll
    tableWrapperRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  // Mouse up - end drag
  const handleMouseUp = () => {
    if (!tableWrapperRef.current) return;
    
    isDraggingRef.current = false;
    tableWrapperRef.current.classList.remove('dragging');
    tableWrapperRef.current.style.cursor = 'grab';
  };

  // Mouse leave - end drag if needed
  const handleMouseLeave = () => {
    if (!tableWrapperRef.current) return;
    
    isDraggingRef.current = false;
    tableWrapperRef.current.classList.remove('dragging');
    tableWrapperRef.current.style.cursor = 'grab';
  };

  // Touch support for mobile
  const handleTouchStart = (e) => {
    if (!tableWrapperRef.current || !canScroll) return;
    
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].pageX - tableWrapperRef.current.offsetLeft;
    scrollLeftRef.current = tableWrapperRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !tableWrapperRef.current) return;
    
    const x = e.touches[0].pageX - tableWrapperRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    tableWrapperRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="login-audit-container">
      <div className="login-audit-panel">
        <h1 className="login-audit-title">Nhật ký đăng nhập</h1>
        <p className="login-audit-subtitle">
          Chỉ dành cho ADMIN – xem IP, OS, mã thiết bị của sinh viên & giảng viên.
        </p>

        <div className="login-audit-controls">
          <div className="login-audit-field">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Sinh viên + Giảng viên</option>
              <option value="ROLE_USER">Chỉ sinh viên</option>
              <option value="ROLE_TEACHER">Chỉ giảng viên</option>
            </select>
          </div>

          <div className="login-audit-field">
            <label>Số bản ghi</label>
            <input
              type="number"
              min="1"
              max="100"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </div>

          <div className="login-audit-button-wrapper">
            <button
              className="login-audit-button"
              onClick={fetchLogs}
              disabled={loading}
            >
              {loading ? 'Đang tải...' : 'Tải nhật ký'}
            </button>
          </div>
        </div>

        {error && <div className="login-audit-error">{error}</div>}

        <div
          ref={tableWrapperRef}
          className={`login-audit-table-wrapper ${canScroll ? 'can-scroll' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <table className="login-audit-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>User</th>
                <th>Role</th>
                <th>IP</th>
                <th>OS</th>
                <th>Mã thiết bị</th>
                <th>User-Agent</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="login-audit-empty">
                    Chưa có dữ liệu. Nhấn "Tải nhật ký" để xem.
                  </td>
                </tr>
              ) : (
                logs.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.loginAt).toLocaleString('vi-VN')}</td>
                    <td>
                      {item.fullName || ''} ({item.gmail || ''})
                    </td>
                    <td>
                      <span className={`login-audit-badge ${getRoleBadgeClass(item.role)}`}>
                        {item.role}
                      </span>
                    </td>
                    <td>{item.ipAddress || '-'}</td>
                    <td>{item.osName || '-'}</td>
                    <td>{item.deviceId || '-'}</td>
                    <td className="login-audit-ua">{item.userAgent || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {canScroll && (
          <div className="scroll-hint">
            💡 Kéo hoặc sử dụng thanh cuộn để xem thêm các cột
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginAuditPage;