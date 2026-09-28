import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Filter,
  DollarSign,
  Tag,
  Search,
  Check
} from 'lucide-react';

export default function TuitionView({
  invoices,
  students,
  classes,
  combos,
  onAddInvoice,
  onOpenVietQR,
  onConfirmPayment,
  onOpenStudentProfile
}) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'unpaid' | 'overdue' | 'paid'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [smsNotificationMsg, setSmsNotificationMsg] = useState('');

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
  
  // Calculate combo discount: 2 classes -> 10%, 3+ classes -> 15%
  let discountPct = 0;
  let comboName = 'Không áp dụng';
  if (selectedClasses.length >= 3) {
    discountPct = 15;
    comboName = 'Combo Vàng 3 môn (-15%)';
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
      classNames: selectedClasses.map(c => `${c.name} (${c.feePerMonth?.toLocaleString('vi-VN')}đ)`),
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
  };

  const handleSendReminderSMS = (inv) => {
    const classId = inv.classNames?.[0]?.split(' ')[0] || 'TOAN10';
    const cleanCode = (inv.studentCode || 'HS24-001').replace('-', '');
    const text = `Kính gửi phụ huynh, học phí tháng của em ${inv.studentName} (${inv.studentCode}) tại Trung tâm LT1 là ${inv.remainingAmount.toLocaleString('vi-VN')} đ (Hạn đóng: ${inv.dueDate}). Phụ huynh có thể quét mã VietQR hoặc chuyển khoản cú pháp: LT1 ${cleanCode} ${classId}. Trân trọng!`;
    navigator.clipboard.writeText(text);
    setSmsNotificationMsg(`Đã sao chép tin nhắn nhắc học phí kèm cú pháp VietQR gửi phụ huynh em ${inv.studentName}!`);
    setTimeout(() => setSmsNotificationMsg(''), 4500);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CreditCard size={24} color="var(--brand-blue)" />
            Học Phí, Combo Ưu Đãi & QR Thanh Toán Động
          </h1>
          <p className="page-description">
            Tự động cộng dồn học phí nhiều môn, chiết khấu combo 10% - 15%, tạo mã VietQR động đúng số tiền và theo dõi nhắc nợ.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Tạo Hóa Đơn Mới
        </button>
      </div>

      {smsNotificationMsg && (
        <div style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', padding: '12px 18px', borderRadius: 'var(--radius-md)', color: '#065f46', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {smsNotificationMsg}
        </div>
      )}

      {/* Filter Tabs (Item 30: Danh sách học sinh chưa đóng / quá hạn) */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '14px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('all')}
          >
            Tất Cả ({invoices.length})
          </button>
          <button
            className={`btn btn-sm ${filterStatus === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ color: filterStatus === 'overdue' ? '#ffffff' : 'var(--color-danger)' }}
            onClick={() => setFilterStatus('overdue')}
          >
            <AlertTriangle size={14} /> Danh Sách Quá Hạn ({invoices.filter(i => i.status === 'overdue').length})
          </button>
          <button
            className={`btn btn-sm ${filterStatus === 'unpaid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('unpaid')}
          >
            <Clock size={14} /> Chưa Đóng / Đóng Một Phần ({invoices.filter(i => i.status === 'unpaid' || i.status === 'partial').length})
          </button>
          <button
            className={`btn btn-sm ${filterStatus === 'paid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('paid')}
          >
            <CheckCircle size={14} /> Đã Hoàn Thành ({invoices.filter(i => i.status === 'paid').length})
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="card">
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Mã Hóa Đơn</th>
                <th>Học Sinh</th>
                <th>Lớp / Môn Đăng Ký</th>
                <th>Học Phí Gốc</th>
                <th>Ưu Đãi Combo</th>
                <th>Tổng Phải Thu</th>
                <th>Còn Nợ</th>
                <th>Hạn Đóng</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Không có hóa đơn nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const isOverdue = inv.status === 'overdue';

                  return (
                    <tr key={inv.id} className={isOverdue ? 'row-danger' : ''}>
                      <td>
                        <strong>{inv.invoiceCode}</strong>
                      </td>
                      <td>
                        <div
                          style={{ fontWeight: '700', color: 'var(--brand-navy)', cursor: 'pointer' }}
                          onClick={() => {
                            const st = students.find(s => s.id === inv.studentId);
                            if (st) onOpenStudentProfile(st);
                          }}
                        >
                          {inv.studentName}
                        </div>
                        <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                          {inv.studentCode}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', maxWidth: '200px' }}>
                        {inv.classNames.join(', ')}
                      </td>
                      <td>{inv.rawAmount.toLocaleString('vi-VN')} đ</td>
                      <td>
                        {inv.discountAmount > 0 ? (
                          <div>
                            <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                              -{inv.discountAmount.toLocaleString('vi-VN')} đ
                            </span>
                            <div style={{ fontSize: '10.5px', color: 'var(--brand-blue)', marginTop: '2px' }}>
                              {inv.discountReason}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontSize: '14px', color: 'var(--brand-navy)' }}>
                          {inv.finalAmount.toLocaleString('vi-VN')} đ
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: inv.remainingAmount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                          {inv.remainingAmount.toLocaleString('vi-VN')} đ
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '12.5px', color: isOverdue ? 'var(--color-danger)' : 'var(--text-secondary)', fontWeight: isOverdue ? '700' : '500' }}>
                          {inv.dueDate}
                        </div>
                      </td>
                      <td>
                        {inv.status === 'paid' && <span className="badge badge-success">✓ Đã đóng</span>}
                        {inv.status === 'partial' && <span className="badge badge-warning">Đóng 1 phần</span>}
                        {inv.status === 'unpaid' && <span className="badge badge-gray">Chưa đóng</span>}
                        {inv.status === 'overdue' && <span className="badge badge-danger">⚠️ Quá hạn</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* VietQR Button (Item 27) */}
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenVietQR(inv)}
                            title="Tạo mã VietQR đúng số tiền thanh toán"
                          >
                            <QrCode size={13} /> Mã QR
                          </button>

                          {/* Reminder button for unpaid/overdue (Item 29) */}
                          {inv.status !== 'paid' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#b45309' }}
                              onClick={() => handleSendReminderSMS(inv)}
                              title="Gửi nhắc học phí đến phụ huynh"
                            >
                              <Send size={13} /> Nhắc
                            </button>
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

      {/* Create Invoice Modal with Auto-Combo Calculation */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-content-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Tạo Hóa Đơn Thu Học Phí & Đăng Ký Lớp</div>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Chọn Học Sinh *</label>
                    <select
                      className="form-control"
                      value={formData.studentId}
                      onChange={e => {
                        const st = students.find(s => s.id === e.target.value);
                        setFormData({
                          ...formData,
                          studentId: e.target.value,
                          selectedClassIds: st?.classIds || []
                        });
                      }}
                      required
                    >
                      {students.filter(s => s.status === 'active').map(st => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.studentCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hạn Chót Thanh Toán *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.dueDate}
                      onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Class Selection */}
                <div className="form-group">
                  <label className="form-label">Tích Chọn Các Lớp Đăng Ký (Tự động cộng dồn & tính ưu đãi)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', border: '1px solid var(--border-color)', padding: '14px', borderRadius: 'var(--radius-md)', maxHeight: '180px', overflowY: 'auto' }}>
                    {classes.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: formData.selectedClassIds.includes(c.id) ? 'var(--brand-blue-subtle)' : 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                          <input
                            type="checkbox"
                            checked={formData.selectedClassIds.includes(c.id)}
                            onChange={() => handleToggleClass(c.id)}
                          />
                          <span><strong>{c.code}</strong> - {c.name}</span>
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--brand-blue)' }}>
                          {c.feePerMonth?.toLocaleString('vi-VN')} đ
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Auto Calculated Invoice Summary (Requirements 23, 24, 25) */}
                <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-navy)', marginBottom: '10px' }}>
                    Bảng Kê Chi Tiết Học Phí (Tự Động Tính):
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tổng học phí gốc ({selectedClasses.length} lớp):</span>
                    <strong>{rawSum.toLocaleString('vi-VN')} đ</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: 'var(--brand-blue)' }}>
                    <span>Chương trình ưu đãi combo:</span>
                    <strong>
                      {discountPct > 0 ? `${comboName} (-${discountVal.toLocaleString('vi-VN')} đ)` : 'Chưa áp dụng (Đăng ký từ 2 môn giảm 10%)'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', borderTop: '1px dashed var(--border-color)', paddingTop: '10px', marginTop: '10px', color: 'var(--brand-navy)' }}>
                    <span>Tổng tiền phải thanh toán:</span>
                    <span style={{ color: 'var(--brand-blue)', fontSize: '18px' }}>
                      {finalSum.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={selectedClasses.length === 0}>
                  Xác Nhận Xuất Hóa Đơn & Sinh Mã QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
