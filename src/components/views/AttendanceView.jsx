import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
  Save,
  Check,
  FileText,
  UserCheck,
  Calendar,
  Send,
  CheckCircle2,
  Zap,
  Keyboard
} from 'lucide-react';

export default function AttendanceView({
  classes = [],
  students = [],
  attendance = [],
  userRole = 'admin',
  onSaveAttendance,
  onToggleLockAttendance,
  onOpenStudentProfile
}) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState('2026-09-28');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  
  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(
    s => s.status === 'active' && s.classIds?.includes(selectedClassId)
  );

  // Find current attendance record or create draft
  const currentRecord = attendance.find(
    a => a.classId === selectedClassId && a.date === selectedDate
  ) || {
    id: `att-${selectedDate}-${selectedClassId}`,
    classId: selectedClassId,
    date: selectedDate,
    sessionName: `Buổi học ngày ${selectedDate}`,
    isLocked: false,
    teacherAttendance: { teacherId: selectedClass?.teacherId || '', present: true },
    assistantAttendance: { assistantId: selectedClass?.assistantId || '', present: true },
    progressNote: {
      topicsTaught: '',
      progressStatus: '',
      supplementalNotes: '',
      homework: '',
      generalFeedback: '',
    },
    entries: []
  };

  // Local editing state: default all students to 'present'
  const [entries, setEntries] = useState(() => {
    return classStudents.map(st => {
      const existing = currentRecord.entries?.find(e => e.studentId === st.id);
      return {
        studentId: st.id,
        status: existing?.status || 'present', // 'present' | 'absent_excused' | 'absent_unexcused'
        note: existing?.note || ''
      };
    });
  });

  const [teacherPresent, setTeacherPresent] = useState(
    currentRecord.teacherAttendance?.present ?? true
  );
  const [assistantPresent, setAssistantPresent] = useState(
    currentRecord.assistantAttendance?.present ?? true
  );

  const [progressNote, setProgressNote] = useState({
    topicsTaught: currentRecord.progressNote?.topicsTaught || 'Hàm số bậc nhất và ứng dụng thực tế',
    progressStatus: currentRecord.progressNote?.progressStatus || 'Đúng tiến độ giáo trình tuần 4',
    supplementalNotes: currentRecord.progressNote?.supplementalNotes || '',
    homework: currentRecord.progressNote?.homework || 'Bài tập 15 đến 24 SGK Nâng Cao',
    generalFeedback: currentRecord.progressNote?.generalFeedback || 'Lớp tập trung, tiếp thu bài tốt',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Sync entries if class or date changes
  const handleSelectClass = (clsId) => {
    setSelectedClassId(clsId);
    const rec = attendance.find(a => a.classId === clsId && a.date === selectedDate);
    const enrolled = students.filter(s => s.status === 'active' && s.classIds?.includes(clsId));
    setEntries(enrolled.map(st => {
      const existing = rec?.entries?.find(e => e.studentId === st.id);
      return {
        studentId: st.id,
        status: existing?.status || 'present',
        note: existing?.note || ''
      };
    }));
    setFocusedIndex(0);
  };

  const handleSelectDate = (dateVal) => {
    setSelectedDate(dateVal);
    const rec = attendance.find(a => a.classId === selectedClassId && a.date === dateVal);
    const enrolled = students.filter(s => s.status === 'active' && s.classIds?.includes(selectedClassId));
    setEntries(enrolled.map(st => {
      const existing = rec?.entries?.find(e => e.studentId === st.id);
      return {
        studentId: st.id,
        status: existing?.status || 'present',
        note: existing?.note || ''
      };
    }));
  };

  // 1-TOUCH ALL PRESENT
  const handleMarkAllPresent = () => {
    if (currentRecord.isLocked) {
      alert('Ca học này đã bị khóa điểm danh. Vui lòng liên hệ Admin để mở khóa!');
      return;
    }
    setEntries(prev => prev.map(e => ({ ...e, status: 'present' })));
    showToast(`Đã đánh dấu toàn bộ ${classStudents.length} học sinh có mặt.`);
  };

  const handleUpdateStatus = (studentId, status) => {
    if (currentRecord.isLocked) return;
    setEntries(prev => prev.map(e => e.studentId === studentId ? { ...e, status } : e));
  };

  const handleUpdateNote = (studentId, note) => {
    if (currentRecord.isLocked) return;
    setEntries(prev => prev.map(e => e.studentId === studentId ? { ...e, note } : e));
  };

  // SPREADSHEET HOTKEYS (1, 2, 3, Arrow Keys, Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (classStudents.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, classStudents.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === '1') {
        e.preventDefault();
        const cur = classStudents[focusedIndex];
        if (cur) {
          handleUpdateStatus(cur.id, 'present');
          setFocusedIndex(prev => Math.min(prev + 1, classStudents.length - 1));
        }
      } else if (e.key === '2') {
        e.preventDefault();
        const cur = classStudents[focusedIndex];
        if (cur) {
          handleUpdateStatus(cur.id, 'absent_excused');
          setFocusedIndex(prev => Math.min(prev + 1, classStudents.length - 1));
        }
      } else if (e.key === '3') {
        e.preventDefault();
        const cur = classStudents[focusedIndex];
        if (cur) {
          handleUpdateStatus(cur.id, 'absent_unexcused');
          setFocusedIndex(prev => Math.min(prev + 1, classStudents.length - 1));
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, classStudents.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, classStudents, currentRecord.isLocked]);

  // CONTEXTUAL ZALO ALERT GENERATOR
  const handleSendZaloAlert = (student, status) => {
    const reason = status === 'absent_excused' ? 'có phép' : 'không phép';
    const message = `Kính gửi phụ huynh, em ${student.name} (${student.studentCode}) vắng mặt (${reason}) buổi học môn ${selectedClass?.name} ngày ${selectedDate}. Xin phụ huynh liên hệ trung tâm để được bố trí lịch học bù. Trân trọng, Trung tâm LT1.`;
    navigator.clipboard.writeText(message);
    showToast(`Đã sao chép tin nhắn Zalo gửi phụ huynh em ${student.name}!`);
  };

  // SAVE ATTENDANCE
  const handleSave = () => {
    const absentCount = entries.filter(e => e.status === 'absent_unexcused' || e.status === 'absent_excused').length;
    const recordToSave = {
      ...currentRecord,
      classId: selectedClassId,
      date: selectedDate,
      teacherAttendance: { teacherId: selectedClass?.teacherId, present: teacherPresent },
      assistantAttendance: { assistantId: selectedClass?.assistantId, present: assistantPresent },
      progressNote,
      entries,
    };
    onSaveAttendance(recordToSave);
    
    if (absentCount > 0) {
      showToast(`Đã lưu điểm danh ca ${selectedClass?.name}. Đã sẵn sàng gửi thông báo Zalo cho ${absentCount} phụ huynh vắng mặt.`);
    } else {
      showToast(`Đã lưu điểm danh ca ${selectedClass?.name}. Sĩ số đầy đủ 100%, không có học sinh vắng.`);
    }
  };

  const totalStudents = classStudents.length;
  const presentCount = entries.filter(e => e.status === 'present').length;
  const excusedCount = entries.filter(e => e.status === 'absent_excused').length;
  const unexcusedCount = entries.filter(e => e.status === 'absent_unexcused').length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* TOP HEADER: ACTION CONTROL BAR */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Bàn điều khiển điểm danh ca học
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1">
              <Keyboard size={12} /> Spreadsheet hotkeys: 1 Có mặt, 2 Phép, 3 Vắng, ↑↓
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mặc định tất cả học sinh có mặt. Chỉ cần click hoặc bấm phím đổi những em vắng.
          </p>
        </div>

        {/* Lock Status & Actions */}
        <div className="flex items-center gap-2.5">
          {currentRecord.isLocked ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium flex items-center gap-1.5">
                <Lock size={12} /> Đã khóa sổ
              </span>
              {userRole === 'admin' && (
                <button
                  onClick={() => onToggleLockAttendance(currentRecord.id, false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition"
                >
                  <Unlock size={12} /> Mở khóa
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium flex items-center gap-1.5">
                <Unlock size={12} /> Mở (Khóa lúc {selectedClass?.lockTime || '18:30'})
              </span>
              {userRole === 'admin' && (
                <button
                  onClick={() => onToggleLockAttendance(currentRecord.id, true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition"
                >
                  <Lock size={12} /> Khóa ngay
                </button>
              )}
            </div>
          )}

          {/* Quick All Present */}
          <button
            onClick={handleMarkAllPresent}
            disabled={currentRecord.isLocked}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Đánh dấu toàn bộ có mặt"
          >
            <Check size={14} className="text-emerald-600" /> Tất cả có mặt
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={14} /> Lưu điểm danh & tiến độ
          </button>
        </div>
      </div>

      {/* FILTER & METRICS BAR */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap text-xs shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Lớp học:</span>
            <select
              value={selectedClassId}
              onChange={e => handleSelectClass(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) — {c.scheduleTime}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Ngày:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleSelectDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 flex-wrap tabular-nums">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
            Sĩ số: <strong className="text-slate-900">{totalStudents}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium">
            Có mặt: <strong className="text-emerald-800">{presentCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-medium">
            Có phép: <strong className="text-amber-800">{excusedCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-medium">
            Vắng: <strong className="text-rose-800">{unexcusedCount}</strong>
          </span>
        </div>
      </div>

      {/* SPREADSHEET TABLE & PROGRESS NOTES LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SPREADSHEET TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">
              Danh sách học sinh lớp {selectedClass?.name}
            </span>
            <span className="text-slate-400">
              Chuyển nấc trạng thái hoặc dùng phím số 1, 2, 3
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-medium">
                  <th className="py-2.5 px-4 w-10 text-center">STT</th>
                  <th className="py-2.5 px-4">Mã & Họ tên học sinh</th>
                  <th className="py-2.5 px-4 w-56 text-center">Trạng thái</th>
                  <th className="py-2.5 px-4">Ghi chú & Tác vụ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((st, idx) => {
                  const entry = entries.find(e => e.studentId === st.id) || { status: 'present', note: '' };
                  const isFocused = idx === focusedIndex;
                  const isAbsent = entry.status === 'absent_unexcused' || entry.status === 'absent_excused';
                  const isStreakAlert = (st.consecutiveAbsences || 0) >= 2;

                  return (
                    <tr
                      key={st.id}
                      onClick={() => setFocusedIndex(idx)}
                      className={`transition-colors cursor-pointer ${
                        isFocused 
                          ? 'bg-amber-50/40' 
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenStudentProfile && onOpenStudentProfile(st);
                            }}
                            className="font-medium text-slate-900 hover:text-amber-700 transition"
                          >
                            {st.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                            {st.studentCode}
                          </span>
                          {isStreakAlert && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-medium">
                              Vắng 2 buổi liền
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">PH: {st.parentPhone || st.phone}</div>
                      </td>

                      {/* SEGMENTED PILL SWITCH (TINH GỌN, CHUẨN MOBBIN / LINEAR) */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/60 gap-0.5 text-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(st.id, 'present');
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 cursor-pointer ${
                              entry.status === 'present'
                                ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Có mặt</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(st.id, 'absent_excused');
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 cursor-pointer ${
                              entry.status === 'absent_excused'
                                ? 'bg-white text-amber-800 shadow-2xs font-semibold'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Có phép</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(st.id, 'absent_unexcused');
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 cursor-pointer ${
                              entry.status === 'absent_unexcused'
                                ? 'bg-white text-rose-800 shadow-2xs font-semibold'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Vắng KP</span>
                          </button>
                        </div>
                      </td>

                      {/* CONTEXTUAL ACTION: NÚT BÁO ZALO CHỈ HIỆN KHI VẮNG */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ghi chú thêm..."
                            value={entry.note}
                            onChange={(e) => handleUpdateNote(st.id, e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                          />

                          {isAbsent && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendZaloAlert(st, entry.status);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium transition flex items-center gap-1 shrink-0 animate-fade-in cursor-pointer"
                              title="Sao chép tin nhắn Zalo gửi phụ huynh"
                            >
                              <Send size={11} /> Báo Zalo
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PROGRESS NOTE & TEACHER ATTENDANCE (4 COLS) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Giáo viên & trợ giảng */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
              <UserCheck size={14} className="text-amber-600" />
              Điểm danh giáo viên & trợ giảng
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <span className="font-medium text-slate-800">Giáo viên giảng dạy</span>
                  <div className="text-[11px] text-slate-500">ThS. Nguyễn Văn Thành</div>
                </div>
                <input
                  type="checkbox"
                  checked={teacherPresent}
                  onChange={e => setTeacherPresent(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <div>
                  <span className="font-medium text-slate-800">Trợ giảng quản lý ca</span>
                  <div className="text-[11px] text-slate-500">Bùi Minh Đức</div>
                </div>
                <input
                  type="checkbox"
                  checked={assistantPresent}
                  onChange={e => setAssistantPresent(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Sổ ghi chép bài học */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
              <FileText size={14} className="text-amber-600" />
              Sổ theo dõi bài dạy & dặn dò
            </h3>

            <div>
              <label className="block text-slate-500 mb-1 font-medium">Nội dung bài học hôm nay</label>
              <textarea
                rows={2}
                value={progressNote.topicsTaught}
                onChange={e => setProgressNote({ ...progressNote, topicsTaught: e.target.value })}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-medium">Bài tập về nhà</label>
              <textarea
                rows={2}
                value={progressNote.homework}
                onChange={e => setProgressNote({ ...progressNote, homework: e.target.value })}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-medium">Đánh giá chung ý thức học tập</label>
              <textarea
                rows={2}
                value={progressNote.generalFeedback}
                onChange={e => setProgressNote({ ...progressNote, generalFeedback: e.target.value })}
                className="w-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
