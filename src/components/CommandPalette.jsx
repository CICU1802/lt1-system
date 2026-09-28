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
  students = [],
  classes = [],
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
      badge: s.consecutiveAbsences >= 2 ? 'Vắng 2 buổi' : s.status === 'active' ? 'Đang học' : 'Đã nghỉ',
      badgeColor: s.consecutiveAbsences >= 2 ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-100 border-slate-200',
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
      badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
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
      badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      action: () => { onNavigateTab('attendance'); onClose(); }
    },
    {
      type: 'action',
      id: 'act-tuition',
      title: 'Học phí & Smart VietQR',
      subtitle: 'Xem danh sách công nợ quá hạn và nộp tiền',
      badge: 'Tài chính',
      badgeColor: 'text-blue-800 bg-blue-50 border-blue-200',
      action: () => { onNavigateTab('tuition'); onClose(); }
    },
    {
      type: 'action',
      id: 'act-add-student',
      title: 'Hồ sơ học viên (360°)',
      subtitle: 'Xem thông tin 360° từng học sinh',
      badge: 'Học sinh',
      badgeColor: 'text-purple-800 bg-purple-50 border-purple-200',
      action: () => { onNavigateTab('students'); onClose(); }
    }
  ].filter(a => !cleanQ || a.title.toLowerCase().includes(cleanQ) || a.badge.toLowerCase().includes(cleanQ));

  const allItems = [...matchingStudents, ...matchingClasses, ...quickActions];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % (allItems.length || 1));
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/20 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Tìm nhanh học sinh, lớp học, hoặc tác vụ... (Esc để đóng)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Không tìm thấy kết quả nào phù hợp với từ khóa "{query}".
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-xl transition flex items-center justify-between cursor-pointer ${
                    isSelected ? 'bg-amber-50/70 text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      item.type === 'student' ? 'bg-blue-50 text-blue-700' : item.type === 'class' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {item.type === 'student' ? <Users size={14} /> : item.type === 'class' ? <GraduationCap size={14} /> : <ArrowRight size={14} />}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-900 truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.subtitle}</div>
                    </div>
                  </div>

                  <ArrowRight size={14} className={`text-slate-400 shrink-0 transition ${isSelected ? 'translate-x-0.5 text-amber-600' : 'opacity-0'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>Dùng <kbd className="bg-white px-1 rounded border border-slate-200">↑</kbd> <kbd className="bg-white px-1 rounded border border-slate-200">↓</kbd> để chọn</span>
            <span><kbd className="bg-white px-1 rounded border border-slate-200">Enter</kbd> để mở</span>
          </div>
          <span>LT1 Quick Command</span>
        </div>
      </div>
    </div>
  );
}
