import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit,
  EyeOff,
  Eye,
  Clock,
  MapPin,
  User,
  Users,
  Search,
  Layers,
  Settings
} from 'lucide-react';

export default function ClassesView({
  classes,
  grades,
  teachers,
  students,
  onAddClass,
  onUpdateClass,
  onToggleArchiveClass,
  onAddGrade
}) {
  const [selectedGradeId, setSelectedGradeId] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [newGradeName, setNewGradeName] = useState('');

  // Class Form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    gradeId: 'g10',
    subject: 'Toán Học',
    sessionType: 'afternoon',
    scheduleDays: ['Thứ 2', 'Thứ 5'],
    scheduleTime: '17:30 - 19:30',
    room: 'Phòng 201',
    teacherId: 'tc-01',
    assistantId: 'ta-01',
    maxCapacity: 30,
    feePerMonth: 1200000,
    note: '',
    lockTime: '18:30'
  });

  const filteredClasses = classes.filter(c => {
    if (!showArchived && c.isArchived) return false;
    if (showArchived && !c.isArchived) return false;
    if (selectedGradeId !== 'all' && c.gradeId !== selectedGradeId) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      code: `L${Date.now().toString().slice(-4)}`,
      name: '',
      gradeId: grades[0]?.id || 'g10',
      subject: 'Toán Học',
      sessionType: 'afternoon',
      scheduleDays: ['Thứ 2', 'Thứ 5'],
      scheduleTime: '17:30 - 19:30',
      room: 'Phòng 201',
      teacherId: teachers.find(t => t.role === 'teacher')?.id || '',
      assistantId: teachers.find(t => t.role === 'assistant')?.id || '',
      maxCapacity: 30,
      feePerMonth: 1200000,
      note: '',
      lockTime: '18:30'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      code: cls.code,
      name: cls.name,
      gradeId: cls.gradeId,
      subject: cls.subject,
      sessionType: cls.sessionType,
      scheduleDays: cls.scheduleDays || [],
      scheduleTime: cls.scheduleTime,
      room: cls.room,
      teacherId: cls.teacherId,
      assistantId: cls.assistantId,
      maxCapacity: cls.maxCapacity,
      feePerMonth: cls.feePerMonth,
      note: cls.note || '',
      lockTime: cls.lockTime || '18:30'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClass) {
      onUpdateClass(editingClass.id, formData);
    } else {
      onAddClass({
        ...formData,
        id: `cls-${Date.now()}`,
        isArchived: false
      });
    }
    setIsModalOpen(false);
  };

  const handleCreateGrade = (e) => {
    e.preventDefault();
    if (!newGradeName.trim()) return;
    onAddGrade({
      id: `g-${Date.now()}`,
      name: newGradeName.trim()
    });
    setNewGradeName('');
    setIsGradeModalOpen(false);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <GraduationCap size={24} color="var(--brand-blue)" />
            Quản Lý Khối - Lớp Học
          </h1>
          <p className="page-description">
            Hệ thống tổ chức 3 cấp: Cấp 1 (Khối) $\rightarrow$ Cấp 2 (Mã Lớp) $\rightarrow$ Cấp 3 (Tên Lớp). Cấu hình lịch học, giáo viên và học phí.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setIsGradeModalOpen(true)}>
            <Settings size={16} /> Cấu Hình Khối Lớp
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Mở Lớp Học Mới
          </button>
        </div>
      </div>

      {/* 3-Tier Filter Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Grade Selector (Level 1) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Cấp 1 — Khối:
            </span>
            <button
              className={`btn btn-sm ${selectedGradeId === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedGradeId('all')}
            >
              Tất Cả Khối
            </button>
            {grades.map(g => (
              <button
                key={g.id}
                className={`btn btn-sm ${selectedGradeId === g.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedGradeId(g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>

          {/* Archive Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={e => setShowArchived(e.target.checked)}
            />
            <span style={{ color: showArchived ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
              {showArchived ? 'Đang hiển thị Lớp Đã Ẩn' : 'Xem các lớp đã ẩn'}
            </span>
          </label>
        </div>
      </div>

      {/* Classes Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filteredClasses.map(cls => {
          const grade = grades.find(g => g.id === cls.gradeId);
          const teacher = teachers.find(t => t.id === cls.teacherId);
          const assistant = teachers.find(t => t.id === cls.assistantId);
          const enrolledCount = students.filter(s => s.status === 'active' && s.classIds?.includes(cls.id)).length;

          return (
            <div
              key={cls.id}
              className="card"
              style={{
                marginBottom: 0,
                opacity: cls.isArchived ? 0.7 : 1,
                border: cls.isArchived ? '1px dashed var(--border-color)' : '1px solid var(--border-color)'
              }}
            >
              <div className="card-header" style={{ background: cls.isArchived ? 'var(--bg-subtle)' : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span className="badge badge-blue">{cls.code}</span>
                    <span className="badge badge-gray">{grade?.name}</span>
                    {cls.sessionType === 'morning' ? (
                      <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>Ca Sáng</span>
                    ) : (
                      <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3' }}>Ca Chiều/Tối</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand-navy)' }}>
                    {cls.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn-icon" onClick={() => handleOpenEdit(cls)} title="Chỉnh sửa lớp">
                    <Edit size={14} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => onToggleArchiveClass(cls.id)}
                    title={cls.isArchived ? 'Mở lại lớp' : 'Ẩn lớp này'}
                    style={{ color: cls.isArchived ? 'var(--color-success)' : 'var(--color-danger)' }}
                  >
                    {cls.isArchived ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>

              <div className="card-body" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <Clock size={15} color="var(--brand-blue)" />
                    <strong>{cls.scheduleDays.join(', ')}</strong> ({cls.scheduleTime})
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <MapPin size={15} color="var(--text-muted)" />
                    <span>Phòng: <strong>{cls.room}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <User size={15} color="var(--text-muted)" />
                    <span>GV: <strong>{teacher?.name || 'Chưa phân công'}</strong></span>
                  </div>

                  {assistant && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', paddingLeft: '23px', fontSize: '12px' }}>
                      <span>Trợ giảng: {assistant.name}</span>
                    </div>
                  )}

                  {/* Sĩ số & Học phí */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Sĩ số hiện tại:</span>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: enrolledCount >= cls.maxCapacity ? 'var(--color-danger)' : 'var(--brand-navy)' }}>
                        {enrolledCount} / {cls.maxCapacity} học sinh
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Học phí niêm yết:</span>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--brand-blue)' }}>
                        {cls.feePerMonth?.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>

                  {cls.note && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                      💡 {cls.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editingClass ? `Chỉnh Sửa Lớp: ${editingClass.code}` : 'Mở Lớp Học Mới'}
              </div>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cấp 1 — Khối Lớp *</label>
                    <select
                      className="form-control"
                      value={formData.gradeId}
                      onChange={e => setFormData({ ...formData, gradeId: e.target.value })}
                      required
                    >
                      {grades.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cấp 2 — Mã Lớp (Duy nhất) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: T10-01"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Cấp 3 — Tên Lớp Học *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: Toán Nâng Cao 10A"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Môn Học *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Toán Học, Vật Lý, Hóa Học..."
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Buổi Học</label>
                    <select
                      className="form-control"
                      value={formData.sessionType}
                      onChange={e => setFormData({ ...formData, sessionType: e.target.value })}
                    >
                      <option value="morning">Buổi Sáng</option>
                      <option value="afternoon">Buổi Chiều / Tối</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Khung Giờ Học *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: 17:30 - 19:30"
                      value={formData.scheduleTime}
                      onChange={e => setFormData({ ...formData, scheduleTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Giáo Viên Phụ Trách</label>
                    <select
                      className="form-control"
                      value={formData.teacherId}
                      onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                    >
                      <option value="">-- Chọn giáo viên --</option>
                      {teachers.filter(t => t.role === 'teacher').map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Trợ Giảng (TA)</label>
                    <select
                      className="form-control"
                      value={formData.assistantId}
                      onChange={e => setFormData({ ...formData, assistantId: e.target.value })}
                    >
                      <option value="">-- Chọn trợ giảng --</option>
                      {teachers.filter(t => t.role === 'assistant').map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Sĩ Số Tối Đa</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.maxCapacity}
                      onChange={e => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Học Phí / Tháng (VNĐ) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.feePerMonth}
                      onChange={e => setFormData({ ...formData, feePerMonth: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phòng Học</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Phòng 201"
                      value={formData.room}
                      onChange={e => setFormData({ ...formData, room: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Giờ Tự Động Khóa Điểm Danh</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="18:30"
                      value={formData.lockTime}
                      onChange={e => setFormData({ ...formData, lockTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi Chú Lớp Học</label>
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
                  {editingClass ? 'Cập Nhật Lớp' : 'Mở Lớp Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Configuration Modal */}
      {isGradeModalOpen && (
        <div className="modal-overlay" onClick={() => setIsGradeModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Cấu Hình Danh Sách Khối</div>
              <button className="btn-icon" onClick={() => setIsGradeModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateGrade}>
              <div className="modal-body">
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Các khối hiện có:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {grades.map(g => (
                      <span key={g.id} className="badge badge-blue">{g.name}</span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Thêm Khối Mới</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Luyện Thi Chuyên, Khối 5..."
                    value={newGradeName}
                    onChange={e => setNewGradeName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsGradeModalOpen(false)}>
                  Đóng
                </button>
                <button type="submit" className="btn btn-primary">
                  Thêm Khối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
