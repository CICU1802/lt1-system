import React, { useState, useEffect } from 'react';
import ModernShell from './components/ModernShell';
import CommandPalette from './components/CommandPalette';
import StudentProfileModal from './components/StudentProfileModal';
import VietQRModal from './components/VietQRModal';

import ModernDashboardView from './components/views/ModernDashboardView';
import StudentsView from './components/views/StudentsView';
import ClassesView from './components/views/ClassesView';
import ScheduleView from './components/views/ScheduleView';
import AttendanceView from './components/views/AttendanceView';
import MakeupClassView from './components/views/MakeupClassView';
import StaffView from './components/views/StaffView';
import TuitionView from './components/views/TuitionView';
import GradebookView from './components/views/GradebookView';
import ParentPortalView from './components/views/ParentPortalView';
import ReportsView from './components/views/ReportsView';

import {
  initialStudents,
  initialGrades,
  initialClasses,
  initialTeachers,
  initialAttendance,
  initialMakeups,
  initialInvoices,
  initialExams,
  initialCombos
} from './data/mockData';

export default function App() {
  // App navigation state
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('admin'); // 'admin' | 'staff' | 'teacher' | 'assistant' | 'parent'
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Domain data
  const [students, setStudents] = useState(initialStudents);
  const [grades, setGrades] = useState(initialGrades);
  const [classes, setClasses] = useState(initialClasses);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [makeups, setMakeups] = useState(initialMakeups);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [exams, setExams] = useState(initialExams);
  const [combos, setCombos] = useState(initialCombos);

  // Active Modals
  const [activeStudentProfile, setActiveStudentProfile] = useState(null);
  const [activeVietQRInvoice, setActiveVietQRInvoice] = useState(null);

  // Keyboard shortcut: Cmd/Ctrl + K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Alert calculations
  const alertCount = students.filter(s => s.consecutiveAbsences >= 2).length;
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  // Handlers for Students
  const handleAddStudent = (newStudent) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleUpdateStudent = (id, updatedFields) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  const handleToggleStudentStatus = (id, newStatus) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: newStatus,
          droppedDate: newStatus === 'dropped' ? new Date().toISOString().split('T')[0] : null
        };
      }
      return s;
    }));
  };

  const handleReEnrollStudent = (id) => {
    handleToggleStudentStatus(id, 'active');
    if (activeStudentProfile?.id === id) {
      setActiveStudentProfile(prev => ({ ...prev, status: 'active', droppedDate: null }));
    }
  };

  // Handlers for Classes & Grades
  const handleAddClass = (newClass) => {
    setClasses(prev => [newClass, ...prev]);
  };

  const handleUpdateClass = (id, updatedFields) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const handleToggleArchiveClass = (id) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, isArchived: !c.isArchived } : c));
  };

  const handleAddGrade = (newGrade) => {
    setGrades(prev => [...prev, newGrade]);
  };

  // Handlers for Attendance
  const handleSaveAttendance = (record) => {
    setAttendance(prev => {
      const idx = prev.findIndex(a => a.id === record.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });

    // Check consecutive absences for students in this session
    record.entries.forEach(entry => {
      if (entry.status === 'absent_unexcused') {
        setStudents(prev => prev.map(st => {
          if (st.id === entry.studentId) {
            const nextAbs = (st.consecutiveAbsences || 0) + 1;
            return {
              ...st,
              consecutiveAbsences: nextAbs,
              alertReason: nextAbs >= 2 ? `Nghỉ liên tiếp ${nextAbs} buổi gần nhất (buổi ngày ${record.date})` : st.alertReason
            };
          }
          return st;
        }));
      } else if (entry.status === 'present') {
        // Reset streak on attendance
        setStudents(prev => prev.map(st => {
          if (st.id === entry.studentId) {
            return { ...st, consecutiveAbsences: 0, alertReason: null };
          }
          return st;
        }));
      }
    });
  };

  const handleToggleLockAttendance = (recordId, lockState) => {
    setAttendance(prev => prev.map(a => {
      if (a.id === recordId) {
        return {
          ...a,
          isLocked: lockState,
          lockedAt: lockState ? new Date().toISOString() : null
        };
      }
      return a;
    }));
  };

  // Handlers for Makeup Classes
  const handleAddMakeup = (newMakeup) => {
    setMakeups(prev => [newMakeup, ...prev]);
  };

  const handleUpdateMakeupStatus = (id, newStatus) => {
    setMakeups(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
  };

  // Handlers for Staff
  const handleAddTeacher = (newTeacher) => {
    setTeachers(prev => [newTeacher, ...prev]);
  };

  const handleUpdateTeacher = (id, updatedFields) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  // Handlers for Tuition
  const handleAddInvoice = (newInvoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const handleConfirmPayment = (invoiceId) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          paidAmount: inv.finalAmount,
          remainingAmount: 0,
          status: 'paid',
          paidDate: new Date().toISOString().split('T')[0]
        };
      }
      return inv;
    }));
  };

  // Handlers for Exams & Gradebook
  const handleAddExam = (newExam) => {
    setExams(prev => [newExam, ...prev]);
  };

  const handleUpdateExamScores = (examId, updatedScores) => {
    setExams(prev => prev.map(e => e.id === examId ? { ...e, scores: updatedScores } : e));
  };

  // Switch role handler: auto redirect if tab not accessible
  const handleRoleChange = (role) => {
    setUserRole(role);
    if (role === 'parent') {
      setCurrentTab('parent-portal');
    } else if (role === 'teacher' || role === 'assistant') {
      if (currentTab === 'students' || currentTab === 'tuition' || currentTab === 'reports') {
        setCurrentTab('attendance');
      }
    }
  };

  return (
    <ModernShell
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      userRole={userRole}
      setUserRole={handleRoleChange}
      alertCount={alertCount}
      overdueCount={overdueCount}
      onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
    >
      {/* View Router */}
      {currentTab === 'dashboard' && (
        <ModernDashboardView
          students={students}
          classes={classes}
          attendance={attendance}
          invoices={invoices}
          makeups={makeups}
          setCurrentTab={setCurrentTab}
          onOpenStudentProfile={setActiveStudentProfile}
          onOpenVietQR={setActiveVietQRInvoice}
        />
      )}

      {currentTab === 'students' && (
        <StudentsView
          students={students}
          classes={classes}
          invoices={invoices}
          exams={exams}
          attendance={attendance}
          onAddStudent={handleAddStudent}
          onUpdateStudent={handleUpdateStudent}
          onToggleStudentStatus={handleToggleStudentStatus}
          onOpenStudentProfile={setActiveStudentProfile}
          onOpenVietQR={setActiveVietQRInvoice}
        />
      )}

      {currentTab === 'classes' && (
        <ClassesView
          classes={classes}
          grades={grades}
          teachers={teachers}
          students={students}
          onAddClass={handleAddClass}
          onUpdateClass={handleUpdateClass}
          onToggleArchiveClass={handleToggleArchiveClass}
          onAddGrade={handleAddGrade}
        />
      )}

      {currentTab === 'schedule' && (
        <ScheduleView
          classes={classes}
          teachers={teachers}
          grades={grades}
          onOpenStudentProfile={setActiveStudentProfile}
        />
      )}

      {currentTab === 'attendance' && (
        <AttendanceView
          classes={classes}
          students={students}
          attendance={attendance}
          userRole={userRole}
          onSaveAttendance={handleSaveAttendance}
          onToggleLockAttendance={handleToggleLockAttendance}
          onOpenStudentProfile={setActiveStudentProfile}
        />
      )}

      {currentTab === 'makeup' && (
        <MakeupClassView
          makeups={makeups}
          students={students}
          classes={classes}
          onAddMakeup={handleAddMakeup}
          onUpdateMakeupStatus={handleUpdateMakeupStatus}
          onOpenStudentProfile={setActiveStudentProfile}
        />
      )}

      {currentTab === 'staff' && (
        <StaffView
          teachers={teachers}
          classes={classes}
          onAddTeacher={handleAddTeacher}
          onUpdateTeacher={handleUpdateTeacher}
        />
      )}

      {currentTab === 'tuition' && (
        <TuitionView
          invoices={invoices}
          students={students}
          classes={classes}
          combos={combos}
          onAddInvoice={handleAddInvoice}
          onOpenVietQR={setActiveVietQRInvoice}
          onConfirmPayment={handleConfirmPayment}
          onOpenStudentProfile={setActiveStudentProfile}
        />
      )}

      {currentTab === 'gradebook' && (
        <GradebookView
          exams={exams}
          classes={classes}
          students={students}
          onAddExam={handleAddExam}
          onUpdateExamScores={handleUpdateExamScores}
          onOpenStudentProfile={setActiveStudentProfile}
        />
      )}

      {currentTab === 'parent-portal' && (
        <ParentPortalView
          students={students}
          classes={classes}
          attendance={attendance}
          invoices={invoices}
          exams={exams}
          makeups={makeups}
          onOpenVietQR={setActiveVietQRInvoice}
        />
      )}

      {currentTab === 'reports' && (
        <ReportsView
          students={students}
          classes={classes}
          attendance={attendance}
          invoices={invoices}
          makeups={makeups}
          teachers={teachers}
          exams={exams}
        />
      )}

      {/* Global Command Palette (⌘K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        students={students}
        classes={classes}
        onSelectStudent={(st) => {
          setActiveStudentProfile(st);
        }}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
        }}
      />

      {/* Global Student 360° Profile Modal */}
      {activeStudentProfile && (
        <StudentProfileModal
          student={activeStudentProfile}
          classes={classes}
          attendance={attendance}
          makeups={makeups}
          invoices={invoices}
          exams={exams}
          onClose={() => setActiveStudentProfile(null)}
          onOpenVietQR={setActiveVietQRInvoice}
          onReEnrollStudent={handleReEnrollStudent}
        />
      )}

      {/* Global Smart VietQR Payment Modal */}
      {activeVietQRInvoice && (
        <VietQRModal
          invoice={activeVietQRInvoice}
          onClose={() => setActiveVietQRInvoice(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </ModernShell>
  );
}
