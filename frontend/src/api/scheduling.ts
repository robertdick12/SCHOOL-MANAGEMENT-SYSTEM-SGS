import { api } from './client'
import type { Exam, TimetableEntry } from '@/types/models'

export const timetableApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<TimetableEntry[]>('/timetable-entries', { params }).then((r) => r.data),
  create: (data: Partial<TimetableEntry>) =>
    api.post<TimetableEntry>('/timetable-entries', data).then((r) => r.data),
  remove: (id: number) => api.delete(`/timetable-entries/${id}`),
}

export const examsApi = {
  list: (params?: Record<string, unknown>) => api.get<Exam[]>('/exams', { params }).then((r) => r.data),
  create: (data: Partial<Exam>) => api.post<Exam>('/exams', data).then((r) => r.data),
  publish: (id: number) => api.post<Exam>(`/exams/${id}/publish`).then((r) => r.data),
  remove: (id: number) => api.delete(`/exams/${id}`),
}
