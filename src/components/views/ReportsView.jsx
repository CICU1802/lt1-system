import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  GraduationCap,
  CreditCard,
  AlertTriangle,
  Award,
  CalendarCheck,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export default function ReportsView({
  students,
  classes,
  attendance,
  invoices,
  makeups,
  teachers,
  exams
}) {
  const activeStudents = students.filter(s => s.status === 'active');
  const droppedStudents = students.filter(s => s.status === 'dropped');
  const alertStudents = students.filter(s => s.consecutiveAbsences >= 2);
  const pendingMakeups = makeups.filter(m => m.status === 'pending');
  const completedMakeups = makeups.filter(m => m.status === 'completed');

  // Total finances
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalDebt = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart3 size={24} color="var(--brand-blue)" />
            Báo Cáo & Thống Kê Tổng Hợp Vận Hành
          </h1>
          <p className="page-description">
            Báo cáo toàn cảnh theo thời gian thực về học sinh, sĩ số lớp, điểm danh chuyên cần, học phí, công nợ và năng suất giảng dạy.
          </p>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-title">Quy Mô Học Sinh</div>
            <div className="stat-value">{activeStudents.length} HS</div>
            <div className="stat-subtext" style={{ color: 'var(--text-muted)' }}>
              Đang học: {activeStudents.length} | Đã nghỉ: {droppedStudents.length}
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--brand-blue-subtle)', color: 'var(--brand-blue)' }}>
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-title">Tổng Doanh Thu Thu Được</div>
            <div className="stat-value" style={{ fontSize: '24px', color: 'var(--color-success)' }}>
              {totalPaid.toLocaleString('vi-VN')} đ
            </div>
            <div className="stat-subtext" style={{ color: 'var(--text-secondary)' }}>
              Tỷ lệ thu đạt: {totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0}%
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <CreditCard size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-title">Tổng Công Nợ Học Phí</div>
            <div className="stat-value" style={{ fontSize: '24px', color: 'var(--color-danger)' }}>
              {totalDebt.toLocaleString('vi-VN')} đ
            </div>
            <div className="stat-subtext" style={{ color: 'var(--color-danger)', fontWeight: '600' }}>
              {overdueCount} hồ sơ quá hạn cần nhắc
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-title">Tỷ Lệ Xử Lý Học Bù</div>
            <div className="stat-value" style={{ color: 'var(--brand-navy)' }}>
              {completedMakeups.length} / {makeups.length}
            </div>
            <div className="stat-subtext" style={{ color: 'var(--brand-blue)' }}>
              {pendingMakeups.length} buổi đang chờ học
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: 'var(--color-purple)' }}>
            <CalendarCheck size={22} />
          </div>
        </div>
      </div>

      {/* Grid: Class Capacity Distribution & Teacher Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Class Capacity Distribution */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <GraduationCap size={18} color="var(--brand-blue)" />
              Thống Kê Sĩ Số & Tỷ Lệ Lấp Đầy Các Lớp
            </div>
          </div>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Lớp Học</th>
                  <th>Môn</th>
                  <th>Sĩ Số / Tối Đa</th>
                  <th>Tỷ Lệ Lấp Đầy</th>
                  <th>Học Phí Niêm Yết</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(c => {
                  const enrolled = students.filter(s => s.status === 'active' && s.classIds?.includes(c.id)).length;
                  const fillPercent = Math.min(100, Math.round((enrolled / c.maxCapacity) * 100));

                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.code}</div>
                      </td>
                      <td>{c.subject}</td>
                      <td><strong>{enrolled}</strong> / {c.maxCapacity} HS</td>
                      <td style={{ width: '160px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '8px', background: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${fillPercent}%`,
                                height: '100%',
                                background: fillPercent > 80 ? 'var(--color-success)' : 'var(--brand-blue)'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '700' }}>{fillPercent}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: '700' }}>{c.feePerMonth?.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Workload & Attendance */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title">
              <Award size={18} color="var(--color-success)" />
              Năng Suất Giảng Dạy Của Giáo Viên & Trợ Giảng
            </div>
          </div>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Họ Tên</th>
                  <th>Vai Trò</th>
                  <th>Số Buổi Đã Dạy</th>
                  <th>Vắng</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.education}</div>
                    </td>
                    <td>
                      <span className={`badge ${t.role === 'teacher' ? 'badge-blue' : 'badge-warning'}`}>
                        {t.role === 'teacher' ? 'Giáo Viên' : 'Trợ Giảng'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', color: 'var(--color-success)' }}>
                        {t.totalSessions} buổi
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: t.absentSessions > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                        {t.absentSessions} buổi
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
