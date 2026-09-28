import React, { useState } from 'react';
import {
  UserCircle,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  CreditCard,
  Award,
  Clock,
  BookOpen,
  QrCode
} from 'lucide-react';

export default function ParentPortalView({
  students,
  classes,
  attendance,
  invoices,
  exams,
  makeups,
  onOpenVietQR
}) {
  const [selectedStudentCode, setSelectedStudentCode] = useState('HS24-001');
  const [inputCode, setInputCode] = useState('');

  const currentStudent = students.find(
    s => s.studentCode.toLowerCase() === selectedStudentCode.toLowerCase()
  ) || students[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setSelectedStudentCode(inputCode.trim());
    }
  };

  const studentClasses = classes.filter(c => currentStudent?.classIds?.includes(c.id));
  const studentInvoices = invoices.filter(inv => inv.studentId === currentStudent?.id);
  const studentMakeups = makeups.filter(m => m.studentId === currentStudent?.id);

  // Attendance records
  const studentAttendance = attendance.filter(a =>
    a.entries.some(e => e.studentId === currentStudent?.id)
  );

  // Scores
  const studentScores = [];
  exams.forEach(ex => {
    const sc = ex.scores.find(s => s.studentId === currentStudent?.id);
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

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UserCircle size={26} color="var(--brand-blue)" />
            Cổng Tra Cứu Thông Tin Học Sinh & Phụ Huynh
          </h1>
          <p className="page-description">
            Tra cứu kết quả học tập, tình hình chuyên cần điểm danh từng buổi, lịch thi và học phí trực tuyến LT1 Education.
          </p>
        </div>

        {/* Quick Student Selector */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-control"
            style={{ width: '220px' }}
            placeholder="Nhập mã HS (ví dụ: HS24-001)..."
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={14} /> Tra Cứu
          </button>
        </form>
      </div>

      {/* Student Switcher Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)' }}>Chọn hồ sơ mẫu:</span>
        {students.slice(0, 5).map(s => (
          <button
            key={s.id}
            className={`btn btn-sm ${currentStudent?.id === s.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedStudentCode(s.studentCode)}
          >
            {s.name} ({s.studentCode})
          </button>
        ))}
      </div>

      {currentStudent && (
        <>
          {/* Student Welcome Banner */}
          <div className="profile-hero" style={{ marginBottom: '24px' }}>
            <div className="profile-avatar">
              {currentStudent.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{currentStudent.name}</h2>
                <span className="badge badge-blue">Mã: {currentStudent.studentCode}</span>
                <span className={`badge ${currentStudent.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                  {currentStudent.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '13px', opacity: 0.9 }}>
                Phụ huynh: <strong>{currentStudent.parentName}</strong> ({currentStudent.parentPhone}) | Khóa học niên giám 2026-2027
              </div>
            </div>
          </div>

          {/* Grid Layout: Attendance, Grades & Invoices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
            {/* Left: Academic Scores & Progress */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div className="card-title">
                  <Award size={18} color="var(--brand-blue)" />
                  Bảng Điểm Kiểm Tra & Lời Nhận Xét Của Giáo Viên
                </div>
              </div>
              <div className="card-body" style={{ padding: '16px' }}>
                {studentScores.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Chưa có bài kiểm tra nào được ghi nhận.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {studentScores.map((sc, i) => (
                      <div
                        key={i}
                        style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px',
                          background: 'var(--bg-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--brand-navy)' }}>
                              {sc.examTitle}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                              Lớp: {sc.className} — Ngày kiểm tra: {sc.date}
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: '18px',
                              fontWeight: '800',
                              color: sc.score >= 8 ? 'var(--color-success)' : 'var(--brand-blue)',
                              background: '#ffffff',
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-md)',
                              boxShadow: 'var(--shadow-xs)'
                            }}
                          >
                            {sc.score} / 10
                          </div>
                        </div>

                        {sc.comment && (
                          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '8px', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                            💬 Lời phê GV: <em>"{sc.comment}"</em>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Tuition & Immediate VietQR Payment */}
            <div className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div className="card-title">
                  <CreditCard size={18} color="var(--color-danger)" />
                  Học Phí Cần Thanh Toán & Quét Mã QR
                </div>
              </div>
              <div className="card-body" style={{ padding: '16px' }}>
                {studentInvoices.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Không có thông báo học phí nào.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {studentInvoices.map(inv => (
                      <div
                        key={inv.id}
                        style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px',
                          background: inv.status === 'overdue' ? '#fff5f5' : '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="badge badge-blue">{inv.invoiceCode}</span>
                          <span className={`badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                            {inv.status === 'paid' ? 'Đã Thanh Toán' : inv.status === 'overdue' ? 'Quá Hạn' : 'Chưa Thanh Toán'}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0' }}>
                          {inv.classNames.join(', ')}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Số tiền:</div>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand-navy)' }}>
                              {inv.finalAmount.toLocaleString('vi-VN')} đ
                            </div>
                          </div>

                          {inv.status !== 'paid' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => onOpenVietQR(inv)}
                            >
                              <QrCode size={14} /> Quét VietQR Ngay
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enrolled Classes & Schedule */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BookOpen size={18} color="var(--brand-blue)" />
                Lịch Học Các Lớp Đang Tham Gia ({studentClasses.length} lớp)
              </div>
            </div>
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Mã Lớp</th>
                    <th>Tên Lớp Học</th>
                    <th>Môn</th>
                    <th>Thời Khóa Biểu</th>
                    <th>Phòng Học</th>
                    <th>Giáo Viên Phụ Trách</th>
                  </tr>
                </thead>
                <tbody>
                  {studentClasses.map(c => (
                    <tr key={c.id}>
                      <td><span className="badge badge-blue">{c.code}</span></td>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.subject}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-blue)', fontWeight: '600' }}>
                          <Clock size={12} /> {c.scheduleDays.join(', ')} ({c.scheduleTime})
                        </div>
                      </td>
                      <td>{c.room}</td>
                      <td>{c.teacherId === 'tc-01' ? 'ThS. Nguyễn Văn Thành' : 'ThS. Trần Thị Mai Lan'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
