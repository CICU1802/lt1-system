import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Filter,
  DollarSign,
  Tag,
  Search,
  Check,
  Building2
} from 'lucide-react';

export default function TuitionView({
  invoices = [],
  students = [],
  classes = [],
  combos = [],
  onAddInvoice,
  onOpenVietQR,
  onConfirmPayment,
  onOpenStudentProfile
}) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'unpaid' | 'overdue' | 'paid'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Invoice creation form
  const [formData, setFormData] = useState({
    studentId: '',
    selectedClassIds: [],
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
  });

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus === 'unpaid' && (inv.status !== 'unpaid' && inv.status !== 'partial')) return false;
    if (filterStatus === 'overdue' && inv.status !== 'overdue') return false;
    if (filterStatus === 'paid' && inv.status !== 'paid') return false;
    return true;
  });

  // Calculate live amounts for form
  const selectedStudent = students.find(s => s.id === formData.studentId);
  const selectedClasses = classes.filter(c => formData.selectedClassIds.includes(c.id));
  const rawSum = selectedClasses.reduce((acc, c) => acc + (c.feePerMonth || 0), 0);
  
  let discountPct = 0;
  let comboName = 'Không áp dụng';
  if (selectedClasses.length >= 3) {
    discountPct = 15;
    comboName = 'Combo 3 môn (-15%)';
  } else if (selectedClasses.length === 2) {
    discountPct = 10;
    comboName = 'Combo 2 môn (-10%)';
  }
  const discountVal = (rawSum * discountPct) / 100;
  const finalSum = rawSum - discountVal;

  const handleOpenAdd = () => {
    const firstActive = students.find(s => s.status === 'active');
    setFormData({
      studentId: firstActive?.id || '',
      selectedClassIds: firstActive?.classIds || [],
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleToggleClass = (clsId) => {
    setFormData(prev => {
      const exists = prev.selectedClassIds.includes(clsId);
      if (exists) {
        return { ...prev, selectedClassIds: prev.selectedClassIds.filter(id => id !== clsId) };
      } else {
        return { ...prev, selectedClassIds: [...prev.selectedClassIds, clsId] };
      }
    });
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!formData.studentId || selectedClasses.length === 0) return;

    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceCode: `HD26-${String(invoices.length + 1).padStart(4, '0')}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentCode: selectedStudent.studentCode,
      classIds: formData.selectedClassIds,
      classNames: selectedClasses.map(c => `${c.name}`),
      rawAmount: rawSum,
      discountAmount: discountVal,
      discountReason: comboName,
      finalAmount: finalSum,
      paidAmount: 0,
      remainingAmount: finalSum,
      dueDate: formData.dueDate,
      paidDate: null,
      status: 'unpaid',
      bankTarget: 'MB Bank - 0918111222 (TRUNG TAM LT1)',
    };

    onAddInvoice(newInv);
    setIsModalOpen(false);
    showToast(`Đã tạo hóa đơn mới cho học sinh ${selectedStudent.name}.`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleSendReminderSMS = (inv) => {
    const classId = inv.classNames?.[0]?.split(' ')[0] || 'TOAN10';
    const cleanCode = (inv.studentCode || 'HS24-001').replace('-', '');
    const text = `Kính gửi phụ huynh, học phí tháng của em ${inv.studentName} (${inv.studentCode}) tại Trung tâm LT1 là ${inv.remainingAmount.toLocaleString('vi-VN')} đ (Hạn đóng: ${inv.dueDate}). Phụ huynh có thể chuyển khoản với cú pháp: LT1 ${cleanCode} ${classId}. Trân trọng!`;
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép tin nhắn nhắc học phí kèm cú pháp VietQR gửi phụ huynh em ${inv.studentName}!`);
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

      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap shadow-xs">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Sổ thu học phí, combo ưu đãi & Smart VietQR
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động cộng dồn học phí nhiều môn, chiết khấu combo 10% - 15%, tạo mã VietQR động chuẩn EMVCo
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} /> Tạo hóa đơn mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap text-xs shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterStatus === 'all' ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({invoices.length})
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterStatus === 'overdue' ? 'bg-rose-50 text-rose-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Quá hạn ({invoices.filter(i => i.status === 'overdue').length})
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterStatus === 'unpaid' ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chưa đóng ({invoices.filter(i => i.status === 'unpaid' || i.status === 'partial').length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterStatus === 'paid' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Đã hoàn thành ({invoices.filter(i => i.status === 'paid').length})
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-medium">
                <th className="py-2.5 px-4">Mã hóa đơn</th>
                <th className="py-2.5 px-4">Học sinh</th>
                <th className="py-2.5 px-4">Lớp đăng ký</th>
                <th className="py-2.5 px-4">Ưu đãi</th>
                <th className="py-2.5 px-4">Tổng phải thu</th>
                <th className="py-2.5 px-4">Còn nợ</th>
                <th className="py-2.5 px-4">Hạn đóng</th>
                <th className="py-2.5 px-4">Trạng thái</th>
                <th className="py-2.5 px-4 text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400">
                    Không có hóa đơn nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const isOverdue = inv.status === 'overdue';

                  return (
                    <tr key={inv.id} className={isOverdue ? 'bg-rose-50/30' : 'hover:bg-slate-50/60 transition'}>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {inv.invoiceCode}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className="font-medium text-slate-900 cursor-pointer hover:text-amber-700 transition"
                          onClick={() => {
                            const st = students.find(s => s.id === inv.studentId);
                            if (st) onOpenStudentProfile(st);
                          }}
                        >
                          {inv.studentName}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{inv.studentCode}</div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600 max-w-[200px] truncate">
                        {inv.classNames.join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        {inv.discountAmount > 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                            -{inv.discountAmount.toLocaleString('vi-VN')} đ
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 tabular-nums">
                        {inv.finalAmount.toLocaleString('vi-VN')} đ
                      </td>
                      <td className="py-3 px-4 font-semibold tabular-nums text-slate-900">
                        <span className={inv.remainingAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                          {inv.remainingAmount.toLocaleString('vi-VN')} đ
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {inv.dueDate}
                      </td>
                      <td className="py-3 px-4">
                        {inv.status === 'paid' && <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium">Đã đóng</span>}
                        {inv.status === 'partial' && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">Đóng 1 phần</span>}
                        {inv.status === 'unpaid' && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">Chưa đóng</span>}
                        {inv.status === 'overdue' && <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-medium">Quá hạn</span>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.remainingAmount > 0 && (
                            <>
                              <button
                                onClick={() => onOpenVietQR(inv)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                title="Mở mã QR thanh toán"
                              >
                                <QrCode size={13} /> VietQR
                              </button>

                              <button
                                onClick={() => handleSendReminderSMS(inv)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition flex items-center gap-1 cursor-pointer"
                                title="Nhắc nợ Zalo"
                              >
                                <Send size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 text-slate-800 text-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard size={16} className="text-amber-600" /> Tạo hóa đơn học phí mới
            </h3>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Chọn học sinh (*)</label>
                <select
                  value={formData.studentId}
                  onChange={e => {
                    const st = students.find(s => s.id === e.target.value);
                    setFormData({
                      ...formData,
                      studentId: e.target.value,
                      selectedClassIds: st?.classIds || []
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                >
                  {students.filter(s => s.status === 'active').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Các môn đăng ký đóng học phí</label>
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 max-h-36 overflow-y-auto">
                  {classes.map(c => (
                    <label key={c.id} className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-white text-slate-700">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.selectedClassIds.includes(c.id)}
                          onChange={() => handleToggleClass(c.id)}
                          className="rounded border-slate-300 text-amber-600 cursor-pointer"
                        />
                        <span>{c.name} ({c.code})</span>
                      </div>
                      <span className="font-semibold tabular-nums text-slate-900">
                        {c.feePerMonth?.toLocaleString('vi-VN')} đ
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Live Combo Calculation */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Tổng học phí gốc:</span>
                  <span className="font-medium tabular-nums">{rawSum.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-amber-800 font-medium">
                  <span>Ưu đãi áp dụng ({comboName}):</span>
                  <span className="tabular-nums">-{discountVal.toLocaleString('vi-VN')} đ ({discountPct}%)</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-amber-200 text-sm">
                  <span>Thực thu hóa đơn:</span>
                  <span className="tabular-nums">{finalSum.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Hạn thanh toán</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
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
                  Tạo hóa đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
