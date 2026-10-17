import { api } from './client'
import type {
  Assessment,
  AssessmentRosterRow,
  AttendanceRecord,
  AttendanceRosterRow,
  MyResultRow,
} from '@/types/models'

export const assessmentsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Assessment[]>('/assessments', { params }).then((r) => r.data),
  create: (data: Partial<Assessment>) => api.post<Assessment>('/assessments', data).then((r) => r.data),
  publish: (id: number) => api.post<Assessment>(`/assessments/${id}/publish`).then((r) => r.data),
  roster: (id: number) =>
    api
      .get<{ assessment: Assessment; roster: AssessmentRosterRow[] }>(`/assessments/${id}/results`)
      .then((r) => r.data),
  submitResults: (id: number, results: { student_id: number; score: number | null; remarks?: string }[]) =>
    api.post(`/assessments/${id}/results`, { results }).then((r) => r.data),
}

export const resultsApi = {
  mine: () => api.get<MyResultRow[]>('/results/mine').then((r) => r.data),
  forStudent: (studentId: number) => api.get<MyResultRow[]>(`/students/${studentId}/results`).then((r) => r.data),
}

export const attendanceApi = {
  forClassAndDate: (schoolClassId: number, date: string) =>
    api
      .get<{ date: string; roster: AttendanceRosterRow[] }>('/attendance', { params: { school_class_id: schoolClassId, date } })
      .then((r) => r.data),
  submit: (
    schoolClassId: number,
    date: string,
    records: { student_id: number; status: string; remarks?: string }[],
  ) => api.post('/attendance', { school_class_id: schoolClassId, date, records }).then((r) => r.data),
  mine: () => api.get<AttendanceRecord[]>('/attendance/mine').then((r) => r.data),
  forStudent: (studentId: number) => api.get<AttendanceRecord[]>(`/students/${studentId}/attendance`).then((r) => r.data),
}
