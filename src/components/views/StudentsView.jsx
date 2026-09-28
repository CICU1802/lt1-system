import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  UserCheck,
  UserX,
  RotateCcw,
  Eye,
  Edit2,
  Trash2,
  Phone,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function StudentsView({
  students,
  classes,
  onAddStudent,
  onUpdateStudent,
  onToggleStudentStatus,
  onOpenStudentProfile,
  initialSearch = ''
}) {
  const [filterStatus, setFilterStatus] = useState('active'); // 'active' | 'dropped' | 'all'
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedClass, setSelectedClass] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    studentCode: '',
    name: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    address: '',
    classIds: [],
    note: '',
    status: 'active'
  });

  const filteredStudents = students.filter(st => {
    // Status filter
    if (filterStatus === 'active' && st.status !== 'active') return false;
    if (filterStatus === 'dropped' && st.status !== 'dropped') return false;

    // Class filter
    if (selectedClass !== 'all' && !st.classIds?.includes(selectedClass)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = st.name.toLowerCase().includes(q);
      const matchCode = st.studentCode.toLowerCase().includes(q);
      const matchPhone = st.phone?.includes(q) || st.parentPhone?.includes(q);
      if (!matchName && !matchCode && !matchPhone) return false;
    }

    return true;
  });

  const handleOpenAddModal = () => {
    const nextCode = `HS24-${String(students.length + 1).padStart(3, '0')}`;
    setEditingStudent(null);
    setFormData({
      studentCode: nextCode,
      name: '',
      phone: '',
      parentName: '',
      parentPhone: '',
      address: '',
      classIds: [],
      note: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (st) => {
    setEditingStudent(st);
    setFormData({
      studentCode: st.studentCode,
      name: st.name,
      phone: st.phone || '',
      parentName: st.parentName || '',
      parentPhone: st.parentPhone || '',
      address: st.address || '',
      classIds: st.classIds || [],
      note: st.note || '',
      status: st.status
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStudent) {
      onUpdateStudent(editingStudent.id, formData);
    } else {
      onAddStudent({
        ...formData,
        id: `std-${Date.now()}`,
        joinDate: new Date().toISOString().split('T')[0],
        consecutiveAbsences: 0
      });
    }
    setIsModalOpen(false);
  };

  const handleClassCheckbox = (classId) => {
    setFormData(prev => {
      const exists = prev.classIds.includes(classId);
      if (exists) {
        return { ...prev, classIds: prev.classIds.filter(id => id !== classId) };
      } else {
        return { ...prev, classIds: [...prev.classIds, classId] };
      }
    });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={24} color="var(--brand-blue)" />
            Quản Lý Học Sinh
          </h1>
          <p className="page-description">
            Quản lý mã học sinh xuyên suốt, theo dõi trạng thái đang học, đã nghỉ và phục hồi học sinh cũ.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <UserPlus size={16} /> Thêm Học Sinh Mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <button
              className={`btn btn-sm ${filterStatus === 'active' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setFilterStatus('active')}
            >
              <UserCheck size={14} /> Đang Học ({students.filter(s => s.status === 'active').length})
            </button>
            <button
              className={`btn btn-sm ${filterStatus === 'dropped' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setFilterStatus('dropped')}
            >
              <UserX size={14} /> Đã Nghỉ ({students.filter(s => s.status === 'dropped').length})
            </button>
            <button
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setFilterStatus('all')}
            >
              Tất Cả ({students.length})
            </button>
          </div>

          {/* Search Field */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm theo mã HS, tên, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter by Class */}
          <select
            className="form-control"
            style={{ width: '220px' }}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="all">Tất cả lớp học</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="card">
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Mã Học Sinh</th>
                <th>Họ Và Tên</th>
                <th>Liên Hệ Phụ Huynh</th>
                <th>Địa Chỉ</th>
                <th>Lớp Đang Theo Học</th>
                <th>Trạng Thái</th>
                <th>Cảnh Báo Vắng</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Không tìm thấy học sinh nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(st => {
                  const studentClasses = classes.filter(c => st.classIds?.includes(c.id));
                  const hasAlert = st.consecutiveAbsences >= 2;

                  return (
                    <tr key={st.id} className={hasAlert ? 'row-danger' : ''}>
                      <td>
                        <button
                          className="badge badge-blue"
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => onOpenStudentProfile(st)}
                          title="Bấm để xem hồ sơ 360°"
                        >
                          {st.studentCode}
                        </button>
                      </td>
                      <td>
                        <strong
                          style={{ cursor: 'pointer', color: 'var(--brand-navy)' }}
                          onClick={() => onOpenStudentProfile(st)}
                        >
                          {st.name}
                        </strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          SĐT HS: {st.phone || 'Chưa cập nhật'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12.5px', fontWeight: '600' }}>{st.parentName || 'Chưa cập nhật'}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--brand-blue)' }}>📞 {st.parentPhone}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '180px' }}>
                        {st.address}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {studentClasses.length === 0 ? (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chưa gán lớp</span>
                          ) : (
                            studentClasses.map(c => (
                              <span key={c.id} className="badge badge-gray" style={{ fontSize: '11px' }}>
                                {c.code}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${st.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                          {st.status === 'active' ? 'Đang học' : 'Đã nghỉ'}
                        </span>
                      </td>
                      <td>
                        {hasAlert ? (
                          <span className="badge badge-danger">
                            ⚠️ Nghỉ {st.consecutiveAbsences} buổi
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--color-success)' }}>Bình thường</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* 360 Profile button */}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onOpenStudentProfile(st)}
                            title="Xem hồ sơ tổng hợp 360"
                          >
                            <Eye size={13} /> Xem Hồ Sơ
                          </button>

                          {/* Edit button */}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEditModal(st)}
                            title="Sửa thông tin"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Status toggle (Nghỉ hẳn / Quay lại học) */}
                          {st.status === 'active' ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--color-danger)' }}
                              onClick={() => onToggleStudentStatus(st.id, 'dropped')}
                              title="Chuyển sang trạng thái Đã nghỉ"
                            >
                              Đã Nghỉ
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => onToggleStudentStatus(st.id, 'active')}
                              title="Học sinh quay lại học: Khôi phục ngay không cần nhập lại hồ sơ"
                            >
                              <RotateCcw size={13} /> Quay Lại Học
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editingStudent ? `Cập Nhật Hồ Sơ: ${editingStudent.studentCode}` : 'Tiếp Nhận Học Sinh Mới'}
              </div>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Mã Học Sinh (Cấp riêng xuyên suốt)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.studentCode}
                      onChange={e => setFormData({ ...formData, studentCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Họ và Tên Học Sinh *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Số Điện Thoại Học Sinh</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0912..."
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Họ Tên Phụ Huynh</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: Nguyễn Văn B (Bố)"
                      value={formData.parentName}
                      onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">SĐT Phụ Huynh (Nhận thông báo/SMS) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0903..."
                      value={formData.parentPhone}
                      onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Địa Chỉ Cư Trú</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Quận/Huyện..."
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                {/* Class Assignment Checkboxes */}
                <div className="form-group">
                  <label className="form-label">Chọn Lớp/Môn Đăng Ký Học</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                    {classes.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.classIds.includes(c.id)}
                          onChange={() => handleClassCheckbox(c.id)}
                        />
                        <span><strong>{c.code}</strong> - {c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi Chú Học Sinh / Nguyện Vọng</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Mục tiêu điểm số, tình trạng học tập, lưu ý sức khỏe..."
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
                  {editingStudent ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm Học Sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
