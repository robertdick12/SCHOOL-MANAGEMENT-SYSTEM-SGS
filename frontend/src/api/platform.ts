import { api, ensureCsrfCookie } from './client'
import type { SchoolStatus } from '@/types/auth'

export interface PlatformSchool {
  id: number
  name: string
  slug: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  address: string | null
  status: SchoolStatus
  status_note: string | null
  approved_at: string | null
  created_at: string
  users_count: number
}

export const platformSchoolsApi = {
  list: () => api.get<PlatformSchool[]>('/platform/schools').then((r) => r.data),
  updateStatus: (id: number, status: SchoolStatus, status_note?: string) =>
    api.patch<PlatformSchool>(`/platform/schools/${id}`, { status, status_note }).then((r) => r.data),
}

export interface RegisterSchoolPayload {
  school_name: string
  contact_phone?: string
  address?: string
  admin_name: string
  admin_email: string
  admin_password: string
}

export const schoolRegistrationApi = {
  register: async (payload: RegisterSchoolPayload) => {
    await ensureCsrfCookie()
    return api.post<{ message: string }>('/register-school', payload).then((r) => r.data)
  },
}
