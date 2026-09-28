import React from 'react';
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  CreditCard,
  Calendar,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Send,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function ModernDashboardView({
  students,
  classes,
  attendance,
  invoices,
  makeups,
  setCurrentTab,
  onOpenStudentProfile,
  onOpenVietQR
}) {
  const activeStudents = students.filter(s => s.status === 'active');
  const alertStudents = students.filter(s => s.consecutiveAbsences >= 2);
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const pendingMakeups = makeups.filter(m => m.status === 'pending');

  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;
  const totalInvoicesCount = invoices.length;
  const collectionPercent = totalInvoicesCount > 0 ? Math.round((paidCount / totalInvoicesCount) * 100) : 0;

  const handleQuickZalo = (student) => {
    const text = `Kính gửi phụ huynh, em ${student.name} (${student.studentCode}) đã vắng mặt 2 buổi học gần nhất tại Trung tâm LT1. Xin phụ huynh vui lòng phản hồi để trung tâm bố trí lịch học bù kịp thời cho con. Trân trọng!`;
    navigator.clipboard.writeText(text);
    alert(`✓ Đã sao chép nội dung tin nhắn Zalo gửi Phụ Huynh ${student.name}!\n\n"${text}"`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KHỐI 1: ACTION REQUIRED (Việc cần làm ngay của Trợ giảng / Quản lý) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Ca học cần điểm danh ngay */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                CẦN ĐIỂM DANH NGAY
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock size={12} className="text-amber-400" /> 17:30 - 19:30
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Toán Nâng Cao 10A (T10-PRO)</h3>
            <p className="text-xs text-slate-400 mt-1">Phòng 201 • ThS. Nguyễn Văn Thành • Sĩ số: 30 HS</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setCurrentTab('attendance')}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
            >
              <Zap size={14} /> Vào điểm danh ca này
            </button>
          </div>
        </div>

        {/* 2. Cảnh báo học sinh vắng học liên tiếp */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                <AlertCircle size={12} /> CẢNH BÁO NGHỈ 2 BUỔI
              </span>
              <span className="text-xs text-rose-400 font-semibold">{alertStudents.length} học sinh</span>
            </div>
            <div className="space-y-2 text-xs">
              {alertStudents.slice(0, 2).map(st => (
                <div key={st.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-800">
                  <div>
                    <p
                      className="font-semibold text-slate-200 cursor-pointer hover:text-amber-400 transition"
                      onClick={() => onOpenStudentProfile(st)}
                    >
                      {st.name} ({st.studentCode})
                    </p>
                    <p className="text-[10px] text-rose-400 mt-0.5">Vắng 2 buổi liên tiếp không phép</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleQuickZalo(st)}
                      className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded text-[11px] font-medium transition"
                      title="Copy tin nhắn thông báo Zalo phụ huynh"
                    >
                      Báo Zalo
                    </button>
                    <button
                      onClick={() => setCurrentTab('makeup')}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[11px] font-medium transition"
                    >
                      Xếp bù
                    </button>
                  </div>
                </div>
              ))}
              {alertStudents.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  ✓ Toàn bộ học sinh chuyên cần tốt!
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('attendance')}
            className="w-full mt-3 py-1.5 text-center text-[11px] text-slate-400 hover:text-slate-200 transition"
          >
            Xem nhật ký điểm danh chi tiết →
          </button>
        </div>

        {/* 3. Học phí & Đối soát VietQR trong ngày */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-wider">THỰC THU THÁNG (VIETQR)</span>
              <span className="text-xs text-emerald-400 font-bold">+{totalPaid.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {paidCount}/{totalInvoicesCount} <span className="text-xs font-normal text-slate-400">hóa đơn hoàn thành ({collectionPercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                style={{ width: `${collectionPercent}%` }}
              ></div>
            </div>
            {overdueInvoices.length > 0 && (
              <div className="mt-3 text-[11px] text-rose-400 flex items-center justify-between">
                <span>⚠️ {overdueInvoices.length} hồ sơ quá hạn nộp học phí</span>
                <span className="font-bold">{overdueInvoices.reduce((s, i) => s + i.remainingAmount, 0).toLocaleString('vi-VN')} đ</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCurrentTab('tuition')}
            className="w-full mt-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5"
          >
            <CreditCard size={14} className="text-emerald-400" />
            Mở sổ thu học phí & VietQR Terminal
          </button>
        </div>
      </div>

      {/* KHỐI 2: DATA TABLE SẮP XẾP CA DẠY HÔM NAY (Linear-style table) */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white tracking-tight uppercase">LỊCH VẬN HÀNH CA DẠY HÔM NAY</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
              {classes.length} ca học
            </span>
          </div>
          <button
            onClick={() => setCurrentTab('schedule')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            Xem toàn bộ tuần <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">GIỜ HỌC</th>
                <th className="py-3 px-4">MÃ & TÊN LỚP HỌC</th>
                <th className="py-3 px-4">GIÁO VIÊN</th>
                <th className="py-3 px-4">PHÒNG</th>
                <th className="py-3 px-4">SĨ SỐ / ĐIỂM DANH</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {classes.map((cls, idx) => {
                const isFirst = idx === 0;
                return (
                  <tr key={cls.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-amber-400 font-semibold">
                      {cls.scheduleTime}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                          {cls.code}
                        </span>
                        <span>{cls.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{cls.subject} • Khóa luyện thi</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {cls.teacherId === 'tc-01' ? 'ThS. Nguyễn Văn Thành' : cls.teacherId === 'tc-02' ? 'ThS. Trần Thị Mai Lan' : 'ThS. Lê Hoàng Long'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">
                        {cls.room}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isFirst ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          Đang điểm danh (30 HS)
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">Ca chưa bắt đầu</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isFirst ? (
                        <button
                          onClick={() => setCurrentTab('attendance')}
                          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-semibold transition shadow-sm"
                        >
                          Điểm danh
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentTab('classes')}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition"
                        >
                          Chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* KHỐI 3: LEAN METRICS & PHỔ ĐIỂM KHẢO SÁT THI THỬ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phân bố phổ điểm thi thử gần nhất */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Phổ Điểm Khảo Sát ĐGNL / THPT Gần Nhất</h3>
            <span className="text-[11px] text-amber-400 font-mono">Toán 10A</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium">Xuất sắc (9.0 - 10.0)</span>
                <span className="font-bold text-white">2 học sinh (50%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[50%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-medium">Khá - Giỏi (7.0 - 8.9)</span>
                <span className="font-bold text-white">1 học sinh (25%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full w-[25%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-medium">Cần bổ trợ (&lt; 6.5)</span>
                <span className="font-bold text-white">1 học sinh (25%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full w-[25%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Trạng thái học bù & Chuyên cần */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Điều Phối Học Bù & Phụ Đạo</h3>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                {pendingMakeups.length} ca chờ học
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {pendingMakeups.map(mk => (
                <div key={mk.id} className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">{mk.studentName}</span>
                    <span className="text-slate-500 text-[11px] ml-2">Vắng: {mk.originalClassName}</span>
                    <div className="text-[11px] text-amber-400 mt-0.5">Xếp bù: {mk.targetClassName} ({mk.targetDate})</div>
                  </div>
                  <button
                    onClick={() => setCurrentTab('makeup')}
                    className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Xem lịch
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('makeup')}
            className="w-full mt-3 py-1.5 text-center text-[11px] text-slate-400 hover:text-slate-200 transition"
          >
            Mở toàn bộ danh sách điều phối học bù →
          </button>
        </div>
      </div>
    </div>
  );
}
