import React, { useState } from 'react';
import {
  Award,
  Plus,
  Save,
  Check,
  TrendingUp,
  Search,
  Filter,
  Users,
  Calendar,
  FileCheck
} from 'lucide-react';

export default function GradebookView({
  exams,
  classes,
  students,
  onAddExam,
  onUpdateExamScores,
  onOpenStudentProfile
}) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const classExams = exams.filter(e => e.classId === selectedClassId);
  const [selectedExamId, setSelectedExamId] = useState(classExams[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Exam creation form
  const [examForm, setExamForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    maxScore: 10,
  });

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const currentExam = exams.find(e => e.id === selectedExamId);
  const classStudents = students.filter(
    s => s.status === 'active' && s.classIds?.includes(selectedClassId)
  );

  // Local scores state
  const [scoresState, setScoresState] = useState(() => {
    return classStudents.map(st => {
      const existing = currentExam?.scores?.find(s => s.studentId === st.id);
      return {
        studentId: st.id,
        studentName: st.name,
        score: existing ? existing.score : '',
        comment: existing?.comment || ''
      };
    });
  });

  // Sync when class or exam changes
  const handleSelectExam = (examId) => {
    setSelectedExamId(examId);
    const ex = exams.find(e => e.id === examId);
    setScoresState(classStudents.map(st => {
      const existing = ex?.scores?.find(s => s.studentId === st.id);
      return {
        studentId: st.id,
        studentName: st.name,
        score: existing ? existing.score : '',
        comment: existing?.comment || ''
      };
    }));
  };

  const handleScoreChange = (studentId, val) => {
    setScoresState(prev => prev.map(s => s.studentId === studentId ? { ...s, score: val } : s));
  };

  const handleCommentChange = (studentId, val) => {
    setScoresState(prev => prev.map(s => s.studentId === studentId ? { ...s, comment: val } : s));
  };

  const handleSaveScores = () => {
    if (!currentExam) return;
    onUpdateExamScores(currentExam.id, scoresState.map(s => ({
      ...s,
      score: s.score === '' ? 0 : Number(s.score)
    })));
    setSaveSuccessMsg('Đã lưu bảng điểm và nhận xét vào hệ thống thành công!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleCreateExam = (e) => {
    e.preventDefault();
    if (!examForm.title.trim()) return;

    const newExam = {
      id: `ex-${Date.now()}`,
      classId: selectedClassId,
      className: selectedClass?.name || '',
      title: examForm.title,
      date: examForm.date,
      maxScore: Number(examForm.maxScore),
      scores: classStudents.map(st => ({
        studentId: st.id,
        studentName: st.name,
        score: 0,
        comment: ''
      }))
    };

    onAddExam(newExam);
    setSelectedExamId(newExam.id);
    setIsModalOpen(false);
  };

  // Stats calculation
  const validScores = scoresState.filter(s => s.score !== '' && !isNaN(Number(s.score)));
  const avgScore = validScores.length > 0
    ? (validScores.reduce((acc, s) => acc + Number(s.score), 0) / validScores.length).toFixed(1)
    : 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Award size={24} color="var(--brand-blue)" />
            Sổ Điểm, Đánh Giá & Theo Dõi Tiến Bộ
          </h1>
          <p className="page-description">
            Tạo các bài kiểm tra 15 phút, 1 tiết, thi học kỳ; nhập điểm theo danh sách lớp và liên kết hồ sơ tra cứu.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Tạo Lần Kiểm Tra Mới
        </button>
      </div>

      {saveSuccessMsg && (
        <div style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', padding: '12px 18px', borderRadius: 'var(--radius-md)', color: '#065f46', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {saveSuccessMsg}
        </div>
      )}

      {/* Selectors Toolbar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Chọn Lớp:</span>
            <select
              className="form-control"
              style={{ width: '280px' }}
              value={selectedClassId}
              onChange={e => {
                const newCls = e.target.value;
                setSelectedClassId(newCls);
                const exForCls = exams.filter(ex => ex.classId === newCls);
                if (exForCls.length > 0) handleSelectExam(exForCls[0].id);
              }}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Bài Kiểm Tra:</span>
            <select
              className="form-control"
              style={{ width: '320px' }}
              value={selectedExamId}
              onChange={e => handleSelectExam(e.target.value)}
            >
              {classExams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} (Ngày {ex.date})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="badge badge-blue">Sĩ số: {classStudents.length} HS</span>
            <span className="badge badge-success">Điểm TB Lớp: {avgScore} / 10</span>
            <button className="btn btn-primary btn-sm" onClick={handleSaveScores}>
              <Save size={14} /> Lưu Sổ Điểm
            </button>
          </div>
        </div>
      </div>

      {/* Grade Entry Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileCheck size={18} color="var(--brand-blue)" />
            Bảng Điểm: {currentExam?.title || 'Chưa chọn bài kiểm tra'}
          </div>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Thang điểm: 0 - 10 | Điểm tự động cập nhật vào tài khoản học sinh / phụ huynh
          </span>
        </div>

        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Mã HS</th>
                <th>Họ và Tên Học Sinh</th>
                <th style={{ width: '130px' }}>Điểm Số (/10)</th>
                <th>Đánh Giá Xếp Loại</th>
                <th>Nhận Xét Chi Tiết Của Giáo Viên</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Không có học sinh trong lớp này.
                  </td>
                </tr>
              ) : (
                scoresState.map(stScore => {
                  const num = Number(stScore.score);
                  let rank = 'Chưa nhập';
                  let rankBadge = 'badge-gray';
                  if (stScore.score !== '' && !isNaN(num)) {
                    if (num >= 9) { rank = 'Xuất Sắc'; rankBadge = 'badge-success'; }
                    else if (num >= 8) { rank = 'Giỏi'; rankBadge = 'badge-blue'; }
                    else if (num >= 6.5) { rank = 'Khá'; rankBadge = 'badge-warning'; }
                    else { rank = 'Cần Bồi Dưỡng'; rankBadge = 'badge-danger'; }
                  }

                  const studentObj = students.find(s => s.id === stScore.studentId);

                  return (
                    <tr key={stScore.studentId}>
                      <td>
                        <button
                          className="badge badge-blue"
                          style={{ cursor: 'pointer', border: 'none' }}
                          onClick={() => studentObj && onOpenStudentProfile(studentObj)}
                          title="Bấm để xem lịch sử điểm qua các kỳ"
                        >
                          {studentObj?.studentCode}
                        </button>
                      </td>
                      <td>
                        <strong>{stScore.studentName}</strong>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="10"
                          className="form-control"
                          style={{ fontWeight: '800', textAlign: 'center', fontSize: '15px' }}
                          value={stScore.score}
                          onChange={e => handleScoreChange(stScore.studentId, e.target.value)}
                        />
                      </td>
                      <td>
                        <span className={`badge ${rankBadge}`}>{rank}</span>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nhận xét ưu điểm, phần bài làm cần khắc phục..."
                          value={stScore.comment}
                          onChange={e => handleCommentChange(stScore.studentId, e.target.value)}
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

      {/* Create Exam Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Tạo Lần Kiểm Tra Mới</div>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateExam}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên Bài Kiểm Tra / Khảo Sát *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Kiểm tra 1 tiết Đại số chương 2, Thi thử ĐH đợt 1..."
                    value={examForm.title}
                    onChange={e => setExamForm({ ...examForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày Kiểm Tra *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={examForm.date}
                      onChange={e => setExamForm({ ...examForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thang Điểm Tối Đa</label>
                    <input
                      type="number"
                      className="form-control"
                      value={examForm.maxScore}
                      onChange={e => setExamForm({ ...examForm, maxScore: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Khởi Tạo Bài Kiểm Tra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
