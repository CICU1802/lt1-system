import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ScheduleView({ classes, teachers, grades, onOpenStudentProfile }) {
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all'); // 'all' | 'morning' | 'afternoon'

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  const filteredClasses = classes.filter(c => {
    if (c.isArchived) return false;
    if (selectedGrade !== 'all' && c.gradeId !== selectedGrade) return false;
    if (selectedSession !== 'all' && c.sessionType !== selectedSession) return false;
    return true;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CalendarDays size={24} color="var(--brand-blue)" />
            Thời Khóa Biểu & Lịch Giảng Dạy Tuần
          </h1>
          <p className="page-description">
            Theo dõi phân bổ phòng học, ca học sáng/chiều, giáo viên phụ trách và trợ giảng theo ngày trong tuần.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '14px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Lọc Khối:</span>
            <button
              className={`btn btn-sm ${selectedGrade === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedGrade('all')}
            >
              Tất Cả Khối
            </button>
            {grades.map(g => (
              <button
                key={g.id}
                className={`btn btn-sm ${selectedGrade === g.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedGrade(g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Buổi Học:</span>
            <button
              className={`btn btn-sm ${selectedSession === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedSession('all')}
            >
              Tất Cả
            </button>
            <button
              className={`btn btn-sm ${selectedSession === 'morning' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedSession('morning')}
            >
              Ca Sáng
            </button>
            <button
              className={`btn btn-sm ${selectedSession === 'afternoon' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedSession('afternoon')}
            >
              Ca Chiều / Tối
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {daysOfWeek.map(day => {
          const dayClasses = filteredClasses.filter(c => c.scheduleDays?.includes(day));

          return (
            <div key={day} className="card" style={{ marginBottom: 0, minHeight: '380px' }}>
              <div
                className="card-header"
                style={{
                  background: day === 'Thứ 2' ? 'linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-blue) 100%)' : 'var(--bg-subtle)',
                  color: day === 'Thứ 2' ? '#ffffff' : 'var(--brand-navy)',
                  padding: '12px 14px'
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '14px' }}>{day}</div>
                <span className="badge badge-gray" style={{ fontSize: '11px', background: day === 'Thứ 2' ? 'rgba(255,255,255,0.2)' : '', color: day === 'Thứ 2' ? '#ffffff' : '' }}>
                  {dayClasses.length} ca học
                </span>
              </div>

              <div className="card-body" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dayClasses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                    Không có lịch học
                  </div>
                ) : (
                  dayClasses.map(cls => {
                    const teacher = teachers.find(t => t.id === cls.teacherId);

                    return (
                      <div
                        key={cls.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-color)',
                          borderLeft: cls.sessionType === 'morning' ? '4px solid #f59e0b' : '4px solid var(--brand-blue)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px',
                          boxShadow: 'var(--shadow-xs)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span className="badge badge-blue" style={{ fontSize: '10px', padding: '2px 6px' }}>{cls.code}</span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{cls.room}</span>
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--brand-navy)', marginBottom: '4px' }}>
                          {cls.name}
                        </div>

                        <div style={{ fontSize: '11.5px', color: 'var(--brand-blue)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> {cls.scheduleTime}
                        </div>

                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          GV: {teacher?.name?.split('.').pop() || 'Chưa xếp'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
