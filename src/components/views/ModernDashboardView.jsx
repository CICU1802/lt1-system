import React from 'react';
import {
  Clock,
  AlertCircle,
  CreditCard,
  Calendar,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Send,
  Zap,
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function ModernDashboardView({
  students = [],
  classes = [],
  attendance = [],
  invoices = [],
  makeups = [],
  setCurrentTab,
  onOpenStudentProfile,
  onOpenVietQR
}) {
  const activeStudents = students.filter(s => s.status === 'active');
  const alertStudents = students.filter(s => s.consecutiveAbsences >= 2);
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const pendingMakeups = makeups.filter(m => m.status === 'pending');

  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalReceivable = invoices.reduce((sum, inv) => sum + (inv.finalAmount || 0), 0);
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;
  const collectionPercent = invoices.length > 0 ? Math.round((paidCount / invoices.length) * 100) : 0;

  const handleQuickZalo = (student) => {
    const text = `Kính gửi phụ huynh, em ${student.name} (${student.studentCode}) đã vắng mặt 2 buổi học gần nhất tại Trung tâm LT1. Xin phụ huynh vui lòng phản hồi để trung tâm bố trí lịch học bù kịp thời cho con. Trân trọng!`;
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép tin nhắn Zalo gửi phụ huynh em ${student.name}!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. KHỐI TÁC VỤ CẦN XỬ LÝ (ACTION REQUIRED HUB) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Ca học cần điểm danh */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between relative">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Cần điểm danh hôm nay
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={12} className="text-slate-400" /> 17:30 - 19:30
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Toán Nâng Cao 10A</h3>
            <p className="text-xs text-slate-500 mt-1">Phòng 201 • ThS. Nguyễn Văn Thành • Sĩ số: 30 học sinh</p>
          </div>
          <div className="mt-5">
            <button
              onClick={() => setCurrentTab('attendance')}
              className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap size={14} /> Vào điểm danh ca này
            </button>
          </div>
        </div>

        {/* Cảnh báo học sinh nghỉ học liên tiếp */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/60 flex items-center gap-1.5">
                <AlertCircle size={12} className="text-rose-600" /> Cảnh báo nghỉ học
              </span>
              <span className="text-xs text-rose-700 font-medium">{alertStudents.length} học sinh</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {alertStudents.slice(0, 2).map(st => (
                <div key={st.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p
                      className="font-medium text-slate-800 cursor-pointer hover:text-amber-700 transition"
                      onClick={() => onOpenStudentProfile(st)}
                    >
                      {st.name} <span className="font-mono text-[11px] text-slate-400">({st.studentCode})</span>
                    </p>
                    <p className="text-[11px] text-rose-600 mt-0.5">Vắng 2 buổi liên tiếp</p>
                  </div>
                  <button
                    onClick={() => handleQuickZalo(st)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium transition cursor-pointer"
                    title="Sao chép tin nhắn Zalo"
                  >
                    Báo Zalo
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100">
            <button
              onClick={() => setCurrentTab('students')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center justify-between w-full"
            >
              <span>Xem danh sách học sinh</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Công nợ học phí quá hạn */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1.5">
                <CreditCard size={12} className="text-amber-600" /> Học phí quá hạn
              </span>
              <span className="text-xs text-slate-500">{overdueInvoices.length} hóa đơn</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {overdueInvoices.slice(0, 2).map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-medium text-slate-800">{inv.studentName}</p>
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      {inv.remainingAmount.toLocaleString('vi-VN')} đ • Hạn {inv.dueDate}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenVietQR(inv)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-medium transition shadow-2xs cursor-pointer"
                  >
                    Gửi QR
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-100">
            <button
              onClick={() => setCurrentTab('tuition')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center justify-between w-full"
            >
              <span>Xem sổ thu học phí</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. LỊCH VẬN HÀNH HÔM NAY & DÒNG TIỀN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lịch dạy trong ngày (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Lịch dạy trong ngày</h2>
              <p className="text-xs text-slate-500 mt-0.5">Thứ Hai, ngày 28/09/2026 • 4 ca giảng dạy</p>
            </div>
            <button
              onClick={() => setCurrentTab('schedule')}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
            >
              <span>Xem thời khóa biểu tuần</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-100">
                  <th className="py-2.5 px-4">Ca dạy</th>
                  <th className="py-2.5 px-4">Lớp học</th>
                  <th className="py-2.5 px-4">Giáo viên & Trợ giảng</th>
                  <th className="py-2.5 px-4 text-center">Sĩ số</th>
                  <th className="py-2.5 px-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.slice(0, 4).map((c, i) => {
                  const isCurrent = i === 0;
                  const isDone = i === 1;
                  return (
                    <tr key={c.id} className={isCurrent ? 'bg-amber-50/30' : 'hover:bg-slate-50/60 transition'}>
                      <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                        <span>{c.scheduleTime}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{c.code} • Phòng {c.room}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">ThS. Nguyễn Văn Thành</div>
                        <div className="text-[11px] text-slate-400">Trợ giảng: Bùi Minh Đức</div>
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums font-medium text-slate-700">
                        {c.maxCapacity - 2} / {c.maxCapacity}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 font-medium text-[11px]">
                            Đang diễn ra
                          </span>
                        ) : isDone ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium text-[11px]">
                            Đã chốt sổ
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
                            Sắp bắt đầu
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dòng tiền & Tỷ lệ thu học phí (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Dòng tiền & học phí</h2>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Tháng 9/2026</span>
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-500">Thực thu đã ghi nhận</div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1 tabular-nums">
                {totalPaid.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">VNĐ</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 tabular-nums">
                Tổng dự kiến: {totalReceivable.toLocaleString('vi-VN')} đ
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>Tiến độ thu học phí</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{collectionPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${collectionPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Học sinh đang theo học</span>
                <span className="font-semibold text-slate-800 tabular-nums">{activeStudents.length} học sinh</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Yêu cầu học bù chưa xếp</span>
                <span className="font-semibold text-amber-700 tabular-nums">{pendingMakeups.length} yêu cầu</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Lớp học đang mở</span>
                <span className="font-semibold text-slate-800 tabular-nums">{classes.filter(c => !c.isArchived).length} lớp</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentTab('tuition')}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition border border-slate-200/60 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Vào sổ thu học phí</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
