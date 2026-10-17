import { api } from './client'
import type { Announcement, Paginated } from '@/types/models'

export const announcementsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<Announcement>>('/announcements', { params }).then((r) => r.data),
  create: (data: Partial<Announcement>) => api.post<Announcement>('/announcements', data).then((r) => r.data),
}
