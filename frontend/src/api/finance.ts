import { api } from './client'
import type { FeeStructure, Invoice, Paginated, Payment } from '@/types/models'

export const feeStructuresApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<FeeStructure[]>('/fee-structures', { params }).then((r) => r.data),
  create: (data: Partial<FeeStructure>) => api.post<FeeStructure>('/fee-structures', data).then((r) => r.data),
  remove: (id: number) => api.delete(`/fee-structures/${id}`),
}

export const invoicesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<Invoice>>('/invoices', { params }).then((r) => r.data),
  get: (id: number) => api.get<Invoice>(`/invoices/${id}`).then((r) => r.data),
  generate: (studentId: number, academicTermId: number) =>
    api.post<Invoice>('/invoices/generate', { student_id: studentId, academic_term_id: academicTermId }).then((r) => r.data),
  cancel: (id: number) => api.post<Invoice>(`/invoices/${id}/cancel`).then((r) => r.data),
}

export const paymentsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<Payment>>('/payments', { params }).then((r) => r.data),
  record: (data: { student_id: number; amount_pesewas: number; method: string; notes?: string; invoice_id?: number }) =>
    api.post<Payment>('/payments', data).then((r) => r.data),
}
