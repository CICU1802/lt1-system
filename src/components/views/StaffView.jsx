import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Edit,
  GraduationCap,
  CreditCard,
  Phone,
  MapPin,
  Calendar,
  Check,
  X,
  Search,
  Award
} from 'lucide-react';

export default function StaffView({
  teachers,
  classes,
  onAddTeacher,
  onUpdateTeacher
}) {
  const [filterRole, setFilterRole] = useState('all'); // 'all' | 'teacher' | 'assistant'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'teacher',
    phone: '',
    address: '',
    education: '',
    bankAccount: '',
    bankName: 'MB Bank',
    note: '',
    totalSessions: 0,
    absentSessions: 0
  });

  const filteredStaff = teachers.filter(t => {
    if (filterRole !== 'all' && t.role !== filterRole) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: 'teacher',
      phone: '',
      address: '',
      education: '',
      bankAccount: '',
      bankName: 'MB Bank',
      note: '',
      totalSessions: 0,
      absentSessions: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      role: staff.role,
      phone: staff.phone,
      address: staff.address,
      education: staff.education,
      bankAccount: staff.bankAccount,
      bankName: staff.bankName,
      note: staff.note || '',
      totalSessions: staff.totalSessions,
      absentSessions: staff.absentSessions
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingStaff) {
      onUpdateTeacher(editingStaff.id, formData);
    } else {
      onAddTeacher({
        ...formData,
        id: `${formData.role === 'teacher' ? 'tc' : 'ta'}-${Date.now()}`
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UserCheck size={24} color="var(--brand-blue)" />
            Giáo Viên & Trợ Giảng (Quản Lý & Điểm Danh Chấm Công)
          </h1>
          <p className="page-description">
            Quản lý hồ sơ trình độ, số tài khoản ngân hàng chi trả thù lao và theo dõi số buổi dạy, số buổi vắng.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Thêm Giáo Viên / Trợ Giảng
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '14px 20px', display: 'flex', gap: '12px' }}>
          <button
            className={`btn btn-sm ${filterRole === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterRole('all')}
          >
            Tất Cả ({teachers.length})
          </button>
          <button
            className={`btn btn-sm ${filterRole === 'teacher' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterRole('teacher')}
          >
            Giáo Viên Giảng Dạy ({teachers.filter(t => t.role === 'teacher').length})
          </button>
          <button
            className={`btn btn-sm ${filterRole === 'assistant' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterRole('assistant')}
          >
            Trợ Giảng (TA) ({teachers.filter(t => t.role === 'assistant').length})
          </button>
        </div>
      </div>

      {/* Staff Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {filteredStaff.map(staff => {
          const assignedClasses = classes.filter(
            c => c.teacherId === staff.id || c.assistantId === staff.id
          );

          return (
            <div key={staff.id} className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div>
                  <span className={`badge ${staff.role === 'teacher' ? 'badge-blue' : 'badge-warning'}`} style={{ marginBottom: '4px' }}>
                    {staff.role === 'teacher' ? 'Giáo Viên Giảng Dạy' : 'Trợ Giảng (TA)'}
                  </span>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--brand-navy)' }}>
                    {staff.name}
                  </h3>
                </div>
                <button className="btn-icon" onClick={() => handleOpenEdit(staff)}>
                  <Edit size={14} />
                </button>
              </div>

              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} color="var(--brand-blue)" />
                    <span>SĐT: <strong>{staff.phone}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="var(--text-muted)" />
                    <span>Địa chỉ: {staff.address}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={14} color="#f59e0b" />
                    <span>Học vấn: <strong>{staff.education}</strong></span>
                  </div>

                  {/* Bank info for salary payout */}
                  <div style={{ background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '4px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                      Tài Khoản Chi Trả Lương:
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-navy)', marginTop: '2px' }}>
                      {staff.bankName}: <span style={{ color: 'var(--brand-blue)' }}>{staff.bankAccount}</span>
                    </div>
                  </div>

                  {/* Sessions & Attendance Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Tổng buổi đã dạy/làm:</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-success)' }}>
                        {staff.totalSessions} buổi
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Số buổi vắng:</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: staff.absentSessions > 0 ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                        {staff.absentSessions} buổi
                      </div>
                    </div>
                  </div>

                  {/* Classes Assigned */}
                  <div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>Lớp phụ trách:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {assignedClasses.length === 0 ? (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chưa gán lớp</span>
                      ) : (
                        assignedClasses.map(c => (
                          <span key={c.id} className="badge badge-gray" style={{ fontSize: '11px' }}>
                            {c.code}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editingStaff ? `Cập Nhật Hồ Sơ: ${editingStaff.name}` : 'Thêm Nhân Sự Giảng Dạy Mới'}
              </div>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Vai Trò Phân Loại *</label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="teacher">Giáo Viên Giảng Dạy</option>
                      <option value="assistant">Trợ Giảng (TA)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Họ và Tên *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: ThS. Lê Văn Nam"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Số Điện Thoại *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Địa Chỉ Cư Trú</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Trình Độ Học Vấn & Bằng Cấp *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Thạc sĩ Toán Giải Tích - ĐH Sư Phạm"
                    value={formData.education}
                    onChange={e => setFormData({ ...formData, education: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngân Hàng Nhận Lương</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="MB Bank, Vietcombank, Techcombank..."
                      value={formData.bankName}
                      onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số Tài Khoản Ngân Hàng *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="1903..."
                      value={formData.bankAccount}
                      onChange={e => setFormData({ ...formData, bankAccount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tổng Buổi Đã Giảng Dạy</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.totalSessions}
                      onChange={e => setFormData({ ...formData, totalSessions: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số Buổi Vắng</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.absentSessions}
                      onChange={e => setFormData({ ...formData, absentSessions: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi Chú Nghiệp Vụ</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStaff ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm Nhân Sự'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
