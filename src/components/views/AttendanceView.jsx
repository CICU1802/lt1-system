import React, { useState } from 'react';
import {
  CheckSquare,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Save,
  Check,
  X,
  FileText,
  UserCheck,
  Calendar,
  AlertOctagon,
  ChevronDown
} from 'lucide-react';

export default function AttendanceView({
  classes,
  students,
  attendance,
  userRole,
  onSaveAttendance,
  onToggleLockAttendance,
  onOpenStudentProfile
}) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState('2026-09-28');
  
  // Find current attendance record or create draft
  const currentRecord = attendance.find(
    a => a.classId === selectedClassId && a.date === selectedDate
  ) || {
    id: `att-${selectedDate}-${selectedClassId}`,
    classId: selectedClassId,
    date: selectedDate,
    sessionName: `Buổi học ngày ${selectedDate}`,
    isLocked: false,
    teacherAttendance: { teacherId: '', present: true },
    assistantAttendance: { assistantId: '', present: true },
    progressNote: {
      topicsTaught: '',
      progressStatus: '',
      supplementalNotes: '',
      homework: '',
      generalFeedback: '',
    },
    entries: []
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const classStudents = students.filter(
    s => s.status === 'active' && s.classIds?.includes(selectedClassId)
  );

  // Local editing state
  const [entries, setEntries] = useState(() => {
    return classStudents.map(st => {
      const existing = currentRecord.entries?.find(e => e.studentId === st.id);
      return {
        studentId: st.id,
        status: existing?.status || 'present', // 'present' | 'absent_excused' | 'absent_unexcused'
        note: existing?.note || ''
      };
    });
  });

  const [teacherPresent, setTeacherPresent] = useState(
    currentRecord.teacherAttendance?.present ?? true
  );
  const [assistantPresent, setAssistantPresent] = useState(
    currentRecord.assistantAttendance?.present ?? true
  );

  const [progressNote, setProgressNote] = useState({
    topicsTaught: currentRecord.progressNote?.topicsTaught || '',
    progressStatus: currentRecord.progressNote?.progressStatus || '',
    supplementalNotes: currentRecord.progressNote?.supplementalNotes || '',
    homework: currentRecord.progressNote?.homework || '',
    generalFeedback: currentRecord.progressNote?.generalFeedback || '',
  });

  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Sync entries if class or date changes
  const handleSelectClass = (clsId) => {
    setSelectedClassId(clsId);
    const rec = attendance.find(a => a.classId === clsId && a.date === selectedDate);
    const enrolled = students.filter(s => s.status === 'active' && s.classIds?.includes(clsId));
    setEntries(enrolled.map(st => {
      const existing = rec?.entries?.find(e => e.studentId === st.id);
      return {
        studentId: st.id,
        status: existing?.status || 'present',
        note: existing?.note || ''
      };
    }));
    setProgressNote({
      topicsTaught: rec?.progressNote?.topicsTaught || '',
      progressStatus: rec?.progressNote?.progressStatus || '',
      supplementalNotes: rec?.progressNote?.supplementalNotes || '',
      homework: rec?.progressNote?.homework || '',
      generalFeedback: rec?.progressNote?.generalFeedback || '',
    });
  };

  const handleStatusChange = (studentId, newStatus) => {
    if (currentRecord.isLocked && userRole !== 'admin') {
      alert('Chức năng điểm danh đã bị khóa theo quy định giờ của trung tâm. Vui lòng liên hệ Quản Trị Viên để mở khóa!');
      return;
    }
    setEntries(prev => prev.map(e => e.studentId === studentId ? { ...e, status: newStatus } : e));
  };

  const handleNoteChange = (studentId, note) => {
    setEntries(prev => prev.map(e => e.studentId === studentId ? { ...e, note } : e));
  };

  const handleSave = () => {
    onSaveAttendance({
      ...currentRecord,
      classId: selectedClassId,
      date: selectedDate,
      teacherAttendance: { teacherId: selectedClass?.teacherId, present: teacherPresent },
      assistantAttendance: { assistantId: selectedClass?.assistantId, present: assistantPresent },
      progressNote,
      entries
    });
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  // Stats calculation for the selected session
  const totalStudents = classStudents.length;
  const presentCount = entries.filter(e => e.status === 'present').length;
  const excusedCount = entries.filter(e => e.status === 'absent_excused').length;
  const unexcusedCount = entries.filter(e => e.status === 'absent_unexcused').length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CheckSquare size={24} color="var(--brand-blue)" />
            Điểm Danh Học Sinh & Ghi Chú Tiến Độ Lớp
          </h1>
          <p className="page-description">
            Tích điểm danh (X: Có mặt, P: Có phép, K: Không phép), tự động cảnh báo đỏ học sinh nghỉ 2 buổi liên tiếp và kiểm soát khóa giờ.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Lock / Unlock Status Indicator */}
          {currentRecord.isLocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-danger">
                <Lock size={12} /> Đã khóa điểm danh
              </span>
              {userRole === 'admin' && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onToggleLockAttendance(currentRecord.id, false)}
                  title="Quản trị viên mở khóa chỉnh sửa"
                >
                  <Unlock size={14} /> Mở Khóa (Admin)
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-success">
                <Unlock size={12} /> Đang mở (Khóa lúc {selectedClass?.lockTime || '18:30'})
              </span>
              {userRole === 'admin' && (
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => onToggleLockAttendance(currentRecord.id, true)}
                  title="Chủ động khóa phiên điểm danh"
                >
                  <Lock size={14} /> Khóa Ngay (Admin)
                </button>
              )}
            </div>
          )}

          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} /> Lưu Điểm Danh & Tiến Độ
          </button>
        </div>
      </div>

      {isSavedAlert && (
        <div style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', padding: '12px 18px', borderRadius: 'var(--radius-md)', color: '#065f46', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> Đã lưu thành công kết quả điểm danh và ghi chú tiến độ buổi học!
        </div>
      )}

      {/* Selector Toolbar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Chọn Lớp:</span>
            <select
              className="form-control"
              style={{ width: '280px' }}
              value={selectedClassId}
              onChange={e => handleSelectClass(e.target.value)}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) - {c.scheduleTime}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Ngày Điểm Danh:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: '160px' }}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Quick Realtime Attendance Counter */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="badge badge-blue">Sĩ số: {totalStudents} HS</span>
            <span className="badge badge-success">Có mặt (X): {presentCount}</span>
            <span className="badge badge-warning">Có phép (P): {excusedCount}</span>
            <span className="badge badge-danger">Không phép (K): {unexcusedCount}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        {/* Left Column: Student Attendance Table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <UserCheck size={18} color="var(--brand-blue)" />
              Danh Sách Học Sinh Lớp: {selectedClass?.name}
            </div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Bấm X, P, K để điểm danh nhanh
            </span>
          </div>

          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Mã HS</th>
                  <th>Họ Tên</th>
                  <th style={{ textAlign: 'center' }}>Điểm Danh</th>
                  <th>Ghi Chú Cá Nhân</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Chưa có học sinh nào đăng ký lớp học này.
                    </td>
                  </tr>
                ) : (
                  classStudents.map(st => {
                    const entry = entries.find(e => e.studentId === st.id) || { status: 'present', note: '' };
                    const isRedAlert = st.consecutiveAbsences >= 2;

                    return (
                      <tr key={st.id} className={isRedAlert ? 'row-danger' : ''}>
                        <td>
                          <button
                            className="badge badge-blue"
                            style={{ cursor: 'pointer', border: 'none' }}
                            onClick={() => onOpenStudentProfile(st)}
                            title="Bấm xem hồ sơ 360"
                          >
                            {st.studentCode}
                          </button>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--brand-navy)' }}>
                            {st.name}
                          </div>
                          {isRedAlert && (
                            <div style={{ fontSize: '11px', color: 'var(--color-danger)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <AlertOctagon size={11} /> Cảnh báo: Nghỉ 2 buổi liên tiếp!
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                            {/* X: Có mặt */}
                            <button
                              type="button"
                              className={`attendance-pill ${entry.status === 'present' ? 'present' : 'empty'}`}
                              onClick={() => handleStatusChange(st.id, 'present')}
                              title="Có mặt (X)"
                            >
                              X
                            </button>

                            {/* P: Có phép */}
                            <button
                              type="button"
                              className={`attendance-pill ${entry.status === 'absent_excused' ? 'absent-excused' : 'empty'}`}
                              onClick={() => handleStatusChange(st.id, 'absent_excused')}
                              title="Vắng có phép (P)"
                            >
                              P
                            </button>

                            {/* K: Không phép */}
                            <button
                              type="button"
                              className={`attendance-pill ${entry.status === 'absent_unexcused' ? 'absent-unexcused' : 'empty'}`}
                              onClick={() => handleStatusChange(st.id, 'absent_unexcused')}
                              title="Vắng không phép (K)"
                            >
                              K
                            </button>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            placeholder="Ghi chú (đến muộn 15p, xin về sớm...)"
                            value={entry.note}
                            onChange={e => handleNoteChange(st.id, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Teacher Attendance & Class Progress Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Teacher & Assistant Check-in */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '15px' }}>
                <Clock size={16} color="var(--brand-blue)" />
                Điểm Danh Giáo Viên & Trợ Giảng
              </div>
            </div>
            <div className="card-body" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>Giáo Viên: ThS. Nguyễn Văn Thành</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Phụ trách chính</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={teacherPresent}
                    onChange={e => setTeacherPresent(e.target.checked)}
                  />
                  <span className={`badge ${teacherPresent ? 'badge-success' : 'badge-danger'}`}>
                    {teacherPresent ? 'Có mặt' : 'Vắng'}
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>Trợ Giảng: Bùi Minh Đức</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Hỗ trợ chấm bài & quản lý lớp</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={assistantPresent}
                    onChange={e => setAssistantPresent(e.target.checked)}
                  />
                  <span className={`badge ${assistantPresent ? 'badge-success' : 'badge-danger'}`}>
                    {assistantPresent ? 'Có mặt' : 'Vắng'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Class Progress Notes (Item 11 in PDF) */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '15px' }}>
                <FileText size={16} color="var(--brand-navy)" />
                Ghi Chú Tiến Độ & Bài Về Nhà (GV / Trợ Giảng)
              </div>
            </div>
            <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12.5px' }}>Nội dung đã dạy trong buổi *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Ví dụ: Hoàn thành chuyên đề Bất đẳng thức Cauchy - Schwarz..."
                  value={progressNote.topicsTaught}
                  onChange={e => setProgressNote({ ...progressNote, topicsTaught: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12.5px' }}>Tiến độ bài học so với kế hoạch</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Đạt 100% mục tiêu buổi 8"
                  value={progressNote.progressStatus}
                  onChange={e => setProgressNote({ ...progressNote, progressStatus: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12.5px' }}>Bài tập về nhà & tài liệu giao thêm</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Phiếu bài tập số 5 câu 1 đến câu 10"
                  value={progressNote.homework}
                  onChange={e => setProgressNote({ ...progressNote, homework: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12.5px' }}>Đánh giá chung tình hình lớp / lưu ý cho buổi sau</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Học sinh hăng hái, một số bạn cần ôn lại công thức..."
                  value={progressNote.generalFeedback}
                  onChange={e => setProgressNote({ ...progressNote, generalFeedback: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
