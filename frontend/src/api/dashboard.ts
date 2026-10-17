import { api } from './client'

export interface AdminDashboard {
  student_count: number
  teacher_count: number
  class_count: number
  outstanding_balance_pesewas: number
  todays_collections_pesewas: number
  unpublished_assessments: number
}

export interface TeacherDashboard {
  class_count: number
  todays_lessons: { id: number; start_time: string; end_time: string; subject: { name: string }; school_class: { name: string } }[]
  unpublished_assessments: number
}

export interface StudentDashboard {
  current_class: string | null
  attendance_rate: number | null
  published_results_count: number
}

export interface ParentDashboardChild {
  student_id: number
  name: string
  class: string | null
  outstanding_balance_pesewas: number
}

export interface AccountantDashboard {
  outstanding_balance_pesewas: number
  todays_collections_pesewas: number
  unpaid_invoice_count: number
  recent_payments: { id: number; amount_pesewas: number; paid_at: string; student: { first_name: string; last_name: string } }[]
}

export const dashboardApi = {
  admin: () => api.get<AdminDashboard>('/dashboard/admin').then((r) => r.data),
  teacher: () => api.get<TeacherDashboard>('/dashboard/teacher').then((r) => r.data),
  student: () => api.get<StudentDashboard>('/dashboard/student').then((r) => r.data),
  parent: () => api.get<{ children: ParentDashboardChild[] }>('/dashboard/parent').then((r) => r.data),
  accountant: () => api.get<AccountantDashboard>('/dashboard/accountant').then((r) => r.data),
}
