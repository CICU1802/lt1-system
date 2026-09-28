import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Save,
  Check,
  X,
  FileText,
  UserCheck,
  Calendar,
  AlertOctagon,
  ChevronDown,
  Sparkles,
  Send,
  CheckCircle2,
  Copy,
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

  // Local editing state
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
    topicsTaught: currentRecord.progressNote?.topicsTaught || 'Ôn tập Hàm số bậc nhất và đồ thị nâng cao (Toán 10)',
    progressStatus: currentRecord.progressNote?.progressStatus || 'Đúng lộ trình đề cương tuần 4',
    supplementalNotes: currentRecord.progressNote?.supplementalNotes || '',
    homework: currentRecord.progressNote?.homework || 'Bài tập 15 đến 24 SGK Nâng Cao + Phiếu tự luyện số 3',
    generalFeedback: currentRecord.progressNote?.generalFeedback || 'Lớp tập trung cao, 5 học sinh làm tốt phần trắc nghiệm',
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

  // FEATURE 1: 1-TOUCH "ALL PRESENT" (Điểm danh nhanh: Tất cả có mặt)
  const handleMarkAllPresent = () => {
    if (currentRecord.isLocked) {
      alert('Ca học này đã bị khóa điểm danh. Vui lòng liên hệ Admin để mở khóa!');
      return;
    }
    setEntries(prev => prev.map(e => ({ ...e, status: 'present' })));
    showToast(`Đã đánh dấu toàn bộ ${classStudents.length} học sinh có mặt! Bấm "Lưu" để chốt sĩ số.`);
  };

  const handleUpdateStatus = (studentId, status) => {
    if (currentRecord.isLocked) return;
    setEntries(prev => prev.map(e => e.studentId === studentId ? { ...e, status } : e));
  };

  const handleUpdateNote = (studentId, note) => {
    if (currentRecord.isLocked) return;
    setEntries(prev => prev.map(e => e.studentId === studentId ? { ...e, note } : e));
  };

  // FEATURE 2: SPREADSHEET HOTKEYS (1, 2, 3, Arrow Keys, Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in text input or textarea
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
        const currentStudent = classStudents[focusedIndex];
        if (currentStudent) {
          handleUpdateStatus(currentStudent.id, 'present');
          setFocusedIndex(prev => Math.min(prev + 1, classStudents.length - 1));
        }
      } else if (e.key === '2') {
        e.preventDefault();
        const currentStudent = classStudents[focusedIndex];
        if (currentStudent) {
          handleUpdateStatus(currentStudent.id, 'absent_excused');
          setFocusedIndex(prev => Math.min(prev + 1, classStudents.length - 1));
        }
      } else if (e.key === '3') {
        e.preventDefault();
        const currentStudent = classStudents[focusedIndex];
        if (currentStudent) {
          handleUpdateStatus(currentStudent.id, 'absent_unexcused');
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

  // FEATURE 3: 1-TOUCH ZALO ALERT GENERATOR FOR ABSENT STUDENTS
  const handleSendZaloAlert = (student, status) => {
    const reason = status === 'absent_excused' ? 'có phép' : 'không phép';
    const message = `Kính gửi phụ huynh, em ${student.name} (${student.studentCode}) vắng mặt (${reason}) buổi học môn ${selectedClass?.name} ngày ${selectedDate}. Xin phụ huynh phản hồi để trung tâm bố trí ca học bù kịp thời cho con. Trân trọng, Trung tâm LT1.`;
    navigator.clipboard.writeText(message);
    showToast(`Đã sao chép tin nhắn Zalo gửi phụ huynh em ${student.name}!`);
  };

  // SAVE ATTENDANCE WITH NATURAL TONE VOICE
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
    
    // Natural action-oriented message
    if (absentCount > 0) {
      showToast(`Đã lưu điểm danh ca ${selectedClass?.name}. Đã sẵn sàng gửi thông báo Zalo cho ${absentCount} phụ huynh vắng mặt.`);
    } else {
      showToast(`Đã lưu điểm danh ca ${selectedClass?.name}. Sĩ số đầy đủ 100%, không có học sinh vắng.`);
    }
  };

  // Counts
  const totalStudents = classStudents.length;
  const presentCount = entries.filter(e => e.status === 'present').length;
  const excusedCount = entries.filter(e => e.status === 'absent_excused').length;
  const unexcusedCount = entries.filter(e => e.status === 'absent_unexcused').length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-400/80 hover:text-emerald-300">✕</button>
        </div>
      )}

      {/* TOP HEADER: ACTION CONTROL BAR */}
      <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-between gap-4 flex-wrap shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <CheckSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Bàn Điều Khiển Điểm Danh 1 Chạm & Báo Zalo
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold uppercase flex items-center gap-1">
                <Keyboard size={11} /> Spreadsheet Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hỗ trợ phím số 1 (Có mặt), 2 (Có phép), 3 (Vắng), mũi tên ↑↓ để lướt phím như Excel
            </p>
          </div>
        </div>

        {/* Lock / Unlock Status & Save Button */}
        <div className="flex items-center gap-2.5">
          {currentRecord.isLocked ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5">
                <Lock size={13} /> Đã khóa điểm danh
              </span>
              {userRole === 'admin' && (
                <button
                  onClick={() => onToggleLockAttendance(currentRecord.id, false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                >
                  <Unlock size={13} /> Mở khóa (Admin)
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
                <Unlock size={13} /> Đang mở (Khóa lúc {selectedClass?.lockTime || '18:30'})
              </span>
              {userRole === 'admin' && (
                <button
                  onClick={() => onToggleLockAttendance(currentRecord.id, true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                >
                  <Lock size={13} /> Khóa ngay (Admin)
                </button>
              )}
            </div>
          )}

          {/* 1-CLICK ALL PRESENT BUTTON */}
          <button
            onClick={handleMarkAllPresent}
            disabled={currentRecord.isLocked}
            className="px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Đánh dấu toàn bộ học sinh có mặt"
          >
            <Zap size={14} className="text-emerald-400" /> Điểm danh nhanh: Tất cả có mặt
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Save size={14} /> Lưu Điểm Danh & Tiến Độ
          </button>
        </div>
      </div>

      {/* FILTER & REALTIME STATS BAR */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Chọn Lớp:</span>
            <select
              value={selectedClassId}
              onChange={e => handleSelectClass(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium focus:outline-none focus:border-amber-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) — {c.scheduleTime}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Ngày học:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleSelectDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium focus:outline-none focus:border-amber-500"
            >
            </input>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
            Sĩ số: <strong className="text-white">{totalStudents}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Có mặt [1]: <strong className="text-emerald-300">{presentCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            Có phép [2]: <strong className="text-amber-300">{excusedCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
            Vắng [3]: <strong className="text-rose-300">{unexcusedCount}</strong>
          </span>
        </div>
      </div>

      {/* SPREADSHEET TABLE & PROGRESS NOTES LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SPREADSHEET TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-[#0B1120] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <UserCheck size={14} className="text-amber-400" />
              Bảng Học Sinh Lớp {selectedClass?.name}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Dùng phím 1, 2, 3 hoặc click để đổi trạng thái
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3 w-10 text-center">STT</th>
                  <th className="py-2.5 px-3">Mã HS & Họ Tên</th>
                  <th className="py-2.5 px-3 w-64 text-center">Trạng thái (1: X / 2: P / 3: K)</th>
                  <th className="py-2.5 px-3">Ghi chú & Hành động Zalo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
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
                          ? 'bg-amber-500/10 ring-1 ring-amber-500/30' 
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenStudentProfile && onOpenStudentProfile(st);
                            }}
                            className="font-semibold text-slate-200 hover:text-amber-400 transition"
                          >
                            {st.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1 py-0.2 rounded border border-slate-800">
                            {st.studentCode}
                          </span>
                          {isStreakAlert && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30" title="Vắng 2 buổi liền">
                              ⚠️ Vắng 2B
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">PH: {st.parentPhone || st.phone}</div>
                      </td>

                      {/* 1/2/3 Trạng thái Buttons */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(st.id, 'present');
                            }}
                            className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                              entry.status === 'present'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
                            }`}
                          >
                            <span>Có mặt</span>
                            <span className="text-[10px] font-mono opacity-80">[1]</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(st.id, 'absent_excused');
                            }}
                            className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                              entry.status === 'absent_excused'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-900'
                            }`}
                          >
                            <span>Có phép</span>
                            <span className="text-[10px] font-mono opacity-80">[2]</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(st.id, 'absent_unexcused');
                            }}
                            className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                              entry.status === 'absent_unexcused'
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
                            }`}
                          >
                            <span>Vắng KP</span>
                            <span className="text-[10px] font-mono opacity-80">[3]</span>
                          </button>
                        </div>
                      </td>

                      {/* Ghi chú & Nút Báo Zalo */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ghi chú (vào muộn 15p, bài tập...)"
                            value={entry.note}
                            onChange={(e) => handleUpdateNote(st.id, e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          />

                          {/* 1-TOUCH BÁO ZALO CHO PHỤ HUYNH */}
                          {isAbsent && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendZaloAlert(st, entry.status);
                              }}
                              className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition flex items-center gap-1 shrink-0"
                              title="Tạo và copy mẫu tin nhắn Zalo gửi phụ huynh"
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
        <div className="lg:col-span-4 space-y-4">
          {/* Teacher & Assistant Check */}
          <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <UserCheck size={14} className="text-amber-400" />
              Điểm Danh Giáo Viên & Trợ Giảng
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200">Giáo viên giảng dạy</span>
                  <div className="text-[11px] text-slate-400">ThS. Nguyễn Văn Thành</div>
                </div>
                <input
                  type="checkbox"
                  checked={teacherPresent}
                  onChange={e => setTeacherPresent(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200">Trợ giảng quản lý ca</span>
                  <div className="text-[11px] text-slate-400">Bùi Minh Đức</div>
                </div>
                <input
                  type="checkbox"
                  checked={assistantPresent}
                  onChange={e => setAssistantPresent(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Ghi chú Tiến độ & Dặn dò */}
          <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-3 shadow-xl text-xs">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <FileText size={14} className="text-amber-400" />
              Sổ Theo Dõi Tiến Độ & Dặn Dò Buổi Học
            </h3>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Nội dung bài dạy hôm nay</label>
              <textarea
                rows={2}
                value={progressNote.topicsTaught}
                onChange={e => setProgressNote({ ...progressNote, topicsTaught: e.target.value })}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Bài tập về nhà (Giao học sinh)</label>
              <textarea
                rows={2}
                value={progressNote.homework}
                onChange={e => setProgressNote({ ...progressNote, homework: e.target.value })}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Đánh giá chung tinh thần học tập</label>
              <textarea
                rows={2}
                value={progressNote.generalFeedback}
                onChange={e => setProgressNote({ ...progressNote, generalFeedback: e.target.value })}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
