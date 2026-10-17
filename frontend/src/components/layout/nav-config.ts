import type { Role } from '@/types/auth'

export interface NavItem {
  label: string
  to: string
  end?: boolean
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  platform_admin: [{ label: 'Schools', to: '/platform', end: true }],
  admin: [
    { label: 'Overview', to: '/admin', end: true },
    { label: 'Students', to: '/admin/students' },
    { label: 'Teachers', to: '/admin/teachers' },
    { label: 'Guardians', to: '/admin/guardians' },
    { label: 'Classes', to: '/admin/classes' },
    { label: 'Subjects', to: '/admin/subjects' },
    { label: 'Academic years & terms', to: '/admin/academics' },
    { label: 'Timetable', to: '/admin/timetable' },
    { label: 'Examinations', to: '/admin/exams' },
    { label: 'Attendance', to: '/admin/attendance' },
    { label: 'Fee structures', to: '/admin/fee-structures' },
    { label: 'Invoices', to: '/admin/invoices' },
    { label: 'Payments', to: '/admin/payments' },
    { label: 'Announcements', to: '/admin/announcements' },
    { label: 'Users & roles', to: '/admin/users' },
    { label: 'Audit log', to: '/admin/audit-log' },
  ],
  teacher: [
    { label: 'Overview', to: '/teacher', end: true },
    { label: 'My classes', to: '/teacher/classes' },
    { label: 'Timetable', to: '/teacher/timetable' },
    { label: 'Attendance', to: '/teacher/attendance' },
    { label: 'Assessments', to: '/teacher/assessments' },
    { label: 'Examinations', to: '/teacher/exams' },
    { label: 'Announcements', to: '/teacher/announcements' },
  ],
  student: [
    { label: 'Overview', to: '/student', end: true },
    { label: 'Timetable', to: '/student/timetable' },
    { label: 'Attendance', to: '/student/attendance' },
    { label: 'Results', to: '/student/results' },
    { label: 'Examinations', to: '/student/exams' },
    { label: 'Announcements', to: '/student/announcements' },
  ],
  parent: [
    { label: 'My children', to: '/parent', end: true },
    { label: 'Timetable', to: '/parent/timetable' },
    { label: 'Announcements', to: '/parent/announcements' },
  ],
  accountant: [
    { label: 'Overview', to: '/accountant', end: true },
    { label: 'Fee structures', to: '/accountant/fee-structures' },
    { label: 'Invoices', to: '/accountant/invoices' },
    { label: 'Payments', to: '/accountant/payments' },
    { label: 'Arrears report', to: '/accountant/arrears' },
  ],
}

export const ROLE_LABEL: Record<Role, string> = {
  platform_admin: 'Platform Owner',
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent / Guardian',
  accountant: 'Accountant',
}

export const ROLE_HOME: Record<Role, string> = {
  platform_admin: '/platform',
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
  accountant: '/accountant',
}
