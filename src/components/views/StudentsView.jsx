import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  UserCheck,
  UserX,
  RotateCcw,
  Eye,
  Edit2,
  Trash2,
  Phone,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  CreditCard,
  Send,
  Save,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

export default function StudentsView({
  students,
  classes = [],
  invoices = [],
  exams = [],
  attendance = [],
  onAddStudent,
  onUpdateStudent,
  onToggleStudentStatus,
  onOpenStudentProfile,
  onOpenVietQR,
  initialSearch = ''
}) {
  const [filterStatus, setFilterStatus] = useState('active'); // 'active' | 'dropped' | 'all'
  const [filterGrade, setFilterGrade] = useState('all'); // 'all' | 'g10' | 'g11' | 'g12' | 'g9'
  const [filterTuition, setFilterTuition] = useState('all'); // 'all' | 'paid' | 'unpaid'
  const [filterAcademic, setFilterAcademic] = useState('all'); // 'all' | 'good' | 'average' | 'risk'
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  
  // Selected student for 40% Detail Drawer (defaults to first active student)
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [quickNote, setQuickNote] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Helper to show natural feedback toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filter students based on all 4 tiers
  const filteredStudents = students.filter(st => {
    // 1. Status filter
    if (filterStatus === 'active' && st.status !== 'active') return false;
    if (filterStatus === 'dropped' && st.status !== 'dropped') return false;

    // 2. Grade filter
    if (filterGrade !== 'all') {
      const studentClassObjs = classes.filter(c => st.classIds?.includes(c.id));
      const hasGrade = studentClassObjs.some(c => c.gradeId === filterGrade);
      if (!hasGrade) return false;
    }

    // 3. Tuition filter
    if (filterTuition !== 'all') {
      const stInvoices = invoices.filter(inv => inv.studentId === st.id);
      const hasUnpaid = stInvoices.some(inv => inv.status === 'unpaid' || inv.status === 'overdue');
      if (filterTuition === 'unpaid' && !hasUnpaid) return false;
      if (filterTuition === 'paid' && hasUnpaid) return false;
    }

    // 4. Academic / Risk filter
    if (filterAcademic === 'risk' && (st.consecutiveAbsences || 0) < 2) return false;

    // 5. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = st.name.toLowerCase().includes(q);
      const matchCode = st.studentCode.toLowerCase().includes(q);
      const matchPhone = st.phone?.includes(q) || st.parentPhone?.includes(q);
      if (!matchName && !matchCode && !matchPhone) return false;
    }

    return true;
  });

  // Calculate student 4-session attendance history
  const getRecentAttendance = (studentId) => {
    const records = [];
    // Sort attendance descending by date
    const sortedAtt = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const att of sortedAtt) {
      const entry = att.entries?.find(e => e.studentId === studentId);
      if (entry) {
        records.push({
          date: att.date,
          status: entry.status, // 'present' | 'absent_excused' | 'absent_unexcused'
          sessionName: att.sessionName || att.date
        });
        if (records.length === 4) break;
      }
    }
    // Pad to 4 if less
    while (records.length < 4) {
      records.push({ date: '—', status: 'present', sessionName: 'Buổi học trước' });
    }
    return records.reverse(); // chronological order
  };

  // Calculate recent exam scores for selected student
  const getStudentScores = (studentId) => {
    const list = [];
    exams.forEach(ex => {
      const sc = ex.scores?.find(s => s.studentId === studentId);
      if (sc) {
        list.push({
          title: ex.title,
          date: ex.date,
          score: sc.score,
          maxScore: ex.maxScore || 10
        });
      }
    });
    return list.slice(0, 3);
  };

  // Quick Zalo action with natural feedback
  const handleQuickZalo = (st) => {
    const text = `Kính gửi phụ huynh, em ${st.name} (${st.studentCode}) đang theo học tại Trung tâm LT1. ${
      st.consecutiveAbsences >= 2 
        ? `Em đã vắng 2 buổi liên tiếp gần đây. Xin phụ huynh vui lòng phản hồi để trung tâm bố trí lịch học bù kịp thời cho con.` 
        : `Tình hình học tập và chuyên cần của con tuần này rất tốt. Trân trọng gửi thông tin từ Trung tâm LT1!`
    }`;
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép tin nhắn Zalo gửi Phụ Huynh em ${st.name}!`);
  };

  // Quick VietQR trigger for selected student
  const handleQuickVietQR = (st) => {
    const stInvoice = invoices.find(inv => inv.studentId === st.id && (inv.status === 'unpaid' || inv.status === 'overdue')) || invoices.find(inv => inv.studentId === st.id);
    if (stInvoice && onOpenVietQR) {
      onOpenVietQR(stInvoice);
    } else if (onOpenVietQR) {
      // Mock invoice fallback
      onOpenVietQR({
        id: `inv-${st.id}`,
        studentId: st.id,
        studentName: st.name,
        studentCode: st.studentCode,
        className: 'TOAN10',
        classNames: ['Toán Nâng Cao 10A'],
        finalAmount: 1200000,
        remainingAmount: 1200000,
        status: 'unpaid',
        invoiceCode: `HD26-${st.studentCode.replace('-', '')}`
      });
    }
  };

  // Quick note save
  const handleSaveQuickNote = () => {
    if (!selectedStudent) return;
    onUpdateStudent(selectedStudent.id, { note: quickNote || selectedStudent.note });
    showToast(`Đã cập nhật ghi chú trợ giảng cho em ${selectedStudent.name}.`);
  };

  // Form handling
  const [formData, setFormData] = useState({
    studentCode: '',
    name: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    address: '',
    classIds: [],
    note: '',
    status: 'active'
  });

  const handleOpenAddModal = () => {
    const nextCode = `HS24-${String(students.length + 1).padStart(3, '0')}`;
    setEditingStudent(null);
    setFormData({
      studentCode: nextCode,
      name: '',
      phone: '',
      parentName: '',
      parentPhone: '',
      address: '',
      classIds: [],
      note: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (st) => {
    setEditingStudent(st);
    setFormData({
      studentCode: st.studentCode,
      name: st.name,
      phone: st.phone || '',
      parentName: st.parentName || '',
      parentPhone: st.parentPhone || '',
      address: st.address || '',
      classIds: st.classIds || [],
      note: st.note || '',
      status: st.status
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStudent) {
      onUpdateStudent(editingStudent.id, formData);
      showToast(`Đã cập nhật thông tin học sinh ${formData.name}.`);
    } else {
      const newSt = {
        id: `std-${Date.now()}`,
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        consecutiveAbsences: 0,
      };
      onAddStudent(newSt);
      setSelectedStudentId(newSt.id);
      showToast(`Đã tiếp nhận và tạo hồ sơ mới cho học sinh ${formData.name} (${formData.studentCode}).`);
    }
    setIsModalOpen(false);
  };

  const recentAtt = selectedStudent ? getRecentAttendance(selectedStudent.id) : [];
  const recentScores = selectedStudent ? getStudentScores(selectedStudent.id) : [];

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-5.5rem)] flex flex-col">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-lg animate-in slide-in-from-top-1 shrink-0">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP FILTER & ACTION BAR */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search */}
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm tên, mã HS, SĐT..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Grade Filter */}
          <select
            value={filterGrade}
            onChange={e => setFilterGrade(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">Tất cả khối lớp</option>
            <option value="g10">Khối 10</option>
            <option value="g11">Khối 11</option>
            <option value="g12">Khối 12</option>
            <option value="g9">Khối 9</option>
          </select>

          {/* Tuition Filter */}
          <select
            value={filterTuition}
            onChange={e => setFilterTuition(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">Tất cả học phí</option>
            <option value="paid">Đã hoàn thành</option>
            <option value="unpaid">Còn nợ / Cần thu</option>
          </select>

          {/* Status Filter */}
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterStatus === 'active' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đang học ({students.filter(s => s.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('dropped')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterStatus === 'dropped' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đã nghỉ ({students.filter(s => s.status === 'dropped').length})
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
        >
          <UserPlus size={14} /> Thêm học sinh mới
        </button>
      </div>

      {/* MASTER-DETAIL WORKSPACE (60% LIST / 40% DRAWER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* CỘT TRÁI (60% - 7 COLS): DANH SÁCH HỌC SINH TINH GỌN */}
        <div className="lg:col-span-7 bg-[#0B1120] border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl">
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Danh sách ({filteredStudents.length} học sinh)</span>
            <span className="text-[11px]">Click một dòng để xem Profile 360° bên phải</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Không tìm thấy học sinh nào phù hợp bộ lọc hiện tại.
              </div>
            ) : (
              filteredStudents.map(st => {
                const isSelected = selectedStudent?.id === st.id;
                const isAlert = (st.consecutiveAbsences || 0) >= 2;
                const studentClasses = classes.filter(c => st.classIds?.includes(c.id));
                const studentInvoices = invoices.filter(inv => inv.studentId === st.id);
                const hasUnpaid = studentInvoices.some(inv => inv.status === 'unpaid' || inv.status === 'overdue');

                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedStudentId(st.id);
                      setQuickNote(st.note || '');
                    }}
                    className={`p-3 transition cursor-pointer flex items-center justify-between gap-3 group ${
                      isSelected
                        ? 'bg-amber-500/10 border-l-4 border-amber-500 text-slate-100'
                        : 'hover:bg-slate-900/60 border-l-4 border-transparent text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAlert 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                          : isSelected 
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' 
                            : 'bg-slate-800 text-slate-300 group-hover:text-amber-400 transition-colors'
                      }`}>
                        {st.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold text-xs truncate ${isSelected ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                            {st.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                            {st.studentCode}
                          </span>
                          {isAlert && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                              <AlertCircle size={10} /> Vắng 2B
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-2">
                          <span>{studentClasses.map(c => c.name).join(', ') || 'Chưa xếp lớp'}</span>
                          <span className="text-slate-600">•</span>
                          <span>PH: {st.parentPhone || st.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hasUnpaid ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                          Nợ học phí
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Đã đóng
                        </span>
                      )}
                      <ChevronRight size={14} className={`text-slate-600 transition-transform ${isSelected ? 'rotate-90 text-amber-400' : 'group-hover:translate-x-0.5'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT PHẢI (40% - 5 COLS): DRAWER 360° PROFILE HỌC SINH ĐANG CHỌN */}
        <div className="lg:col-span-5 bg-[#0B1120] border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-2xl relative">
          {selectedStudent ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Profile Card Header */}
              <div className="p-4 bg-gradient-to-b from-slate-900 to-[#0B1120] border-b border-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white tracking-tight">{selectedStudent.name}</h2>
                        <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {selectedStudent.studentCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ngày gia nhập: {selectedStudent.joinDate || '2026-08-15'}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedStudent.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {selectedStudent.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                  </span>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleQuickZalo(selectedStudent)}
                    className="py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send size={13} /> Nhắn Zalo Phụ Huynh
                  </button>

                  <button
                    onClick={() => handleQuickVietQR(selectedStudent)}
                    className="py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <CreditCard size={13} /> Xuất Smart VietQR
                  </button>
                </div>
              </div>

              {/* 360° Metrics & Details */}
              <div className="p-4 space-y-4 flex-1">
                {/* 1. Điểm danh 4 buổi gần nhất (chấm xanh/vàng/đỏ) */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-400" /> Chuyên cần 4 buổi gần nhất
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {selectedStudent.consecutiveAbsences >= 2 ? (
                        <span className="text-rose-400 font-bold">⚠️ Vắng 2 buổi liền</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">Tốt</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-1">
                    {recentAtt.map((att, idx) => {
                      const isPresent = att.status === 'present';
                      const isExcused = att.status === 'absent_excused';
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                              isPresent
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                                : isExcused
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                            }`}
                            title={`Ngày: ${att.date} - ${isPresent ? 'Có mặt' : isExcused ? 'Có phép' : 'Vắng không phép'}`}
                          >
                            {isPresent ? '✓' : isExcused ? 'P' : 'K'}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{att.date.split('-').slice(1).join('/')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Điểm kiểm tra & Khảo sát gần nhất */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Award size={13} className="text-amber-400" /> Điểm thi thử & Khảo sát
                    </span>
                    <span className="text-[10px] text-slate-400">Gần nhất</span>
                  </div>

                  {recentScores.length > 0 ? (
                    <div className="space-y-2">
                      {recentScores.map((sc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-850 text-xs">
                          <div>
                            <p className="font-semibold text-slate-200">{sc.title}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{sc.date}</p>
                          </div>
                          <div className="font-bold text-sm text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {sc.score} <span className="text-[10px] text-slate-400">/{sc.maxScore}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg">
                      Đang đồng bộ điểm từ Sổ Điểm Điện Tử.
                    </div>
                  )}
                </div>

                {/* 3. Ghi chú nhanh của Trợ giảng */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-amber-400" /> Ghi chú trợ giảng
                    </span>
                    <button
                      onClick={handleSaveQuickNote}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-[11px] font-medium transition flex items-center gap-1"
                    >
                      <Save size={11} /> Lưu ghi chú
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={quickNote || selectedStudent.note || ''}
                    onChange={e => setQuickNote(e.target.value)}
                    placeholder="Nhập ghi chú nhanh về ý thức học tập, bài tập về nhà..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>

                {/* 4. Thông tin phụ huynh & Liên hệ */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phụ huynh:</span>
                    <strong className="text-slate-200">{selectedStudent.parentName || 'Chưa cập nhật'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SĐT Phụ huynh:</span>
                    <span className="font-mono text-amber-400 font-semibold">{selectedStudent.parentPhone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SĐT Học sinh:</span>
                    <span className="font-mono text-slate-300">{selectedStudent.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Địa chỉ:</span>
                    <span className="text-slate-300 truncate max-w-[200px]">{selectedStudent.address || 'TP. Hồ Chí Minh'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Drawer */}
              <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onToggleStudentStatus(selectedStudent.id, selectedStudent.status === 'active' ? 'dropped' : 'active')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  {selectedStudent.status === 'active' ? 'Đánh dấu Thôi học' : 'Tái nhập học'}
                </button>

                <button
                  onClick={() => handleOpenEditModal(selectedStudent)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Edit2 size={13} /> Sửa chi tiết
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 m-auto">
              Chọn một học sinh từ danh sách để xem Profile 360°.
            </div>
          )}
        </div>
      </div>

      {/* FULL EDIT / ADD STUDENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0B1120] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
            <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck size={16} className="text-amber-400" />
                {editingStudent ? `Chỉnh Sửa Hồ Sơ: ${editingStudent.name}` : 'Thêm Học Sinh Mới Vào Trung Tâm'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Mã học sinh (*)</label>
                  <input
                    type="text"
                    required
                    value={formData.studentCode}
                    onChange={e => setFormData({ ...formData, studentCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Họ và tên (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">SĐT học sinh</label>
                  <input
                    type="tel"
                    placeholder="0912..."
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Họ tên Phụ huynh</label>
                  <input
                    type="text"
                    placeholder="Bố/Mẹ..."
                    value={formData.parentName}
                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">SĐT Phụ huynh (Nhận Zalo/SMS)</label>
                  <input
                    type="tel"
                    placeholder="0903..."
                    value={formData.parentPhone}
                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Địa chỉ cư trú</label>
                  <input
                    type="text"
                    placeholder="Quận/Huyện..."
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Lớp đăng ký học</label>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  {classes.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-amber-400">
                      <input
                        type="checkbox"
                        checked={formData.classIds.includes(c.id)}
                        onChange={() => {
                          const exists = formData.classIds.includes(c.id);
                          setFormData({
                            ...formData,
                            classIds: exists
                              ? formData.classIds.filter(id => id !== c.id)
                              : [...formData.classIds, c.id]
                          });
                        }}
                        className="rounded border-slate-700 text-amber-500"
                      />
                      <span>{c.name} ({c.code})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Ghi chú học vụ</label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ghi chú về học lực, trường đang học..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
