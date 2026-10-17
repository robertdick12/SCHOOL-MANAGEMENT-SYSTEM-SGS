import { api, ensureCsrfCookie } from './client'

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
}

export const passwordResetApi = {
  forgot: async (email: string) => {
    await ensureCsrfCookie()
    return api.post<{ message: string }>('/forgot-password', { email }).then((r) => r.data)
  },
  reset: async (payload: ResetPasswordPayload) => {
    await ensureCsrfCookie()
    return api.post<{ message: string }>('/reset-password', payload).then((r) => r.data)
  },
}
