import React, { useState, useEffect, useRef } from 'react';
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
  FileCheck,
  CheckCircle2,
  Keyboard,
  BarChart3
} from 'lucide-react';

export default function GradebookView({
  exams = [],
  classes = [],
  students = [],
  onAddExam,
  onUpdateExamScores,
  onOpenStudentProfile
}) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const classExams = exams.filter(e => e.classId === selectedClassId);
  const [selectedExamId, setSelectedExamId] = useState(classExams[0]?.id || exams[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Exam creation form
  const [examForm, setExamForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    maxScore: 10,
  });

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const currentExam = exams.find(e => e.id === selectedExamId) || classExams[0];
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

  const scoreInputRefs = useRef([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

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

  const handleSelectClass = (clsId) => {
    setSelectedClassId(clsId);
    const cExams = exams.filter(e => e.classId === clsId);
    const targetExamId = cExams[0]?.id || '';
    setSelectedExamId(targetExamId);
    const enrolled = students.filter(s => s.status === 'active' && s.classIds?.includes(clsId));
    const ex = exams.find(e => e.id === targetExamId);
    setScoresState(enrolled.map(st => {
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

  // EXCEL HOTKEYS
  const handleScoreKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (index + 1 < classStudents.length) {
        scoreInputRefs.current[index + 1]?.focus();
        scoreInputRefs.current[index + 1]?.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index - 1 >= 0) {
        scoreInputRefs.current[index - 1]?.focus();
        scoreInputRefs.current[index - 1]?.select();
      }
    }
  };

  // SAVE SCORES
  const handleSaveScores = () => {
    if (!currentExam) return;
    const gradedCount = scoresState.filter(s => s.score !== '' && s.score !== null).length;
    onUpdateExamScores(currentExam.id, scoresState.map(s => ({
      ...s,
      score: s.score === '' ? 0 : Number(s.score)
    })));
    showToast(`Đã lưu bảng điểm bài kiểm tra "${currentExam.title}". ${gradedCount}/${classStudents.length} học sinh đã được cập nhật điểm.`);
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
        score: '',
        comment: ''
      }))
    };

    onAddExam(newExam);
    setSelectedExamId(newExam.id);
    setIsModalOpen(false);
    showToast(`Đã khởi tạo đợt kiểm tra mới: "${newExam.title}". Bạn có thể vào điểm ngay.`);
  };

  // Quick statistics
  const numericScores = scoresState
    .map(s => Number(s.score))
    .filter(sc => !isNaN(sc) && sc > 0);
  
  const avgScore = numericScores.length > 0
    ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1)
    : 0;

  const maxScoreFound = numericScores.length > 0 ? Math.max(...numericScores) : 0;
  const goodCount = numericScores.filter(s => s >= 8.0).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-800">✕</button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              Sổ điểm điện tử & khảo sát định kỳ
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1">
              <Keyboard size={12} /> Excel Hotkeys: Enter, Tab, ↑↓
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bấm phím Tab hoặc Enter để tự động chuyển dòng nhập điểm học sinh kế tiếp
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Tạo bài khảo sát mới
          </button>

          <button
            onClick={handleSaveScores}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={14} /> Lưu toàn bộ bảng điểm
          </button>
        </div>
      </div>

      {/* SELECTORS & STATS BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Selectors */}
        <div className="lg:col-span-8 p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap text-xs shadow-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Lớp học:</span>
              <select
                value={selectedClassId}
                onChange={e => handleSelectClass(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Bài kiểm tra:</span>
              <select
                value={selectedExamId}
                onChange={e => handleSelectExam(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {classExams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} (Ngày: {ex.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>Sĩ số: <strong className="text-slate-900">{classStudents.length} HS</strong></span>
          </div>
        </div>

        {/* Live Metrics Card */}
        <div className="lg:col-span-4 p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-around text-xs shadow-xs">
          <div className="text-center">
            <div className="text-[11px] text-slate-400">Điểm TB Lớp</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">{avgScore}</div>
          </div>
          <div className="w-px h-7 bg-slate-100"></div>
          <div className="text-center">
            <div className="text-[11px] text-slate-400">Điểm Cao Nhất</div>
            <div className="text-base font-bold text-emerald-700 mt-0.5 tabular-nums">{maxScoreFound}</div>
          </div>
          <div className="w-px h-7 bg-slate-100"></div>
          <div className="text-center">
            <div className="text-[11px] text-slate-400">Giỏi (≥8.0)</div>
            <div className="text-base font-bold text-amber-800 mt-0.5 tabular-nums">{goodCount} HS</div>
          </div>
        </div>
      </div>

      {/* SPREADSHEET TABLE FOR GRADES */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800">
            Nhập điểm: {currentExam?.title || 'Bài kiểm tra'}
          </span>
          <span className="text-slate-400">
            Nhấn Enter hoặc Tab để chuyển ô tiếp theo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-medium">
                <th className="py-2.5 px-4 w-12 text-center">STT</th>
                <th className="py-2.5 px-4">Mã & Họ tên học sinh</th>
                <th className="py-2.5 px-4 w-36 text-center">Điểm số (Thang 10)</th>
                <th className="py-2.5 px-4 w-28 text-center">Xếp loại</th>
                <th className="py-2.5 px-4">Nhận xét của giáo viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((st, idx) => {
                const scItem = scoresState.find(s => s.studentId === st.id) || { score: '', comment: '' };
                const numScore = Number(scItem.score);
                let rankLabel = '—';
                let rankClass = 'text-slate-400';

                if (scItem.score !== '' && !isNaN(numScore)) {
                  if (numScore >= 8.0) {
                    rankLabel = 'Giỏi';
                    rankClass = 'text-emerald-700 bg-emerald-50';
                  } else if (numScore >= 6.5) {
                    rankLabel = 'Khá';
                    rankClass = 'text-blue-700 bg-blue-50';
                  } else if (numScore >= 5.0) {
                    rankLabel = 'Trung bình';
                    rankClass = 'text-amber-800 bg-amber-50';
                  } else {
                    rankLabel = 'Cần bù';
                    rankClass = 'text-rose-700 bg-rose-50';
                  }
                }

                return (
                  <tr key={st.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => onOpenStudentProfile && onOpenStudentProfile(st)}
                          className="font-medium text-slate-900 hover:text-amber-700 transition cursor-pointer"
                        >
                          {st.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded">
                          {st.studentCode}
                        </span>
                      </div>
                    </td>

                    {/* Numeric Score Input */}
                    <td className="py-2.5 px-4 text-center">
                      <input
                        ref={el => scoreInputRefs.current[idx] = el}
                        type="number"
                        step="0.25"
                        min="0"
                        max="10"
                        placeholder="0.0"
                        value={scItem.score}
                        onChange={e => handleScoreChange(st.id, e.target.value)}
                        onKeyDown={e => handleScoreKeyDown(e, idx)}
                        className="w-20 text-center py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition tabular-nums"
                      />
                    </td>

                    {/* Rank Badge */}
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${rankClass}`}>
                        {rankLabel}
                      </span>
                    </td>

                    {/* Comment */}
                    <td className="py-2.5 px-4">
                      <input
                        type="text"
                        placeholder="Nhận xét bài làm..."
                        value={scItem.comment}
                        onChange={e => handleCommentChange(st.id, e.target.value)}
                        className="w-full px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EXAM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 text-slate-800 text-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Award size={16} className="text-amber-600" /> Tạo đợt kiểm tra / khảo sát mới
            </h3>

            <form onSubmit={handleCreateExam} className="space-y-3.5">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Tên bài kiểm tra</label>
                <input
                  type="text"
                  required
                  placeholder="Khảo sát Toán 10 Lần 1 - Chuyên đề Hàm số"
                  value={examForm.title}
                  onChange={e => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Ngày thi</label>
                  <input
                    type="date"
                    required
                    value={examForm.date}
                    onChange={e => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Thang điểm tối đa</label>
                  <input
                    type="number"
                    required
                    value={examForm.maxScore}
                    onChange={e => setExamForm({ ...examForm, maxScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium cursor-pointer"
                >
                  Tạo bài kiểm tra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
