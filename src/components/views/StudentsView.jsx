import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  UserCheck,
  UserX,
  RotateCcw,
  Edit2,
  Trash2,
  Phone,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Send,
  Save,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

export default function StudentsView({
  students = [],
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
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterTuition, setFilterTuition] = useState('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'finance'
  
  // Selected student for 40% Detail Drawer
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [quickNote, setQuickNote] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filter students
  const filteredStudents = students.filter(st => {
    if (filterStatus === 'active' && st.status !== 'active') return false;
    if (filterStatus === 'dropped' && st.status !== 'dropped') return false;

    if (filterGrade !== 'all') {
      const studentClassObjs = classes.filter(c => st.classIds?.includes(c.id));
      const hasGrade = studentClassObjs.some(c => c.gradeId === filterGrade);
      if (!hasGrade) return false;
    }

    if (filterTuition !== 'all') {
      const stInvoices = invoices.filter(inv => inv.studentId === st.id);
      const hasUnpaid = stInvoices.some(inv => inv.status === 'unpaid' || inv.status === 'overdue');
      if (filterTuition === 'unpaid' && !hasUnpaid) return false;
      if (filterTuition === 'paid' && hasUnpaid) return false;
    }

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
    const sortedAtt = [...attendance].sort((a, b) => new Date(b.date) - new Date(a.date));
    for (const att of sortedAtt) {
      const entry = att.entries?.find(e => e.studentId === studentId);
      if (entry) {
        records.push({
          date: att.date,
          status: entry.status,
          sessionName: att.sessionName || att.date
        });
        if (records.length === 4) break;
      }
    }
    while (records.length < 4) {
      records.push({ date: '—', status: 'present', sessionName: 'Buổi học trước' });
    }
    return records.reverse();
  };

  // Calculate recent exam scores
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

  const handleQuickZalo = (st) => {
    const text = `Kính gửi phụ huynh, em ${st.name} (${st.studentCode}) đang học tại Trung tâm LT1. ${
      st.consecutiveAbsences >= 2 
        ? `Em đã vắng 2 buổi liên tiếp gần đây. Xin phụ huynh vui lòng phản hồi để trung tâm bố trí lịch học bù cho con.` 
        : `Tình hình học tập và chuyên cần của con rất tốt. Trung tâm xin gửi lời cảm ơn đến phụ huynh!`
    }`;
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép tin nhắn Zalo gửi phụ huynh em ${st.name}!`);
  };

  const handleQuickVietQR = (st) => {
    const stInvoice = invoices.find(inv => inv.studentId === st.id && (inv.status === 'unpaid' || inv.status === 'overdue')) || invoices.find(inv => inv.studentId === st.id);
    if (stInvoice && onOpenVietQR) {
      onOpenVietQR(stInvoice);
    } else if (onOpenVietQR) {
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

  const handleSaveQuickNote = () => {
    if (!selectedStudent) return;
    onUpdateStudent(selectedStudent.id, { note: quickNote || selectedStudent.note });
    showToast(`Đã lưu ghi chú cho em ${selectedStudent.name}.`);
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
      showToast(`Đã thêm mới học sinh ${formData.name} (${formData.studentCode}).`);
    }
    setIsModalOpen(false);
  };

  // Pastel colors for avatar initials
  const pastelColors = [
    'bg-blue-50 text-blue-700',
    'bg-amber-50 text-amber-700',
    'bg-emerald-50 text-emerald-700',
    'bg-purple-50 text-purple-700',
    'bg-rose-50 text-rose-700',
    'bg-teal-50 text-teal-700',
  ];

  const getAvatarColor = (name) => {
    const charCode = name.charCodeAt(0) || 0;
    return pastelColors[charCode % pastelColors.length];
  };

  const recentAtt = selectedStudent ? getRecentAttendance(selectedStudent.id) : [];
  const recentScores = selectedStudent ? getStudentScores(selectedStudent.id) : [];
  const selectedStudentInvoices = selectedStudent ? invoices.filter(inv => inv.studentId === selectedStudent.id) : [];

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-5.5rem)] flex flex-col">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs animate-fade-in shrink-0">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP FILTER & ACTION BAR */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shrink-0 flex-wrap shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search */}
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, mã HS, số điện thoại..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Grade Filter */}
          <select
            value={filterGrade}
            onChange={e => setFilterGrade(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
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
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Tất cả học phí</option>
            <option value="paid">Đã hoàn thành</option>
            <option value="unpaid">Còn nợ / Cần thu</option>
          </select>

          {/* Status Filter */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/60 text-xs">
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                filterStatus === 'active' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đang học ({students.filter(s => s.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('dropped')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                filterStatus === 'dropped' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đã nghỉ ({students.filter(s => s.status === 'dropped').length})
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus size={14} /> Thêm học sinh
        </button>
      </div>

      {/* MASTER-DETAIL WORKSPACE (60% LIST / 40% STUDENT ONE-PAGER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden">
        {/* CỘT TRÁI (60% - 7 COLS): DANH SÁCH HỌC SINH */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl flex flex-col overflow-hidden shadow-xs">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Danh sách ({filteredStudents.length} học sinh)</span>
            <span>Chọn học sinh để xem hồ sơ chi tiết</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Không tìm thấy học sinh nào phù hợp bộ lọc.
              </div>
            ) : (
              filteredStudents.map(st => {
                const isSelected = selectedStudent?.id === st.id;
                const isAlert = (st.consecutiveAbsences || 0) >= 2;
                const studentClasses = classes.filter(c => st.classIds?.includes(c.id));
                const studentInvoices = invoices.filter(inv => inv.studentId === st.id);
                const hasUnpaid = studentInvoices.some(inv => inv.status === 'unpaid' || inv.status === 'overdue');
                const avatarStyle = getAvatarColor(st.name);

                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedStudentId(st.id);
                      setQuickNote(st.note || '');
                    }}
                    className={`p-3.5 transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/50 border-l-3 border-amber-500'
                        : 'hover:bg-slate-50 border-l-3 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${avatarStyle}`}>
                        {st.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs truncate ${isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>
                            {st.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                            {st.studentCode}
                          </span>
                          {isAlert && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <AlertCircle size={10} /> Vắng 2 buổi
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-2">
                          <span>{studentClasses.map(c => c.name).join(', ') || 'Chưa xếp lớp'}</span>
                          <span className="text-slate-300">•</span>
                          <span>PH: {st.parentPhone || st.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {hasUnpaid ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium">
                          Nợ học phí
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                          Đã nộp
                        </span>
                      )}
                      <ChevronRight size={14} className={`text-slate-400 transition-transform ${isSelected ? 'translate-x-0.5 text-amber-600' : ''}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CỘT PHẢI (40% - 5 COLS): STUDENT ONE-PAGER PROFILE (CHUẨN ATTIO / NOTION) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col overflow-hidden shadow-xs relative">
          {selectedStudent ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Profile Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${getAvatarColor(selectedStudent.name)}`}>
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-900">{selectedStudent.name}</h2>
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {selectedStudent.studentCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Học viên LT1 Education • THPT Marie Curie • Nhập học: {selectedStudent.joinDate || '15/08/2026'}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    selectedStudent.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    {selectedStudent.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                  </span>
                </div>

                {/* 2 Tab Navigator (Clean Attio style) */}
                <div className="flex border-b border-slate-200/80 mt-4 pt-1">
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className={`py-2 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                      activeTab === 'attendance'
                        ? 'border-amber-500 text-amber-800 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Chuyên cần & Điểm số
                  </button>
                  <button
                    onClick={() => setActiveTab('finance')}
                    className={`py-2 px-3 text-xs font-medium border-b-2 transition cursor-pointer ${
                      activeTab === 'finance'
                        ? 'border-amber-500 text-amber-800 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Học phí & Liên hệ phụ huynh
                  </button>
                </div>
              </div>

              {/* Tab Content 1: Chuyên cần & Điểm số */}
              {activeTab === 'attendance' && (
                <div className="p-5 space-y-5 flex-1">
                  {/* 4 Chuyên cần gần nhất */}
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" /> Chuyên cần 4 buổi gần nhất
                      </span>
                      {selectedStudent.consecutiveAbsences >= 2 ? (
                        <span className="text-rose-600 font-medium text-[11px]">Vắng 2 buổi liên tiếp</span>
                      ) : (
                        <span className="text-emerald-700 font-medium text-[11px]">Chuyên cần tốt</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      {recentAtt.map((att, idx) => {
                        const isPresent = att.status === 'present';
                        const isExcused = att.status === 'absent_excused';
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                                isPresent
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isExcused
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                              }`}
                              title={`${att.date}: ${isPresent ? 'Có mặt' : isExcused ? 'Có phép' : 'Vắng'}`}
                            >
                              {isPresent ? '✓' : isExcused ? 'P' : 'K'}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{att.date.split('-').slice(1).join('/')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Điểm kiểm tra */}
                  <div>
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <span className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Award size={13} className="text-slate-400" /> Điểm khảo sát gần nhất
                      </span>
                      <span className="text-[11px] text-slate-400">ĐGNL / THPT</span>
                    </div>

                    {recentScores.length > 0 ? (
                      <div className="space-y-2">
                        {recentScores.map((sc, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                            <div>
                              <div className="font-medium text-slate-800">{sc.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{sc.date}</div>
                            </div>
                            <div className="font-semibold text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 tabular-nums">
                              {sc.score} / {sc.maxScore}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                        Chưa có dữ liệu bài kiểm tra.
                      </div>
                    )}
                  </div>

                  {/* Ghi chú trợ giảng */}
                  <div>
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <span className="font-medium text-slate-800 flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-slate-400" /> Ghi chú trợ giảng
                      </span>
                      <button
                        onClick={handleSaveQuickNote}
                        className="text-[11px] text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                      >
                        Lưu ghi chú
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={quickNote || selectedStudent.note || ''}
                      onChange={e => setQuickNote(e.target.value)}
                      placeholder="Nhập ghi chú học tập, phản hồi của giáo viên..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab Content 2: Học phí & Liên hệ phụ huynh */}
              {activeTab === 'finance' && (
                <div className="p-5 space-y-5 flex-1">
                  {/* Học phí & nút QR */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">Tình trạng học phí</span>
                      <span className="text-xs text-slate-500 tabular-nums">
                        {selectedStudentInvoices.length} hóa đơn
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-[11px] text-slate-400">Công nợ hiện tại</div>
                        <div className="text-lg font-bold text-slate-900 tabular-nums">
                          1.200.000 <span className="text-xs font-normal text-slate-400">VNĐ</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickVietQR(selectedStudent)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard size={13} /> Xuất Smart VietQR
                      </button>
                    </div>
                  </div>

                  {/* Thông tin liên hệ phụ huynh */}
                  <div className="space-y-3 text-xs">
                    <div className="text-xs font-semibold text-slate-800">Thông tin liên hệ</div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phụ huynh:</span>
                        <strong className="text-slate-800">{selectedStudent.parentName || 'Chưa cập nhật'}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">SĐT Phụ huynh:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-900 font-semibold">{selectedStudent.parentPhone || '—'}</span>
                          <button
                            onClick={() => handleQuickZalo(selectedStudent)}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-medium transition cursor-pointer"
                          >
                            Báo Zalo
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">SĐT Học sinh:</span>
                        <span className="font-mono text-slate-700">{selectedStudent.phone || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Địa chỉ:</span>
                        <span className="text-slate-700 truncate max-w-[200px]">{selectedStudent.address || 'TP. Hồ Chí Minh'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions Drawer */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
                <button
                  onClick={() => onToggleStudentStatus(selectedStudent.id, selectedStudent.status === 'active' ? 'dropped' : 'active')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium transition cursor-pointer"
                >
                  {selectedStudent.status === 'active' ? 'Thôi học' : 'Tái nhập học'}
                </button>

                <button
                  onClick={() => handleOpenEditModal(selectedStudent)}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 size={13} /> Sửa chi tiết
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 m-auto">
              Chọn một học sinh từ danh sách để xem hồ sơ.
            </div>
          )}
        </div>
      </div>

      {/* FULL EDIT / ADD STUDENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <UserCheck size={16} className="text-amber-600" />
                {editingStudent ? `Chỉnh sửa: ${editingStudent.name}` : 'Thêm học sinh mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Mã học sinh (*)</label>
                  <input
                    type="text"
                    required
                    value={formData.studentCode}
                    onChange={e => setFormData({ ...formData, studentCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Họ và tên (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">SĐT học sinh</label>
                  <input
                    type="tel"
                    placeholder="0912..."
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Họ tên phụ huynh</label>
                  <input
                    type="text"
                    placeholder="Bố/Mẹ..."
                    value={formData.parentName}
                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">SĐT phụ huynh (Zalo)</label>
                  <input
                    type="tel"
                    placeholder="0903..."
                    value={formData.parentPhone}
                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Địa chỉ</label>
                  <input
                    type="text"
                    placeholder="Quận/Huyện..."
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Lớp đăng ký học</label>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  {classes.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
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
                        className="rounded border-slate-300 text-amber-600 cursor-pointer"
                      />
                      <span>{c.name} ({c.code})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Ghi chú</label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Ghi chú về học lực, mục tiêu điểm số..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium cursor-pointer"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
