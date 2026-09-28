import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  GraduationCap,
  CreditCard,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  RotateCcw
} from 'lucide-react';

export default function StudentProfileModal({
  student,
  classes,
  attendance,
  makeups,
  invoices,
  exams,
  onClose,
  onOpenVietQR,
  onReEnrollStudent
}) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!student) return null;

  // Filter student-specific records
  const studentClasses = classes.filter(c => student.classIds?.includes(c.id));
  const studentInvoices = invoices.filter(inv => inv.studentId === student.id);
  const studentMakeups = makeups.filter(m => m.studentId === student.id);
  
  // Calculate attendance stats
  let totalAttended = 0;
  let totalAbsentExcused = 0;
  let totalAbsentUnexcused = 0;
  
  attendance.forEach(att => {
    const entry = att.entries.find(e => e.studentId === student.id);
    if (entry) {
      if (entry.status === 'present') totalAttended++;
      else if (entry.status === 'absent_excused') totalAbsentExcused++;
      else if (entry.status === 'absent_unexcused') totalAbsentUnexcused++;
    }
  });

  // Collect exam scores
  const studentScores = [];
  exams.forEach(ex => {
    const sc = ex.scores.find(s => s.studentId === student.id);
    if (sc) {
      studentScores.push({
        examTitle: ex.title,
        date: ex.date,
        score: sc.score,
        comment: sc.comment,
        className: ex.className,
      });
    }
  });

  const totalTuitionDebt = studentInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.remainingAmount, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-blue" style={{ fontSize: '13px' }}>
              MÃ ĐỊNH DANH: {student.studentCode}
            </span>
            <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
              {student.status === 'active' ? 'Đang theo học' : 'Đã nghỉ'}
            </span>
            {student.consecutiveAbsences >= 2 && (
              <span className="badge badge-danger">
                ⚠️ CẢNH BÁO NGHỈ {student.consecutiveAbsences} BUỔI LIÊN TIẾP
              </span>
            )}
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Profile Hero Header */}
          <div className="profile-hero">
            <div className="profile-avatar">
              {student.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{student.name}</h2>
                {student.status === 'dropped' && onReEnrollStudent && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => onReEnrollStudent(student.id)}
                  >
                    <RotateCcw size={14} /> Kích hoạt lại (Quay lại học)
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '8px', flexWrap: 'wrap', fontSize: '13px', opacity: 0.9 }}>
                <span>📞 Học sinh: {student.phone || 'Chưa cập nhật'}</span>
                <span>👨‍👩‍👧 Phụ huynh: {student.parentName} ({student.parentPhone})</span>
                <span>🏠 Địa chỉ: {student.address}</span>
              </div>
              <div style={{ fontSize: '12px', marginTop: '6px', color: '#cbd5e1' }}>
                📅 Ngày nhập học: {student.joinDate} | Ghi chú: {student.note || 'Không có'}
              </div>
            </div>
          </div>

          {/* Red Alert warning bar if applicable */}
          {student.consecutiveAbsences >= 2 && (
            <div className="alert-banner">
              <div className="alert-banner-content">
                <AlertTriangle size={20} color="var(--color-danger)" />
                <div>
                  <div className="alert-banner-title">
                    Cảnh Báo Đỏ Điểm Danh: Nghỉ liên tiếp {student.consecutiveAbsences} buổi
                  </div>
                  <div className="alert-banner-desc">
                    {student.alertReason || 'Hệ thống tự động phát hiện học sinh vắng 2 buổi liên tiếp gần nhất chưa hoàn thành lịch bù. Cần kiểm tra ngay.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <GraduationCap size={16} /> Lớp & Lịch Học ({studentClasses.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              <Calendar size={16} /> Điểm Danh & Chuyên Cần
            </button>
            <button
              className={`tab-btn ${activeTab === 'makeup' ? 'active' : ''}`}
              onClick={() => setActiveTab('makeup')}
            >
              <RotateCcw size={16} /> Lịch Học Bù ({studentMakeups.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'tuition' ? 'active' : ''}`}
              onClick={() => setActiveTab('tuition')}
            >
              <CreditCard size={16} /> Học Phí & Hóa Đơn ({studentInvoices.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'grades' ? 'active' : ''}`}
              onClick={() => setActiveTab('grades')}
            >
              <Award size={16} /> Sổ Điểm ({studentScores.length})
            </button>
          </div>

          {/* Tab 1: Overview & Classes */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {studentClasses.map(cls => (
                  <div key={cls.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--bg-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="badge badge-blue">{cls.code}</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-blue)' }}>
                        {cls.feePerMonth?.toLocaleString('vi-VN')} đ/tháng
                      </span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--brand-navy)', marginBottom: '6px' }}>
                      {cls.name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>🕒 Lịch học: <strong>{cls.scheduleDays.join(', ')} ({cls.scheduleTime})</strong></div>
                      <div>🏫 Phòng: {cls.room}</div>
                      <div>👨‍🏫 GV: {cls.teacherId === 'tc-01' ? 'ThS. Nguyễn Văn Thành' : cls.teacherId === 'tc-02' ? 'ThS. Trần Thị Mai Lan' : 'ThS. Lê Hoàng Long'}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats Box */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#ffffff', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tỷ Lệ Chuyên Cần</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--brand-navy)' }}>
                    {totalAttended + totalAbsentExcused + totalAbsentUnexcused > 0
                      ? `${Math.round((totalAttended / (totalAttended + totalAbsentExcused + totalAbsentUnexcused)) * 100)}%`
                      : '100%'}
                  </div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Công Nợ Hiện Tại</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: totalTuitionDebt > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {totalTuitionDebt.toLocaleString('vi-VN')} đ
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Điểm TB Các Bài Thi</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--brand-blue)' }}>
                    {studentScores.length > 0
                      ? (studentScores.reduce((acc, s) => acc + s.score, 0) / studentScores.length).toFixed(1)
                      : 'Chưa có'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Attendance */}
          {activeTab === 'attendance' && (
            <div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className="badge badge-success">Có mặt: {totalAttended} buổi</div>
                <div className="badge badge-warning">Vắng có phép: {totalAbsentExcused} buổi</div>
                <div className="badge badge-danger">Vắng không phép: {totalAbsentUnexcused} buổi</div>
              </div>

              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Ngày Học</th>
                      <th>Lớp</th>
                      <th>Chủ Đề Buổi Học</th>
                      <th>Trạng Thái</th>
                      <th>Ghi Chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map(att => {
                      const entry = att.entries.find(e => e.studentId === student.id);
                      if (!entry) return null;
                      const cls = classes.find(c => c.id === att.classId);
                      return (
                        <tr key={att.id} className={entry.status === 'absent_unexcused' ? 'row-danger' : ''}>
                          <td><strong>{att.date}</strong></td>
                          <td>{cls?.name || att.classId}</td>
                          <td>{att.sessionName}</td>
                          <td>
                            {entry.status === 'present' && <span className="badge badge-success">Có mặt (X)</span>}
                            {entry.status === 'absent_excused' && <span className="badge badge-warning">Vắng phép (P)</span>}
                            {entry.status === 'absent_unexcused' && <span className="badge badge-danger">Vắng không phép (K)</span>}
                          </td>
                          <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{entry.note || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Makeup Classes */}
          {activeTab === 'makeup' && (
            <div>
              {studentMakeups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Học sinh chưa có lịch học bù nào.
                </div>
              ) : (
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Buổi Gốc (Vắng)</th>
                        <th>Lý Do</th>
                        <th>Buổi Học Bù Sắp Xếp</th>
                        <th>Thời Gian Bù</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentMakeups.map(mk => (
                        <tr key={mk.id}>
                          <td>
                            <strong>{mk.originalClassName}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ngày vắng: {mk.originalDate}</div>
                          </td>
                          <td style={{ fontSize: '12.5px' }}>{mk.reason}</td>
                          <td>
                            <strong>{mk.targetClassName}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--brand-blue)' }}>Ngày bù: {mk.targetDate}</div>
                          </td>
                          <td>{mk.targetTime}</td>
                          <td>
                            <span className={`badge ${mk.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                              {mk.status === 'completed' ? 'Đã học bù' : 'Chưa học bù'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Tuition & Invoices */}
          {activeTab === 'tuition' && (
            <div>
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Mã Hóa Đơn</th>
                      <th>Lớp Đăng Ký</th>
                      <th>Tổng Tiền</th>
                      <th>Ưu Đãi / Combo</th>
                      <th>Phải Đóng</th>
                      <th>Còn Nợ</th>
                      <th>Hạn Đóng</th>
                      <th>Trạng Thái</th>
                      <th>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentInvoices.map(inv => (
                      <tr key={inv.id} className={inv.status === 'overdue' ? 'row-danger' : ''}>
                        <td><strong>{inv.invoiceCode}</strong></td>
                        <td style={{ fontSize: '12px' }}>{inv.classNames.join(', ')}</td>
                        <td>{inv.rawAmount.toLocaleString('vi-VN')} đ</td>
                        <td>
                          {inv.discountAmount > 0 ? (
                            <span className="badge badge-blue">-{inv.discountAmount.toLocaleString('vi-VN')} đ</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td><strong>{inv.finalAmount.toLocaleString('vi-VN')} đ</strong></td>
                        <td style={{ color: inv.remainingAmount > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: '700' }}>
                          {inv.remainingAmount.toLocaleString('vi-VN')} đ
                        </td>
                        <td>{inv.dueDate}</td>
                        <td>
                          {inv.status === 'paid' && <span className="badge badge-success">Đã hoàn thành</span>}
                          {inv.status === 'partial' && <span className="badge badge-warning">Đóng một phần</span>}
                          {inv.status === 'unpaid' && <span className="badge badge-gray">Chưa đóng</span>}
                          {inv.status === 'overdue' && <span className="badge badge-danger">Quá hạn</span>}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenVietQR && onOpenVietQR(inv)}
                          >
                            <CreditCard size={12} /> VietQR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Gradebook */}
          {activeTab === 'grades' && (
            <div>
              {studentScores.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Chưa có dữ liệu bài kiểm tra.
                </div>
              ) : (
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Ngày Kiểm Tra</th>
                        <th>Lớp</th>
                        <th>Nội Dung Bài Kiểm Tra</th>
                        <th>Điểm Số</th>
                        <th>Nhận Xét Của Giáo Viên</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentScores.map((sc, i) => (
                        <tr key={i}>
                          <td>{sc.date}</td>
                          <td><strong>{sc.className}</strong></td>
                          <td>{sc.examTitle}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: '800',
                                fontSize: '15px',
                                background: sc.score >= 8 ? 'var(--color-success-bg)' : sc.score >= 6.5 ? 'var(--brand-blue-subtle)' : 'var(--color-warning-bg)',
                                color: sc.score >= 8 ? 'var(--color-success)' : sc.score >= 6.5 ? 'var(--brand-blue)' : 'var(--color-warning)'
                              }}
                            >
                              {sc.score} / 10
                            </span>
                          </td>
                          <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{sc.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng Hồ Sơ
          </button>
        </div>
      </div>
    </div>
  );
}
