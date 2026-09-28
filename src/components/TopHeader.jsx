import React, { useState } from 'react';
import { Search, Bell, Shield, User, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';

export default function TopHeader({
  searchQuery,
  setSearchQuery,
  userRole,
  setUserRole,
  alertCount,
  overdueCount,
  onOpenAlerts,
  onSelectStudentQuick
}) {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  const roleLabels = {
    admin: 'Quản Trị Viên (Full Access)',
    staff: 'Nhân Viên Trung Tâm',
    teacher: 'Giáo Viên Phụ Trách',
    assistant: 'Trợ Giảng (TA)',
    parent: 'Học Sinh / Phụ Huynh',
  };

  return (
    <header className="top-header">
      {/* Quick Search Bar */}
      <div className="header-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Tìm mã học sinh (HS24-...), tên, số điện thoại..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="search-shortcut">⌘K</span>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Role Switcher */}
        <div className="role-badge-picker">
          <Shield size={14} color="var(--brand-blue)" />
          <span className="role-label">Vai trò:</span>
          <select
            className="role-select"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
          >
            <option value="admin">Quản Trị Viên (Admin)</option>
            <option value="staff">Nhân Viên (Staff)</option>
            <option value="teacher">Giáo Viên (Teacher)</option>
            <option value="assistant">Trợ Giảng (TA)</option>
            <option value="parent">Phụ Huynh / Học Sinh</option>
          </select>
        </div>

        {/* Notifications Icon with Alert Counter */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            style={{ position: 'relative' }}
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            title="Thông báo cảnh báo"
          >
            <Bell size={18} />
            {(alertCount > 0 || overdueCount > 0) && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'var(--color-danger)',
                  borderRadius: '50%',
                  border: '2px solid #ffffff'
                }}
              />
            )}
          </button>

          {showNotificationMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '45px',
                width: '320px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                padding: '16px',
                zIndex: 50
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--brand-navy)',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>Cảnh Báo Vận Hành</span>
                <span className="badge badge-danger">{(alertCount + overdueCount)} việc cần xử lý</span>
              </div>

              {alertCount > 0 && (
                <div
                  style={{
                    backgroundColor: 'var(--color-danger-bg)',
                    border: '1px solid var(--color-danger-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    marginBottom: '10px',
                    display: 'flex',
                    gap: '10px'
                  }}
                >
                  <AlertTriangle size={18} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b' }}>
                      Cảnh báo: {alertCount} học sinh nghỉ 2 buổi liên tiếp
                    </div>
                    <div style={{ fontSize: '12px', color: '#b91c1c' }}>
                      Cần quản trị viên và nhân viên liên hệ phụ huynh xác nhận.
                    </div>
                  </div>
                </div>
              )}

              {overdueCount > 0 && (
                <div
                  style={{
                    backgroundColor: 'var(--color-warning-bg)',
                    border: '1px solid var(--color-warning-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    marginBottom: '10px',
                    display: 'flex',
                    gap: '10px'
                  }}
                >
                  <AlertTriangle size={18} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400e' }}>
                      {overdueCount} hóa đơn học phí quá hạn
                    </div>
                    <div style={{ fontSize: '12px', color: '#b45309' }}>
                      Đưa vào danh sách cần gửi tin nhắn nhắc học phí.
                    </div>
                  </div>
                </div>
              )}

              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginTop: '6px' }}
                onClick={() => {
                  setShowNotificationMenu(false);
                  if (onOpenAlerts) onOpenAlerts();
                }}
              >
                Đến Trung Tâm Cảnh Báo
              </button>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-blue) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            AD
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-navy)', lineHeight: 1.2 }}>Ban Quản Trị LT1</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{roleLabels[userRole]}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
