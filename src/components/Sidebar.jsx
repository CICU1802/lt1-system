import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  CheckSquare,
  Repeat,
  UserCheck,
  CreditCard,
  Award,
  BarChart3,
  ShieldAlert,
  UserCircle
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, alertCount, overdueCount, userRole }) {
  const navItems = [
    { id: 'dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard, roles: ['admin', 'staff', 'teacher', 'assistant'] },
    { id: 'students', label: 'Quản Lý Học Sinh', icon: Users, roles: ['admin', 'staff'] },
    { id: 'classes', label: 'Quản Lý Khối - Lớp', icon: GraduationCap, roles: ['admin', 'staff'] },
    { id: 'schedule', label: 'Thời Khóa Biểu', icon: CalendarDays, roles: ['admin', 'staff', 'teacher', 'assistant', 'parent'] },
    {
      id: 'attendance',
      label: 'Điểm Danh & Báo Vắng',
      icon: CheckSquare,
      badge: alertCount > 0 ? alertCount : null,
      roles: ['admin', 'staff', 'teacher', 'assistant']
    },
    { id: 'makeup', label: 'Quản Lý Học Bù', icon: Repeat, roles: ['admin', 'staff', 'teacher'] },
    { id: 'staff', label: 'Giáo Viên & Trợ Giảng', icon: UserCheck, roles: ['admin', 'staff'] },
    {
      id: 'tuition',
      label: 'Học Phí & QR Pay',
      icon: CreditCard,
      badge: overdueCount > 0 ? overdueCount : null,
      roles: ['admin', 'staff']
    },
    { id: 'gradebook', label: 'Sổ Điểm & Đánh Giá', icon: Award, roles: ['admin', 'staff', 'teacher', 'assistant'] },
    { id: 'parent-portal', label: 'Tra Cứu Học Sinh / PH', icon: UserCircle, roles: ['parent', 'admin', 'staff'] },
    { id: 'reports', label: 'Báo Cáo & Thống Kê', icon: BarChart3, roles: ['admin', 'staff'] },
  ];

  // Filter items based on current role
  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="LT1 Education" className="sidebar-logo" />
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">LT1 EDUCATION</span>
          <span className="sidebar-brand-subtitle">LEARN TO BE THE BEST</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-section-title">Hệ Thống Nghiệp Vụ</div>
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="nav-item-badge" title="Cần xử lý khẩn">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--brand-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px',
              color: '#ffffff'
            }}
          >
            LT1
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>Cơ sở Trung Tâm LT1</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Học kỳ I - Năm 2026-2027</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
