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

  // EXCEL HOTKEYS: Enter / Tab / ArrowDown jumps to next student
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

  // SAVE SCORES WITH NATURAL ACTION VOICE
  const handleSaveScores = () => {
    if (!currentExam) return;
    const gradedCount = scoresState.filter(s => s.score !== '' && s.score !== null).length;
    onUpdateExamScores(currentExam.id, scoresState.map(s => ({
      ...s,
      score: s.score === '' ? 0 : Number(s.score)
    })));
    showToast(`Đã lưu bảng điểm bài kiểm tra "${currentExam.title}". ${gradedCount}/${classStudents.length} học sinh đã được cập nhật điểm vào học bạ.`);
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
    showToast(`Đã khởi tạo đợt kiểm tra mới: "${newExam.title}". Bạn có thể vào điểm ngay bây giờ.`);
  };

  // Quick statistics calculation
  const numericScores = scoresState
    .map(s => Number(s.score))
    .filter(sc => !isNaN(sc) && sc > 0);
  
  const avgScore = numericScores.length > 0
    ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1)
    : 0;

  const maxScoreFound = numericScores.length > 0 ? Math.max(...numericScores) : 0;
  const goodCount = numericScores.filter(s => s >= 8.0).length;
  const fairCount = numericScores.filter(s => s >= 6.5 && s < 8.0).length;
  const averageCount = numericScores.filter(s => s >= 5.0 && s < 6.5).length;
  const weakCount = numericScores.filter(s => s < 5.0).length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-400/80 hover:text-emerald-300">✕</button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 flex items-center justify-between gap-4 flex-wrap shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Award size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Sổ Điểm Điện Tử & Khảo Sát Định Kỳ
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold uppercase flex items-center gap-1">
                <Keyboard size={11} /> Excel Hotkeys
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bấm phím Tab hoặc Enter để tự động chuyển dòng nhập điểm học sinh kế tiếp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Plus size={14} /> Tạo bài khảo sát mới
          </button>

          <button
            onClick={handleSaveScores}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Save size={14} /> Lưu Toàn Bộ Bảng Điểm
          </button>
        </div>
      </div>

      {/* SELECTORS & STATS BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Selectors */}
        <div className="lg:col-span-8 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Chọn Lớp:</span>
              <select
                value={selectedClassId}
                onChange={e => handleSelectClass(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium focus:outline-none focus:border-amber-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Chọn Bài kiểm tra:</span>
              <select
                value={selectedExamId}
                onChange={e => handleSelectExam(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium focus:outline-none focus:border-amber-500"
              >
                {classExams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} (Ngày: {ex.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Sĩ số: <strong className="text-white">{classStudents.length} HS</strong></span>
          </div>
        </div>

        {/* Live Metrics Card */}
        <div className="lg:col-span-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-around text-xs">
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">Điểm TB Lớp</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">{avgScore}</div>
          </div>
          <div className="w-px h-7 bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">Điểm Cao Nhất</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">{maxScoreFound}</div>
          </div>
          <div className="w-px h-7 bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400 uppercase">Giỏi (≥8.0)</div>
            <div className="text-base font-bold text-blue-400 mt-0.5">{goodCount} HS</div>
          </div>
        </div>
      </div>

      {/* SPREADSHEET TABLE FOR GRADES */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-2">
            <FileCheck size={14} className="text-amber-400" />
            Nhập Điểm: {currentExam?.title || 'Bài kiểm tra'}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Nhấn Enter hoặc Tab để chuyển ô tiếp theo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3 w-12 text-center">STT</th>
                <th className="py-2.5 px-3">Mã HS & Họ Tên</th>
                <th className="py-2.5 px-3 w-40 text-center">Điểm số (Thang 10)</th>
                <th className="py-2.5 px-3 w-28 text-center">Xếp loại</th>
                <th className="py-2.5 px-3">Nhận xét của Giáo viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {classStudents.map((st, idx) => {
                const scItem = scoresState.find(s => s.studentId === st.id) || { score: '', comment: '' };
                const numScore = Number(scItem.score);
                let rankLabel = '—';
                let rankClass = 'text-slate-500';

                if (scItem.score !== '' && !isNaN(numScore)) {
                  if (numScore >= 8.0) {
                    rankLabel = 'Giỏi';
                    rankClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  } else if (numScore >= 6.5) {
                    rankLabel = 'Khá';
                    rankClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                  } else if (numScore >= 5.0) {
                    rankLabel = 'Trung bình';
                    rankClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                  } else {
                    rankLabel = 'Yếu / Bù';
                    rankClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                  }
                }

                return (
                  <tr key={st.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => onOpenStudentProfile && onOpenStudentProfile(st)}
                          className="font-semibold text-slate-200 hover:text-amber-400 transition cursor-pointer"
                        >
                          {st.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1 py-0.2 rounded border border-slate-800">
                          {st.studentCode}
                        </span>
                      </div>
                    </td>

                    {/* Numeric Score Input with Excel Keys */}
                    <td className="py-2.5 px-3 text-center">
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
                        className="w-24 text-center py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500 focus:bg-amber-500/5 transition"
                      />
                    </td>

                    {/* Rank Badge */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${rankClass}`}>
                        {rankLabel}
                      </span>
                    </td>

                    {/* Comment */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="Nhận xét ưu/nhược điểm..."
                        value={scItem.comment}
                        onChange={e => handleCommentChange(st.id, e.target.value)}
                        className="w-full px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0B1120] border border-slate-700 rounded-2xl shadow-2xl p-5 text-slate-100">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Award size={16} className="text-amber-400" /> Tạo Đợt Khảo Sát / Thi Thử Mới
            </h3>

            <form onSubmit={handleCreateExam} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tên bài kiểm tra / Khảo sát</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Khảo sát Toán 10 Lần 1 - Chuyên đề Hàm Số"
                  value={examForm.title}
                  onChange={e => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Ngày thi</label>
                  <input
                    type="date"
                    required
                    value={examForm.date}
                    onChange={e => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Thang điểm tối đa</label>
                  <input
                    type="number"
                    required
                    value={examForm.maxScore}
                    onChange={e => setExamForm({ ...examForm, maxScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold"
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
