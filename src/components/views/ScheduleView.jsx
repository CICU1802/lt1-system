import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function ScheduleView({ classes = [], teachers = [], grades = [], onOpenStudentProfile }) {
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all'); // 'all' | 'morning' | 'afternoon'

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  const filteredClasses = classes.filter(c => {
    if (c.isArchived) return false;
    if (selectedGrade !== 'all' && c.gradeId !== selectedGrade) return false;
    if (selectedSession !== 'all' && c.sessionType !== selectedSession) return false;
    return true;
  });

  const getSubjectBadge = (subject) => {
    if (subject?.includes('Toán')) return 'border-l-amber-500 bg-amber-50/50';
    if (subject?.includes('Lý')) return 'border-l-blue-500 bg-blue-50/50';
    if (subject?.includes('Hóa')) return 'border-l-purple-500 bg-purple-50/50';
    return 'border-l-emerald-500 bg-emerald-50/50';
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap shadow-xs">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Thời khóa biểu & lịch giảng dạy tuần
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân bổ phòng học, ca học sáng/chiều, giáo viên phụ trách và trợ giảng theo từng ngày
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
            Tuần 4 • Học kỳ I
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap text-xs shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-medium">Khối học:</span>
          <button
            onClick={() => setSelectedGrade('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              selectedGrade === 'all' ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả
          </button>
          {grades.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGrade(g.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedGrade === g.id ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-medium">Buổi học:</span>
          <button
            onClick={() => setSelectedSession('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              selectedSession === 'all' ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Cả ngày
          </button>
          <button
            onClick={() => setSelectedSession('morning')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              selectedSession === 'morning' ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ca Sáng
          </button>
          <button
            onClick={() => setSelectedSession('afternoon')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              selectedSession === 'afternoon' ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ca Chiều / Tối
          </button>
        </div>
      </div>

      {/* Weekly Grid (Notion / Google Calendar style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {daysOfWeek.map((day, idx) => {
          const dayClasses = filteredClasses.filter(c => c.scheduleDays?.includes(day));
          const isToday = day === 'Thứ 2';

          return (
            <div
              key={day}
              className={`rounded-2xl border bg-white flex flex-col min-h-[340px] shadow-xs overflow-hidden ${
                isToday ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200/80'
              }`}
            >
              {/* Day Header */}
              <div className={`p-3 border-b text-center ${
                isToday ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className={`text-xs font-semibold ${isToday ? 'text-amber-900' : 'text-slate-800'}`}>
                  {day}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {dayClasses.length} ca dạy
                </div>
              </div>

              {/* Day Events */}
              <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                {dayClasses.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-3 text-center text-[11px] text-slate-400">
                    Nghỉ ca
                  </div>
                ) : (
                  dayClasses.map(cls => {
                    const teacher = teachers.find(t => t.id === cls.teacherId);
                    const subjectStyle = getSubjectBadge(cls.subject);

                    return (
                      <div
                        key={cls.id}
                        className={`p-2.5 rounded-xl border border-slate-200/70 border-l-3 transition hover:shadow-sm ${subjectStyle}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] font-semibold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200/60">
                            {cls.code}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {cls.room}
                          </span>
                        </div>

                        <div className="font-semibold text-xs text-slate-900 leading-snug truncate">
                          {cls.name}
                        </div>

                        <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1 font-medium">
                          <Clock size={11} className="text-slate-400 shrink-0" />
                          <span>{cls.scheduleTime}</span>
                        </div>

                        <div className="text-[10px] text-slate-500 mt-1 truncate">
                          GV: {teacher?.name || 'ThS. Nguyễn Văn Thành'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
