import React, { useState } from 'react';
import {
  UserCircle,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  CreditCard,
  Award,
  Clock,
  BookOpen,
  QrCode,
  Smartphone,
  Monitor,
  Share2,
  Sparkles,
  Phone,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export default function ParentPortalView({
  students = [],
  classes = [],
  attendance = [],
  invoices = [],
  exams = [],
  makeups = [],
  onOpenVietQR
}) {
  const [selectedStudentCode, setSelectedStudentCode] = useState('HS24-001');
  const [inputCode, setInputCode] = useState('');
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile' | 'desktop'
  const [toastMessage, setToastMessage] = useState('');

  const currentStudent = students.find(
    s => s.studentCode.toLowerCase() === selectedStudentCode.toLowerCase()
  ) || students[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      const found = students.find(s => 
        s.studentCode.toLowerCase() === inputCode.trim().toLowerCase() ||
        s.phone?.includes(inputCode.trim()) ||
        s.parentPhone?.includes(inputCode.trim())
      );
      if (found) {
        setSelectedStudentCode(found.studentCode);
        showToast(`Đã tìm thấy hồ sơ học sinh: ${found.name} (${found.studentCode})`);
      } else {
        showToast('Không tìm thấy học sinh với mã hoặc số điện thoại này.');
      }
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const studentClasses = classes.filter(c => currentStudent?.classIds?.includes(c.id));
  const studentInvoices = invoices.filter(inv => inv.studentId === currentStudent?.id);
  const pendingInvoice = studentInvoices.find(inv => inv.status === 'unpaid' || inv.status === 'overdue') || studentInvoices[0];

  // Attendance summary
  const studentAttendanceRecords = [];
  attendance.forEach(att => {
    const entry = att.entries?.find(e => e.studentId === currentStudent?.id);
    if (entry) {
      studentAttendanceRecords.push({
        date: att.date,
        sessionName: att.sessionName,
        status: entry.status,
        note: entry.note
      });
    }
  });

  const totalSessions = studentAttendanceRecords.length || 8;
  const presentSessions = studentAttendanceRecords.filter(r => r.status === 'present').length || 7;
  const absentSessions = totalSessions - presentSessions;
  const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

  // Exams scores
  const scoreCards = [
    { label: 'Kiểm tra 15 phút (Đợt 1)', score: 9.0, max: 10, type: '15p', date: '10/09/2026', comment: 'Làm tốt trắc nghiệm nhận biết' },
    { label: 'Kiểm tra 1 tiết (Chương 1)', score: 8.5, max: 10, type: '1tiet', date: '22/09/2026', comment: 'Tính toán nhanh, cần cẩn thận phần tự luận' },
    { label: 'Khảo sát ĐGNL Đại học', score: 8.8, max: 10, type: 'dgnl', date: '25/09/2026', comment: 'Đạt top 10% lớp Toán nâng cao' },
  ];

  // Handle open VietQR for student
  const handleOpenStudentVietQR = () => {
    if (pendingInvoice && onOpenVietQR) {
      onOpenVietQR(pendingInvoice);
    } else if (onOpenVietQR) {
      onOpenVietQR({
        id: `inv-${currentStudent.id}`,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        studentCode: currentStudent.studentCode,
        className: studentClasses[0]?.name || 'TOAN10',
        finalAmount: 1200000,
        remainingAmount: 1200000,
        status: 'unpaid',
        invoiceCode: `HD26-${currentStudent.studentCode.replace('-', '')}`
      });
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-400/80 hover:text-emerald-300">✕</button>
        </div>
      )}

      {/* TOP CONTROLS & LOOKUP BAR */}
      <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-between gap-4 flex-wrap shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Smartphone size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Sổ Liên Lạc Điện Tử — Cổng Phụ Huynh & Học Sinh
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase flex items-center gap-1">
                <Sparkles size={11} /> Mobile-First Zalo View
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Giao diện chuẩn hóa hiển thị trên màn hình điện thoại khi phụ huynh mở từ link thông báo Zalo
            </p>
          </div>
        </div>

        {/* View Switcher: Mobile Phone Mockup vs Desktop Wide */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'mobile' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone size={13} /> Chế độ Điện thoại (Zalo Mobile)
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'desktop' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor size={13} /> Chế độ Máy tính (Desktop View)
            </button>
          </div>
        </div>
      </div>

      {/* QUICK SELECTOR PILLS & SEARCH */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-semibold">Chọn học sinh mẫu:</span>
          {students.slice(0, 5).map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStudentCode(s.studentCode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                currentStudent?.id === s.id
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{s.name}</span>
              <span className="font-mono text-[10px] opacity-75">({s.studentCode})</span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nhập mã HS hoặc SĐT..."
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            className="w-48 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition flex items-center gap-1"
          >
            <Search size={12} /> Tra cứu
          </button>
        </form>
      </div>

      {/* RENDER CONTENT: MOBILE FIRST VS DESKTOP */}
      {viewMode === 'mobile' ? (
        /* MOBILE VIEW CONTAINER (SMARTPHONE MOCKUP FRAME) */
        <div className="flex justify-center py-4">
          <div className="w-full max-w-[410px] bg-slate-950 rounded-[44px] p-3 shadow-2xl shadow-black/90 border-[6px] border-slate-800 relative">
            {/* Phone Speaker & Camera Notch */}
            <div className="w-32 h-5 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-800"></div>
              <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
            </div>

            {/* Smartphone Inner Screen */}
            <div className="bg-[#0B1120] rounded-[32px] overflow-hidden text-slate-100 flex flex-col max-h-[740px] overflow-y-auto border border-slate-800/80">
              {/* Zalo Web View Top Bar */}
              <div className="px-4 py-2.5 bg-blue-600/90 text-white flex items-center justify-between text-xs sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-1.5 font-bold">
                  <span>Zalo</span>
                  <span className="text-[10px] font-normal opacity-80">• LT1 Sổ Liên Lạc</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] opacity-90">
                  <Share2 size={13} />
                </div>
              </div>

              {/* Student Header Card */}
              <div className="p-4 bg-gradient-to-b from-slate-900 to-[#0B1120] border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-500/20">
                    {currentStudent?.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-white truncate">{currentStudent?.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-semibold">
                        {currentStudent?.studentCode}
                      </span>
                      <span className="text-[11px] text-slate-400">Marie Curie</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px]">Lớp đang học</span>
                    <p className="font-semibold text-slate-300 truncate">
                      {studentClasses.map(c => c.name).join(', ') || 'Toán Nâng Cao 10A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Giáo viên phụ trách</span>
                    <p className="font-semibold text-slate-300">ThS. Nguyễn Văn Thành</p>
                  </div>
                </div>
              </div>

              {/* Mobile Body Content */}
              <div className="p-4 space-y-4">
                {/* 1. THẺ HỌC PHÍ & SMART VIETQR CTA */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <CreditCard size={13} /> HỌC PHÍ THÁNG HIỆN TẠI
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                      Chưa thanh toán
                    </span>
                  </div>

                  <div className="text-xl font-black text-white tracking-tight">
                    1.200.000 <span className="text-xs text-slate-400 font-medium">VNĐ</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Hạn nộp: 05/10/2026 • Giảm 10% combo</p>

                  <button
                    onClick={handleOpenStudentVietQR}
                    className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    <QrCode size={15} /> Thanh toán ngay qua Smart VietQR
                  </button>
                </div>

                {/* 2. KẾT QUẢ HỌC TẬP & BIỂU ĐỒ CỘT ĐIỂM */}
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Award size={14} className="text-amber-400" /> Bảng Điểm & Khảo Sát
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Học lực: Giỏi
                    </span>
                  </div>

                  {/* Visual Score Bars */}
                  <div className="space-y-2.5">
                    {scoreCards.map((sc, i) => {
                      const pct = (sc.score / sc.max) * 100;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-medium text-[11px]">{sc.label}</span>
                            <span className="font-bold text-amber-400 font-mono text-xs">{sc.score} / {sc.max}</span>
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <div className="text-[10px] text-slate-400 italic">
                            "{sc.comment}"
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. CHUYÊN CẦN ĐIỂM DANH */}
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-400" /> Tình Hình Chuyên Cần
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {attendanceRate}% có mặt
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <div className="text-emerald-400 font-bold text-sm">{presentSessions}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Có mặt</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <div className="text-amber-400 font-bold text-sm">0</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Có phép</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <div className="text-rose-400 font-bold text-sm">{absentSessions}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Vắng</div>
                    </div>
                  </div>
                </div>

                {/* 4. NHẬN XÉT CỦA GIÁO VIÊN */}
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-amber-400" /> Nhận Xét Từ Thầy Cô
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                    "{currentStudent?.note || 'Học sinh có ý thức học tập rất tốt, nắm chắc các phương pháp giải toán nâng cao. Tiếp tục phát huy trong đợt thi thử sắp tới.'}"
                  </p>
                </div>

                {/* Footer hotline */}
                <div className="text-center text-[11px] text-slate-500 py-2">
                  Hotline Hỗ Trợ Phụ Huynh: <strong className="text-slate-300 font-mono">0912 345 678</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DESKTOP TABLET WIDE VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card 1: Học phí & VietQR */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard size={16} className="text-amber-400" /> Học Phí & Hóa Đơn Trực Tuyến
            </h3>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400">Tổng công nợ cần thanh toán:</div>
              <div className="text-2xl font-black text-amber-400 mt-1">1.200.000 VNĐ</div>
              <div className="text-xs text-slate-400 mt-1">Hạn nộp: 05/10/2026</div>
              <button
                onClick={handleOpenStudentVietQR}
                className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <QrCode size={16} /> Mở Smart VietQR Thanh Toán
              </button>
            </div>
          </div>

          {/* Card 2: Bảng điểm */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award size={16} className="text-amber-400" /> Điểm Số & Đánh Giá
            </h3>
            <div className="space-y-3">
              {scoreCards.map((sc, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">{sc.label}</span>
                    <span className="text-amber-400 font-mono font-bold">{sc.score} / {sc.max}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 italic">"{sc.comment}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Chuyên cần */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-amber-400" /> Chuyên Cần & Ghi Chú
            </h3>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Tỷ lệ chuyên cần:</span>
                <span className="text-emerald-400 font-bold">{attendanceRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số buổi có mặt:</span>
                <span className="text-slate-200 font-semibold">{presentSessions} buổi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số buổi vắng:</span>
                <span className="text-rose-400 font-semibold">{absentSessions} buổi</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-[11px]">Nhận xét của giáo viên:</span>
                <p className="text-slate-300 mt-1 italic">"{currentStudent?.note || 'Học sinh chăm ngoan, tiến bộ đều.'}"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
