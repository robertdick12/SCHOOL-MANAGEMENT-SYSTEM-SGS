import { api } from './client'
import type { Paginated } from '@/types/models'

export interface AdminUser {
  id: number
  name: string
  email: string
  is_active: boolean
  roles: { id: number; name: string }[]
}

export interface AuditLogRow {
  id: number
  user_id: number | null
  action: string
  auditable_type: string
  auditable_id: number
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  created_at: string
  user?: { name: string } | null
}

export const usersApi = {
  list: (params?: Record<string, unknown>) => api.get<Paginated<AdminUser>>('/users', { params }).then((r) => r.data),
  toggleActive: (id: number) => api.post<AdminUser>(`/users/${id}/toggle-active`).then((r) => r.data),
}

export const auditLogApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<AuditLogRow>>('/audit-logs', { params }).then((r) => r.data),
}
