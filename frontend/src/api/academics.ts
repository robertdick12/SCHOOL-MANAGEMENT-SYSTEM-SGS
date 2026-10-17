import { api } from './client'
import type { AcademicTerm, AcademicYear, SchoolClass, Subject } from '@/types/models'

export const academicYearsApi = {
  list: () => api.get<AcademicYear[]>('/academic-years').then((r) => r.data),
  create: (data: Partial<AcademicYear>) => api.post<AcademicYear>('/academic-years', data).then((r) => r.data),
  update: (id: number, data: Partial<AcademicYear>) =>
    api.put<AcademicYear>(`/academic-years/${id}`, data).then((r) => r.data),
}

export const academicTermsApi = {
  list: () => api.get<AcademicTerm[]>('/academic-terms').then((r) => r.data),
  create: (data: Partial<AcademicTerm>) => api.post<AcademicTerm>('/academic-terms', data).then((r) => r.data),
  update: (id: number, data: Partial<AcademicTerm>) =>
    api.put<AcademicTerm>(`/academic-terms/${id}`, data).then((r) => r.data),
}

export const subjectsApi = {
  list: () => api.get<Subject[]>('/subjects').then((r) => r.data),
  create: (data: Partial<Subject>) => api.post<Subject>('/subjects', data).then((r) => r.data),
}

export const schoolClassesApi = {
  list: () => api.get<SchoolClass[]>('/school-classes').then((r) => r.data),
  get: (id: number) => api.get<SchoolClass>(`/school-classes/${id}`).then((r) => r.data),
  create: (data: Partial<SchoolClass>) => api.post<SchoolClass>('/school-classes', data).then((r) => r.data),
  update: (id: number, data: Partial<SchoolClass>) =>
    api.put<SchoolClass>(`/school-classes/${id}`, data).then((r) => r.data),
}
