import { api } from './client'
import type { Guardian, Paginated, Student, Teacher, TeacherAssignment } from '@/types/models'

export const teachersApi = {
  list: () => api.get<Teacher[]>('/teachers').then((r) => r.data),
  get: (id: number) => api.get<Teacher>(`/teachers/${id}`).then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    api.post<Teacher & { temporary_password?: string }>('/teachers', data).then((r) => r.data),
}

export const studentsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<Student>>('/students', { params }).then((r) => r.data),
  get: (id: number) => api.get<Student>(`/students/${id}`).then((r) => r.data),
  create: (data: Partial<Student>) => api.post<Student>('/students', data).then((r) => r.data),
  update: (id: number, data: Partial<Student>) => api.put<Student>(`/students/${id}`, data).then((r) => r.data),
  provisionLogin: (id: number, email: string) =>
    api.post<{ temporary_password: string }>(`/students/${id}/provision-login`, { email }).then((r) => r.data),
}

export const guardiansApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<Guardian>>('/guardians', { params }).then((r) => r.data),
  get: (id: number) => api.get<Guardian>(`/guardians/${id}`).then((r) => r.data),
  create: (data: Partial<Guardian>) => api.post<Guardian>('/guardians', data).then((r) => r.data),
  linkStudent: (guardianId: number, studentId: number, relationship: string, isPrimary: boolean) =>
    api
      .post(`/guardians/${guardianId}/students`, {
        student_id: studentId,
        relationship,
        is_primary_contact: isPrimary,
      })
      .then((r) => r.data),
  provisionLogin: (id: number, email: string) =>
    api.post<{ temporary_password: string }>(`/guardians/${id}/provision-login`, { email }).then((r) => r.data),
}

export const enrolmentsApi = {
  create: (data: { student_id: number; school_class_id: number; academic_year_id: number; enrolled_at: string }) =>
    api.post('/enrolments', data).then((r) => r.data),
}

export const teacherAssignmentsApi = {
  list: (schoolClassId?: number) =>
    api
      .get<TeacherAssignment[]>('/teacher-assignments', { params: schoolClassId ? { school_class_id: schoolClassId } : {} })
      .then((r) => r.data),
  create: (data: { teacher_id: number; school_class_id: number; subject_id: number; academic_term_id: number }) =>
    api.post<TeacherAssignment>('/teacher-assignments', data).then((r) => r.data),
  remove: (id: number) => api.delete(`/teacher-assignments/${id}`),
}
