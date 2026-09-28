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
  Share2,
  Phone,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  X
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
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
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
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Sổ liên lạc điện tử — Cổng phụ huynh & học sinh
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              Cổng tra cứu trực tuyến LT1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Phụ huynh có thể tra cứu kết quả học tập, chuyên cần và thanh toán học phí qua VietQR
          </p>
        </div>

        {/* Action Button: Open Zalo Preview Drawer */}
        <button
          onClick={() => setIsMobilePreviewOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Smartphone size={14} className="text-slate-500" />
          <span>Bản xem trước trên Zalo (Mobile Drawer)</span>
        </button>
      </div>

      {/* LOOKUP & PILLS BAR */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap text-xs shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-medium">Chọn học sinh mẫu:</span>
          {students.slice(0, 5).map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStudentCode(s.studentCode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                currentStudent?.id === s.id
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{s.name}</span>
              <span className="font-mono text-[10px] text-slate-400 ml-1">({s.studentCode})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nhập mã HS hoặc SĐT..."
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            className="w-48 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition cursor-pointer"
          >
            Tra cứu
          </button>
        </form>
      </div>

      {/* REAL RESPONSIVE FULL WEB PORTAL (NOT A FAKE IPHONE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Student Profile & Tuition (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Profile Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-base shrink-0">
                {currentStudent?.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{currentStudent?.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {currentStudent?.studentCode}
                  </span>
                  <span className="text-xs text-slate-500">THPT Marie Curie</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Lớp đăng ký:</span>
                <strong className="text-slate-800">
                  {studentClasses.map(c => c.name).join(', ') || 'Toán Nâng Cao 10A'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giáo viên phụ trách:</span>
                <span className="text-slate-700">ThS. Nguyễn Văn Thành</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phụ huynh:</span>
                <span className="text-slate-700">{currentStudent?.parentName || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SĐT nhận Zalo:</span>
                <span className="font-mono text-slate-800 font-medium">{currentStudent?.parentPhone || currentStudent?.phone}</span>
              </div>
            </div>
          </div>

          {/* Tuition Card with Smart VietQR CTA */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <CreditCard size={14} className="text-amber-600" /> Học phí tháng 9/2026
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-medium">
                Chưa thanh toán
              </span>
            </div>

            <div>
              <div className="text-xs text-slate-400">Số tiền cần đóng:</div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5 tabular-nums">
                1.200.000 <span className="text-xs font-normal text-slate-400">VNĐ</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Hạn nộp: 05/10/2026 • Giảm 10% combo môn</div>
            </div>

            <button
              onClick={handleOpenStudentVietQR}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode size={16} /> Thanh toán ngay qua Smart VietQR
            </button>
          </div>

          {/* Teacher's note */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-amber-600" /> Nhận xét từ giáo viên
            </div>
            <p className="text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
              "{currentStudent?.note || 'Học sinh chăm ngoan, tiếp thu bài nhanh, làm bài tập về nhà đầy đủ. Cần tiếp tục duy trì phong độ cho đợt thi thử ĐGNL sắp tới.'}"
            </p>
          </div>
        </div>

        {/* Right Column: Grades & Attendance (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Score Bars Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Award size={16} className="text-amber-600" /> Bảng điểm & kết quả khảo sát
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tiến độ điểm số các đợt kiểm tra gần nhất</p>
              </div>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                Xếp loại: Giỏi
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {scoreCards.map((sc, i) => {
                const pct = (sc.score / sc.max) * 100;
                return (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{sc.label}</span>
                        <span className="text-[11px] text-slate-400 font-mono ml-2">Ngày: {sc.date}</span>
                      </div>
                      <span className="font-bold text-slate-900 text-sm font-mono tabular-nums">{sc.score} / {sc.max}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>

                    <div className="text-[11px] text-slate-500 italic">
                      "{sc.comment}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance Overview Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Clock size={16} className="text-amber-600" /> Tình hình chuyên cần
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Theo dõi số buổi đi học và điểm danh thực tế</p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 font-mono tabular-nums bg-emerald-50 px-2.5 py-1 rounded-full">
                {attendanceRate}% có mặt
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-emerald-700 font-bold text-base tabular-nums">{presentSessions}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Số buổi có mặt</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-amber-700 font-bold text-base tabular-nums">0</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Nghỉ có phép</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-rose-700 font-bold text-base tabular-nums">{absentSessions}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">Vắng không phép</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE-OVER DRAWER: BẢN XEM TRƯỚC TRÊN ZALO MOBILE */}
      {isMobilePreviewOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-blue-600 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Smartphone size={16} />
                <span>Bản xem trước Zalo Mobile</span>
              </div>
              <button
                onClick={() => setIsMobilePreviewOpen(false)}
                className="p-1 rounded text-white/80 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Viewport Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 border border-amber-200 mx-auto flex items-center justify-center font-bold text-base">
                  {currentStudent?.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{currentStudent?.name}</h3>
                <div className="text-[11px] text-slate-500">{currentStudent?.studentCode} • Marie Curie</div>
              </div>

              {/* Tuition Mini Card */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Học phí tháng</span>
                  <span className="text-rose-600">Chưa đóng</span>
                </div>
                <div className="text-lg font-bold text-slate-900 tabular-nums">1.200.000 đ</div>
                <button
                  onClick={handleOpenStudentVietQR}
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-2xs"
                >
                  Quét VietQR
                </button>
              </div>

              {/* Score List */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                <div className="font-semibold text-slate-800">Điểm số đợt thi gần nhất</div>
                {scoreCards.map((sc, i) => (
                  <div key={i} className="flex justify-between text-[11px] py-1 border-b border-slate-100 last:border-0">
                    <span className="text-slate-600">{sc.label}</span>
                    <strong className="text-slate-900 tabular-nums">{sc.score} / {sc.max}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
