import React from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  AlertOctagon,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function DashboardView({
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
  const droppedStudents = students.filter(s => s.status === 'dropped');
  const alertStudents = students.filter(s => s.consecutiveAbsences >= 2);
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const pendingMakeups = makeups.filter(m => m.status === 'pending');

  // Tuition calculation
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid' || inv.status === 'partial')
    .reduce((sum, inv) => sum + inv.paidAmount, 0);

  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.remainingAmount, 0);

  return (
    <div className="page-container">
      {/* Page Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Bảng Điều Khiển Trung Tâm
          </h1>
          <p className="page-description">
            Tổng quan thời gian thực hoạt động giảng dạy, điểm danh và tài chính LT1 Education.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setCurrentTab('reports')}>
            Xem Báo Cáo Chi Tiết
          </button>
          <button className="btn btn-primary" onClick={() => setCurrentTab('attendance')}>
            <CalendarCheck size={16} /> Vào Điểm Danh Ngay
          </button>
        </div>
      </div>

      {/* Critical Alert Banner (Item 12: Cảnh báo nghỉ 2 buổi liên tiếp) */}
      {alertStudents.length > 0 && (
        <div className="alert-banner">
          <div className="alert-banner-content">
            <ShieldAlert size={24} color="var(--color-danger)" style={{ flexShrink: 0 }} />
            <div>
              <div className="alert-banner-title">
                PHÁT HIỆN {alertStudents.length} HỌC SINH NGHỈ 2 BUỔI LIÊN TIẾP (CẦN XỬ LÝ GẤP)
              </div>
              <div className="alert-banner-desc">
                Hệ thống tự động đưa hồ sơ vào danh sách giám sát. Nhân viên cần liên hệ phụ huynh ngay để sắp xếp lịch học bù hoặc tìm hiểu lý do.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {alertStudents.map(st => (
              <button
                key={st.id}
                className="btn btn-danger btn-sm"
                onClick={() => onOpenStudentProfile(st)}
              >
                {st.name} ({st.studentCode})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-title">Tổng Học Sinh Đang Học</div>
            <div className="stat-value">{activeStudents.length}</div>
            <div className="stat-subtext" style={{ color: 'var(--color-success)' }}>
              +{droppedStudents.length} học sinh đã lưu hồ sơ (Đã nghỉ)
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--brand-blue-subtle)', color: 'var(--brand-blue)' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-title">Tổng Lớp Đang Mở</div>
            <div className="stat-value">{classes.filter(c => !c.isArchived).length}</div>
            <div className="stat-subtext">Khối 9, 10, 11 & Luyện thi Chuyên</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: 'var(--color-purple)' }}>
            <GraduationCap size={24} />
          </div>
        </div>

        <div className={`stat-card ${alertStudents.length > 0 ? 'alert-card' : ''}`}>
          <div>
            <div className="stat-title" style={{ color: alertStudents.length > 0 ? 'var(--color-danger)' : '' }}>
              Cảnh Báo Vắng 2 Buổi
            </div>
            <div className="stat-value" style={{ color: alertStudents.length > 0 ? 'var(--color-danger)' : '' }}>
              {alertStudents.length}
            </div>
            <div className="stat-subtext">Cần phụ huynh xác nhận</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
            <AlertOctagon size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-title">Học Phí Đã Thu Tháng Này</div>
            <div className="stat-value" style={{ fontSize: '24px', color: 'var(--brand-navy)' }}>
              {totalRevenue.toLocaleString('vi-VN')} đ
            </div>
            <div className="stat-subtext" style={{ color: 'var(--color-danger)', fontWeight: '600' }}>
              Còn nợ: {totalOutstanding.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Classes & Urgent Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Active Classes & Schedule Today */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Calendar size={18} color="var(--brand-blue)" />
              Lịch Học & Lớp Đang Giảng Dạy Hôm Nay
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('schedule')}>
              Toàn Bộ Thời Khóa Biểu <ChevronRight size={14} />
            </button>
          </div>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Mã Lớp</th>
                  <th>Tên Lớp & Môn</th>
                  <th>Khung Giờ</th>
                  <th>Phòng</th>
                  <th>Giáo Viên</th>
                  <th>Trạng Thái Điểm Danh</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {classes.slice(0, 4).map(cls => (
                  <tr key={cls.id}>
                    <td><span className="badge badge-blue">{cls.code}</span></td>
                    <td>
                      <strong>{cls.name}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Môn: {cls.subject}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color="var(--text-muted)" />
                        <span>{cls.scheduleTime}</span>
                      </div>
                    </td>
                    <td>{cls.room}</td>
                    <td>{cls.teacherId === 'tc-01' ? 'ThS. Nguyễn Văn Thành' : 'ThS. Trần Thị Mai Lan'}</td>
                    <td>
                      {cls.id === 'cls-101' ? (
                        <span className="badge badge-warning">Đang điểm danh (Khóa {cls.lockTime})</span>
                      ) : (
                        <span className="badge badge-gray">Chưa đến giờ</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setCurrentTab('attendance')}
                      >
                        Điểm Danh
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Urgent Action Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Overdue Tuition Notification */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '15px' }}>
                <CreditCard size={16} color="var(--color-danger)" />
                Nhắc Học Phí Quá Hạn ({overdueInvoices.length})
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('tuition')}>
                Chi tiết
              </button>
            </div>
            <div className="card-body" style={{ padding: '16px' }}>
              {overdueInvoices.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Không có công nợ quá hạn.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {overdueInvoices.map(inv => (
                    <div
                      key={inv.id}
                      style={{
                        padding: '12px',
                        background: '#fef2f2',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-danger-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-navy)' }}>
                          {inv.studentName} ({inv.studentCode})
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-danger)', fontWeight: '600' }}>
                          Quá hạn từ: {inv.dueDate} — Nợ: {inv.remainingAmount.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onOpenVietQR(inv)}
                      >
                        Tạo QR
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Makeup Class Requests */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '15px' }}>
                <Clock size={16} color="var(--brand-blue)" />
                Yêu Cầu Học Bù Chờ Xử Lý ({pendingMakeups.length})
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentTab('makeup')}>
                Xem tất cả
              </button>
            </div>
            <div className="card-body" style={{ padding: '16px' }}>
              {pendingMakeups.map(mk => (
                <div
                  key={mk.id}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-navy)' }}>
                    {mk.studentName} ({mk.studentCode})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Vắng: {mk.originalClassName} ({mk.originalDate})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--brand-blue)', fontWeight: '600', marginTop: '2px' }}>
                    $\rightarrow$ Xếp bù: {mk.targetClassName} ({mk.targetDate})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
