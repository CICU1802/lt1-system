import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  Award,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  X
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  students,
  classes,
  onSelectStudent,
  onNavigateTab
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  const matchingStudents = students
    .filter(s => s.name.toLowerCase().includes(cleanQ) || s.studentCode.toLowerCase().includes(cleanQ) || s.phone?.includes(cleanQ))
    .slice(0, 4)
    .map(s => ({
      type: 'student',
      id: s.id,
      title: s.name,
      subtitle: `${s.studentCode} • Phụ huynh: ${s.parentPhone || s.parentName}`,
      badge: s.consecutiveAbsences >= 2 ? '⚠️ Vắng 2 buổi' : s.status === 'active' ? 'Đang học' : 'Đã nghỉ',
      badgeColor: s.consecutiveAbsences >= 2 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-slate-400 bg-slate-800 border-slate-700',
      action: () => {
        onSelectStudent(s);
        onClose();
      }
    }));

  const matchingClasses = classes
    .filter(c => c.name.toLowerCase().includes(cleanQ) || c.code.toLowerCase().includes(cleanQ) || c.subject.toLowerCase().includes(cleanQ))
    .slice(0, 3)
    .map(c => ({
      type: 'class',
      id: c.id,
      title: `${c.code} — ${c.name}`,
      subtitle: `${c.scheduleTime} • Phòng ${c.room}`,
      badge: `${c.subject}`,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      action: () => {
        onNavigateTab('attendance');
        onClose();
      }
    }));

  const quickActions = [
    {
      type: 'action',
      id: 'act-attendance',
      title: 'Điểm danh ca học hôm nay',
      subtitle: 'Chốt sĩ số lớp đang diễn ra',
      badge: 'Điểm danh',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      action: () => { onNavigateTab('attendance'); onClose(); }
    },
    {
      type: 'action',
      id: 'act-tuition',
      title: 'Sổ thu học phí & Smart VietQR',
      subtitle: 'Xem danh sách công nợ quá hạn và nộp tiền',
      badge: 'Tài chính',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      action: () => { onNavigateTab('tuition'); onClose(); }
    },
    {
      type: 'action',
      id: 'act-add-student',
      title: 'Hồ sơ học viên (Master-Detail)',
      subtitle: 'Xem thông tin 360° từng học sinh',
      badge: 'Học sinh',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      action: () => { onNavigateTab('students'); onClose(); }
    }
  ].filter(a => !cleanQ || a.title.toLowerCase().includes(cleanQ) || a.badge.toLowerCase().includes(cleanQ));

  const allItems = [...matchingStudents, ...matchingClasses, ...quickActions];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-[#0D1527] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-[#0B1120]/80">
          <Search size={18} className="text-amber-400 shrink-0" />
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none font-medium"
            placeholder="Tìm theo tên học sinh, mã HS (HS24-...), lớp học hoặc hành động..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Không tìm thấy kết quả phù hợp cho "{query}"
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
                      : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      item.type === 'student' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      item.type === 'class' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {item.type === 'student' ? <Users size={14} /> :
                       item.type === 'class' ? <GraduationCap size={14} /> :
                       <ArrowRight size={14} />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd> để di chuyển</span>
            <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">↵</kbd> để chọn</span>
          </div>
          <span className="font-mono text-slate-500">Linear Command Palette (⌘K)</span>
        </div>
      </div>
    </div>
  );
}
