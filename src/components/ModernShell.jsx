import React from 'react';
import { 
  LayoutDashboard, Users, GraduationCap, CalendarDays, 
  ClipboardCheck, CreditCard, Award, UserCheck, 
  BarChart3, ShieldAlert, Search, Bell, Sparkles, 
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
    { id: 'gradebook', label: 'Sổ điểm & Khảo sát', icon: Award, roles: ['admin', 'staff', 'teacher', 'assistant'] },
    { id: 'makeup', label: 'Điều phối học bù', icon: UserCheck, roles: ['admin', 'staff', 'teacher'] },
    { id: 'staff', label: 'Giáo viên & Trợ giảng', icon: Users, roles: ['admin', 'staff'] },
    { id: 'parent-portal', label: 'Sổ Liên Lạc (Cổng PH)', icon: UserCircle, roles: ['parent', 'admin', 'staff'] },
    { id: 'reports', label: 'Báo cáo doanh thu & KPIs', icon: BarChart3, roles: ['admin', 'staff'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  const roleLabels = {
    admin: 'Thầy Thành (Admin)',
    staff: 'Nhân viên LT1 (Staff)',
    teacher: 'Thầy Minh (Giáo viên)',
    assistant: 'Đức (Trợ giảng)',
    parent: 'Phụ huynh / Học sinh',
  };

  return (
    <div className="flex h-screen w-full bg-[#0F172A] text-slate-100 font-sans antialiased overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. SIDEBAR PHONG CÁCH LINEAR / CRAFT UI */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0B1120] flex flex-col justify-between shrink-0">
        <div className="overflow-y-auto">
          {/* Brand header */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-amber-500/20 tracking-wider">
              LT1
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                TRUNG TÂM LT1
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-semibold border border-amber-500/20">PRO</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">Hệ thống Điều hành 2026</div>
            </div>
          </div>

          {/* Quick command search bar (⌘K trigger) */}
          <div className="p-3">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-400 bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 rounded-lg transition shadow-inner group"
            >
              <span className="flex items-center gap-2">
                <Search size={14} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                <span>Tìm nhanh học sinh, lớp...</span>
              </span>
              <kbd className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">⌘K</kbd>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="px-2 space-y-1 mt-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      {item.badge}
                    </span>
                  )}
                  {item.alert && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
                      {item.alert} nợ
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile footer & Role Switcher */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-400">
                {userRole === 'admin' ? 'AD' : userRole === 'teacher' ? 'GV' : userRole === 'assistant' ? 'TA' : 'PH'}
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-slate-200">{roleLabels[userRole]}</div>
                <div className="text-[10px] text-slate-400">admin@lt1.edu.vn</div>
              </div>
            </div>
            <select
              value={userRole}
              onChange={e => setUserRole(e.target.value)}
              className="bg-slate-800 text-[11px] text-amber-400 font-semibold border border-slate-700 rounded px-1.5 py-0.5 outline-none cursor-pointer"
            >
              <option value="admin">Admin</option>
              <option value="staff">Nhân viên</option>
              <option value="teacher">Giáo viên</option>
              <option value="assistant">Trợ giảng</option>
              <option value="parent">Phụ huynh</option>
            </select>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0F1D] overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 bg-[#0B1120]/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              {menuItems.find(m => m.id === currentTab)?.label || 'Bảng điều khiển'}
            </h1>
            <span className="h-4 w-px bg-slate-800"></span>
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock size={13} className="text-amber-400" /> Học kỳ I • Khóa Luyện thi 2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Hệ thống VietQR: Sẵn sàng</span>
            </div>

            {alertCount > 0 && (
              <button
                onClick={() => setCurrentTab('attendance')}
                className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-500/20 transition"
              >
                <AlertCircle size={13} />
                <span>{alertCount} vắng 2 buổi</span>
              </button>
            )}

            <button
              onClick={onOpenCommandPalette}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition"
              title="Mở Command Palette (Ctrl+K)"
            >
              <kbd className="text-[10px] font-mono text-slate-400">⌘K</kbd>
            </button>
          </div>
        </header>

        {/* Dynamic content view */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
