import React, { useState, useCallback } from 'react';
import api from '@config';
import './LoginAuditPage.css';

const LoginAuditPage = () => {
  const [role, setRole] = useState('');
  const [limit, setLimit] = useState(50);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

        <div className="login-audit-table-wrapper">
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
      </div>
    </div>
  );
};

export default LoginAuditPage;
