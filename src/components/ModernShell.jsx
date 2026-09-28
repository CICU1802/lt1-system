import React from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, CalendarDays, 
  ClipboardCheck, CreditCard, Award, UserCheck, 
  BarChart3, Search, Bell, Sparkles, 
  ChevronRight, ArrowUpRight, CheckCircle2, Clock, AlertCircle,
  UserCircle, Shield
} from 'lucide-react';

export default function ModernShell({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  alertCount,
  overdueCount,
  onOpenCommandPalette,
  children
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan điều hành', icon: LayoutDashboard, roles: ['admin', 'staff', 'teacher', 'assistant'] },
    { id: 'attendance', label: 'Điểm danh ca dạy', icon: ClipboardCheck, badge: 'Đang diễn ra', roles: ['admin', 'staff', 'teacher', 'assistant'] },
    { id: 'classes', label: 'Quản lý khối - lớp', icon: GraduationCap, roles: ['admin', 'staff'] },
    { id: 'students', label: 'Hồ sơ học viên (360°)', icon: Users, roles: ['admin', 'staff'] },
    { id: 'schedule', label: 'Thời khóa biểu tuần', icon: CalendarDays, roles: ['admin', 'staff', 'teacher', 'assistant', 'parent'] },
    { id: 'tuition', label: 'Học phí & Smart VietQR', icon: CreditCard, alert: overdueCount > 0 ? overdueCount : null, roles: ['admin', 'staff'] },
    { id: 'gradebook', label: 'Sổ điểm & khảo sát', icon: Award, roles: ['admin', 'staff', 'teacher', 'assistant'] },
    { id: 'makeup', label: 'Điều phối học bù', icon: UserCheck, roles: ['admin', 'staff', 'teacher'] },
    { id: 'staff', label: 'Giáo viên & trợ giảng', icon: Users, roles: ['admin', 'staff'] },
    { id: 'parent-portal', label: 'Sổ liên lạc Cổng PH', icon: UserCircle, roles: ['parent', 'admin', 'staff'] },
    { id: 'reports', label: 'Báo cáo doanh thu & KPIs', icon: BarChart3, roles: ['admin', 'staff'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  const roleLabels = {
    admin: 'Thầy Thành (Quản trị)',
    staff: 'Nhân viên LT1 (Học vụ)',
    teacher: 'Thầy Minh (Giáo viên)',
    assistant: 'Đức (Trợ giảng)',
    parent: 'Phụ huynh / Học sinh',
  };

  const currentTabObj = menuItems.find(i => i.id === currentTab);

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans antialiased overflow-hidden">
      {/* 1. SIDEBAR PHONG CÁCH CLEAN CRAFT LIGHT */}
      <aside className="w-64 border-r border-slate-200/80 bg-white flex flex-col justify-between shrink-0 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        <div className="overflow-y-auto">
          {/* Brand header with Official LT1 Education Logo */}
          <div className="h-20 px-4 flex items-center gap-3 border-b border-slate-100 bg-white">
            <img
              src="/logo-transparent.png"
              alt="LT1 Education Logo"
              className="h-11 w-auto max-w-[50px] object-contain shrink-0 drop-shadow-xs"
            />
            <div className="min-w-0">
              <div className="font-extrabold text-[13px] tracking-tight text-[#182C5A] uppercase truncate leading-tight flex items-center gap-1.5">
                <span>LT1 EDUCATION</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200/60">PRO</span>
              </div>
              <div className="text-[9px] font-bold text-[#3B5998] tracking-widest uppercase mt-0.5 truncate">
                Learn To Be The Best
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">Trung tâm luyện thi & dạy thêm</div>
            </div>
          </div>

          {/* Quick command search bar (⌘K trigger) */}
          <div className="p-3">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-lg transition group"
            >
              <span className="flex items-center gap-2">
                <Search size={14} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
                <span>Tìm nhanh học sinh, lớp...</span>
              </span>
              <kbd className="text-[10px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 font-mono shadow-2xs">⌘K</kbd>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="px-2.5 space-y-0.5 mt-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-amber-50 text-amber-900 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-amber-600' : 'text-slate-400'} />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                      {item.badge}
                    </span>
                  )}
                  {item.alert && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold">
                      {item.alert}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Role Switcher */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 px-0.5">
              <span>Vai trò truy cập:</span>
              <span className="font-semibold text-slate-700">{userRole.toUpperCase()}</span>
            </div>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              <option value="admin">Thầy Thành (Quản trị)</option>
              <option value="staff">Nhân viên LT1 (Học vụ)</option>
              <option value="teacher">Thầy Minh (Giáo viên)</option>
              <option value="assistant">Đức (Trợ giảng)</option>
              <option value="parent">Phụ huynh / Học sinh</option>
            </select>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200/80 bg-white px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <img src="/logo-transparent.png" alt="LT1 Education" className="h-6 w-auto object-contain shrink-0" />
              <span className="font-bold text-[#182C5A] tracking-tight">LT1 EDUCATION</span>
              <span className="text-[10px] font-semibold text-[#3B5998] px-2 py-0.5 rounded bg-blue-50/80 border border-blue-100 tracking-wide uppercase hidden sm:inline">
                Learn To Be The Best
              </span>
            </div>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800">{currentTabObj?.label || 'Bảng điều khiển'}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ca kế tiếp: 17:30 (Toán 10A)</span>
            </div>

            {/* Notification Alert Bell */}
            <button
              onClick={() => setCurrentTab('attendance')}
              className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Xem thông báo chuyên cần"
            >
              <Bell size={16} />
              {(alertCount > 0 || overdueCount > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>

            {/* User Info Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                {roleLabels[userRole]?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-700 hidden md:inline">
                {roleLabels[userRole]}
              </span>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
