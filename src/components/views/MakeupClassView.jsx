import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  Filter,
  Check,
  X
} from 'lucide-react';

export default function MakeupClassView({
  makeups,
  students,
  classes,
  onAddMakeup,
  onUpdateMakeupStatus,
  onOpenStudentProfile
}) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'completed'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    originalClassId: '',
    originalDate: new Date().toISOString().split('T')[0],
    reason: '',
    targetClassId: '',
    targetDate: '',
    targetTime: '17:30 - 19:30',
    status: 'pending',
    note: ''
  });

  const filteredMakeups = makeups.filter(m => {
    if (filterStatus === 'pending' && m.status !== 'pending') return false;
    if (filterStatus === 'completed' && m.status !== 'completed') return false;
    return true;
  });

  const handleOpenAdd = () => {
    const firstStudent = students[0];
    setFormData({
      studentId: firstStudent?.id || '',
      originalClassId: firstStudent?.classIds?.[0] || classes[0]?.id || '',
      originalDate: new Date().toISOString().split('T')[0],
      reason: 'Bận thi học kỳ ở trường',
      targetClassId: classes[1]?.id || classes[0]?.id || '',
      targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      targetTime: '18:00 - 20:00',
      status: 'pending',
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const st = students.find(s => s.id === formData.studentId);
    const origClass = classes.find(c => c.id === formData.originalClassId);
    const targetClass = classes.find(c => c.id === formData.targetClassId);

    onAddMakeup({
      id: `mk-${Date.now()}`,
      studentId: formData.studentId,
      studentName: st?.name || '',
      studentCode: st?.studentCode || '',
      originalClassId: formData.originalClassId,
      originalClassName: origClass?.name || '',
      originalDate: formData.originalDate,
      reason: formData.reason,
      targetClassId: formData.targetClassId,
      targetClassName: targetClass?.name || '',
      targetDate: formData.targetDate,
      targetTime: formData.targetTime,
      status: formData.status,
      note: formData.note
    });
    setIsModalOpen(false);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Repeat size={24} color="var(--brand-blue)" />
            Quản Lý Lịch Học Bù (Make-Up Class)
          </h1>
          <p className="page-description">
            Điều phối lịch học bù cho học sinh vắng, lưu vết buổi học gốc, buổi học bù và trạng thái để tránh tính trùng buổi.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Sắp Xếp Lịch Học Bù
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '14px 20px', display: 'flex', gap: '12px' }}>
          <button
            className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('all')}
          >
            Tất Cả ({makeups.length})
          </button>
          <button
            className={`btn btn-sm ${filterStatus === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('pending')}
          >
            <Clock size={14} /> Chưa Học Bù ({makeups.filter(m => m.status === 'pending').length})
          </button>
          <button
            className={`btn btn-sm ${filterStatus === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus('completed')}
          >
            <CheckCircle size={14} /> Đã Hoàn Thành ({makeups.filter(m => m.status === 'completed').length})
          </button>
        </div>
      </div>

      {/* Makeups List Table */}
      <div className="card">
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Mã HS & Tên Học Sinh</th>
                <th>Buổi Học Gốc (Vắng)</th>
                <th>Lý Do Vắng Học</th>
                <th>Buổi Học Bù Bố Trí</th>
                <th>Thời Gian Học Bù</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredMakeups.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Không có bản ghi học bù nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredMakeups.map(mk => (
                  <tr key={mk.id}>
                    <td>
                      <div
                        style={{ fontWeight: '700', color: 'var(--brand-navy)', cursor: 'pointer' }}
                        onClick={() => {
                          const st = students.find(s => s.id === mk.studentId);
                          if (st) onOpenStudentProfile(st);
                        }}
                      >
                        {mk.studentName}
                      </div>
                      <span className="badge badge-blue" style={{ fontSize: '11px', marginTop: '2px' }}>
                        {mk.studentCode}
                      </span>
                    </td>
                    <td>
                      <strong>{mk.originalClassName}</strong>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-danger)' }}>
                        Ngày vắng: {mk.originalDate}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', maxWidth: '180px' }}>
                      {mk.reason}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--brand-blue)' }}>{mk.targetClassName}</strong>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        Ngày học bù: {mk.targetDate}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{mk.targetTime}</div>
                    </td>
                    <td>
                      {mk.status === 'completed' ? (
                        <span className="badge badge-success">✓ Đã học bù</span>
                      ) : (
                        <span className="badge badge-warning">⏳ Chưa học bù</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {mk.status === 'pending' ? (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => onUpdateMakeupStatus(mk.id, 'completed')}
                          title="Đánh dấu học sinh đã tham gia buổi học bù"
                        >
                          <Check size={14} /> Hoàn Thành
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onUpdateMakeupStatus(mk.id, 'pending')}
                        >
                          Đổi Chưa Học
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Makeup Class Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Sắp Xếp Lịch Học Bù Mới</div>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Chọn Học Sinh Cần Học Bù *</label>
                  <select
                    className="form-control"
                    value={formData.studentId}
                    onChange={e => {
                      const st = students.find(s => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        studentId: e.target.value,
                        originalClassId: st?.classIds?.[0] || formData.originalClassId
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

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Buổi Học Gốc Bị Vắng *</label>
                    <select
                      className="form-control"
                      value={formData.originalClassId}
                      onChange={e => setFormData({ ...formData, originalClassId: e.target.value })}
                      required
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngày Học Gốc (Bị vắng) *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.originalDate}
                      onChange={e => setFormData({ ...formData, originalDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lý Do Vắng Học</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Bận thi văn nghệ, ốm sốt..."
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Lớp Sắp Xếp Cho Học Bù *</label>
                    <select
                      className="form-control"
                      value={formData.targetClassId}
                      onChange={e => setFormData({ ...formData, targetClassId: e.target.value })}
                      required
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngày Học Bù Dự Kiến *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.targetDate}
                      onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Khung Giờ Học Bù</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="18:00 - 20:00"
                    value={formData.targetTime}
                    onChange={e => setFormData({ ...formData, targetTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu Lịch Học Bù
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
