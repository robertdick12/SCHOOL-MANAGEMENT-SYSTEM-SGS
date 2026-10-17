import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/auth/AuthContext'
import { RequireAuth, RequireRole } from '@/auth/RouteGuards'
import { AppShell } from '@/components/layout/AppShell'
import { ROLE_HOME } from '@/components/layout/nav-config'
import { LoginPage } from '@/pages/auth/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'
import { PageSpinner } from '@/components/ui/Spinner'

import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { AdminStudentsPage } from '@/pages/admin/AdminStudentsPage'
import { AdminStudentDetailPage } from '@/pages/admin/AdminStudentDetailPage'
import { AdminTeachersPage } from '@/pages/admin/AdminTeachersPage'
import { AdminGuardiansPage } from '@/pages/admin/AdminGuardiansPage'
import { AdminClassesPage } from '@/pages/admin/AdminClassesPage'
import { AdminClassDetailPage } from '@/pages/admin/AdminClassDetailPage'
import { AdminSubjectsPage } from '@/pages/admin/AdminSubjectsPage'
import { AdminAcademicsPage } from '@/pages/admin/AdminAcademicsPage'
import { AdminTimetablePage } from '@/pages/admin/AdminTimetablePage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminAuditLogPage } from '@/pages/admin/AdminAuditLogPage'

import { TeacherOverviewPage } from '@/pages/teacher/TeacherOverviewPage'
import { TeacherClassesPage } from '@/pages/teacher/TeacherClassesPage'
import { TeacherAttendancePage } from '@/pages/teacher/TeacherAttendancePage'
import { TeacherAssessmentsPage } from '@/pages/teacher/TeacherAssessmentsPage'
import { TeacherAssessmentDetailPage } from '@/pages/teacher/TeacherAssessmentDetailPage'

import { StudentOverviewPage } from '@/pages/student/StudentOverviewPage'
import { StudentResultsPage } from '@/pages/student/StudentResultsPage'
import { StudentAttendancePage } from '@/pages/student/StudentAttendancePage'

import { ParentOverviewPage } from '@/pages/parent/ParentOverviewPage'
import { ParentChildDetailPage } from '@/pages/parent/ParentChildDetailPage'

import { AccountantOverviewPage } from '@/pages/accountant/AccountantOverviewPage'
import { AccountantArrearsPage } from '@/pages/accountant/AccountantArrearsPage'

import { FeeStructuresPage } from '@/pages/finance/FeeStructuresPage'
import { InvoicesPage } from '@/pages/finance/InvoicesPage'
import { PaymentsPage } from '@/pages/finance/PaymentsPage'

import { TimetablePage } from '@/pages/shared/TimetablePage'
import { ExamsPage } from '@/pages/shared/ExamsPage'
import { AnnouncementsPage } from '@/pages/shared/AnnouncementsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
})

function RootRedirect() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[user.roles[0]]} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<RequireRole allow={['admin']} />}>
          <Route path="/admin" element={<AppShell />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="students/:studentId" element={<AdminStudentDetailPage />} />
            <Route path="teachers" element={<AdminTeachersPage />} />
            <Route path="guardians" element={<AdminGuardiansPage />} />
            <Route path="classes" element={<AdminClassesPage />} />
            <Route path="classes/:classId" element={<AdminClassDetailPage />} />
            <Route path="subjects" element={<AdminSubjectsPage />} />
            <Route path="academics" element={<AdminAcademicsPage />} />
            <Route path="timetable" element={<AdminTimetablePage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="attendance" element={<TeacherAttendancePage />} />
            <Route path="fee-structures" element={<FeeStructuresPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="audit-log" element={<AdminAuditLogPage />} />
          </Route>
        </Route>

        <Route element={<RequireRole allow={['teacher']} />}>
          <Route path="/teacher" element={<AppShell />}>
            <Route index element={<TeacherOverviewPage />} />
            <Route path="classes" element={<TeacherClassesPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="attendance" element={<TeacherAttendancePage />} />
            <Route path="assessments" element={<TeacherAssessmentsPage />} />
            <Route path="assessments/:assessmentId" element={<TeacherAssessmentDetailPage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
          </Route>
        </Route>

        <Route element={<RequireRole allow={['student']} />}>
          <Route path="/student" element={<AppShell />}>
            <Route index element={<StudentOverviewPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="attendance" element={<StudentAttendancePage />} />
            <Route path="results" element={<StudentResultsPage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
          </Route>
        </Route>

        <Route element={<RequireRole allow={['parent']} />}>
          <Route path="/parent" element={<AppShell />}>
            <Route index element={<ParentOverviewPage />} />
            <Route path="children/:studentId" element={<ParentChildDetailPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
          </Route>
        </Route>

        <Route element={<RequireRole allow={['accountant']} />}>
          <Route path="/accountant" element={<AppShell />}>
            <Route index element={<AccountantOverviewPage />} />
            <Route path="fee-structures" element={<FeeStructuresPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="arrears" element={<AccountantArrearsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
