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
  Settings,
  BookOpen
} from 'lucide-react';

export default function ClassesView({
  classes = [],
  grades = [],
  teachers = [],
  students = [],
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
    if (!formData.name.trim()) return;

    if (editingClass) {
      onUpdateClass(editingClass.id, formData);
    } else {
      onAddClass({
        id: `cls-${Date.now()}`,
        ...formData,
        isArchived: false
      });
    }
    setIsModalOpen(false);
  };

  const handleAddGradeSubmit = (e) => {
    e.preventDefault();
    if (!newGradeName.trim()) return;
    onAddGrade({
      id: `g-${Date.now()}`,
      name: newGradeName.trim()
    });
    setNewGradeName('');
    setIsGradeModalOpen(false);
  };

  const getSubjectColor = (subject) => {
    if (subject?.includes('Toán')) return 'border-l-amber-500 bg-amber-50/30';
    if (subject?.includes('Lý')) return 'border-l-blue-500 bg-blue-50/30';
    if (subject?.includes('Hóa')) return 'border-l-purple-500 bg-purple-50/30';
    return 'border-l-emerald-500 bg-emerald-50/30';
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap shadow-xs">
        <div>
          <h1 className="text-base font-semibold text-slate-900 tracking-tight">
            Quản lý khối lớp & chương trình giảng dạy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách lớp học, phân bổ giáo viên, phòng học và ca sáng / chiều
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGradeModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            <Settings size={14} /> Cấu hình khối lớp
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Mở lớp học mới
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap text-xs shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-medium">Khối học:</span>
          <button
            onClick={() => setSelectedGradeId('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              selectedGradeId === 'all' ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả khối
          </button>
          {grades.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGradeId(g.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedGradeId === g.id ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-slate-600 cursor-pointer user-select-none">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={e => setShowArchived(e.target.checked)}
            className="rounded border-slate-300 text-amber-600 cursor-pointer"
          />
          <span>Hiển thị lớp đã ẩn ({classes.filter(c => c.isArchived).length})</span>
        </label>
      </div>

      {/* Classes Grid Cards (Google Calendar / Notion Soft Event Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map(cls => {
          const grade = grades.find(g => g.id === cls.gradeId);
          const teacher = teachers.find(t => t.id === cls.teacherId);
          const assistant = teachers.find(t => t.id === cls.assistantId);
          const enrolledCount = students.filter(s => s.status === 'active' && s.classIds?.includes(cls.id)).length;
          const subjectColorClass = getSubjectColor(cls.subject);

          return (
            <div
              key={cls.id}
              className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs border-l-4 overflow-hidden flex flex-col justify-between transition hover:shadow-md ${subjectColorClass} ${
                cls.isArchived ? 'opacity-60 border-dashed' : ''
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {cls.code}
                    </span>
                    <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {grade?.name}
                    </span>
                    <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {cls.sessionType === 'morning' ? 'Ca Sáng' : 'Ca Chiều/Tối'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">{cls.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition cursor-pointer"
                    title="Chỉnh sửa lớp"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => onToggleArchiveClass(cls.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition cursor-pointer"
                    title={cls.isArchived ? 'Mở lại lớp' : 'Ẩn lớp'}
                  >
                    {cls.isArchived ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5 text-xs text-slate-600 bg-white flex-1">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{cls.scheduleDays?.join(', ')}</span>
                  <span className="text-slate-400">({cls.scheduleTime})</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span>Phòng học: <strong className="text-slate-800">{cls.room}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400 shrink-0" />
                  <span>GV: <strong className="text-slate-800">{teacher?.name || 'Chưa phân công'}</strong></span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500">
                    Sĩ số: <strong className="text-slate-900">{enrolledCount}</strong> / {cls.maxCapacity} học sinh
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {cls.feePerMonth?.toLocaleString('vi-VN')} đ/tháng
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Mở / Chỉnh Sửa Lớp */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 text-slate-800 text-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap size={16} className="text-amber-600" />
              {editingClass ? `Chỉnh sửa lớp: ${editingClass.name}` : 'Mở lớp học mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Mã lớp (*)</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Tên lớp (*)</label>
                  <input
                    type="text"
                    required
                    placeholder="Toán Nâng Cao 10A"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Khối học</label>
                  <select
                    value={formData.gradeId}
                    onChange={e => setFormData({ ...formData, gradeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Môn học</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Giáo viên phụ trách</label>
                  <select
                    value={formData.teacherId}
                    onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    {teachers.filter(t => t.role === 'teacher').map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Trợ giảng ca học</label>
                  <select
                    value={formData.assistantId}
                    onChange={e => setFormData({ ...formData, assistantId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  >
                    {teachers.filter(t => t.role === 'assistant').map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Giờ học</label>
                  <input
                    type="text"
                    placeholder="17:30 - 19:30"
                    value={formData.scheduleTime}
                    onChange={e => setFormData({ ...formData, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Phòng học</label>
                  <input
                    type="text"
                    placeholder="Phòng 201"
                    value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Sĩ số tối đa</label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={e => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Học phí / tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.feePerMonth}
                    onChange={e => setFormData({ ...formData, feePerMonth: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 tabular-nums"
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
                  Lưu lớp học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cấu hình khối lớp */}
      {isGradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 text-slate-800 text-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Settings size={16} className="text-amber-600" /> Cấu hình danh mục khối lớp
            </h3>

            <div className="space-y-2 mb-4">
              {grades.map(g => (
                <div key={g.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex justify-between font-medium">
                  <span>{g.name}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{g.id}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddGradeSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Tên khối mới</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khối 6, Luyện thi ĐGNL..."
                  value={newGradeName}
                  onChange={e => setNewGradeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGradeModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium"
                >
                  Thêm khối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
