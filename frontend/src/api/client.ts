import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

/**
 * Laravel Sanctum SPA auth: a CSRF cookie must be fetched once before any
 * stateful (cookie-based) POST/PUT/PATCH/DELETE request, including login.
 */
export async function ensureCsrfCookie(): Promise<void> {
  await axios.get('/sanctum/csrf-cookie', { baseURL: '/', withCredentials: true })
}

export interface ApiErrorShape {
  message: string
  errors?: Record<string, string[]>
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    const data = error.response?.data
    if (data?.errors) {
      const first = Object.values(data.errors)[0]?.[0]
      if (first) return first
    }
    if (data?.message) return data.message
  }
  return 'Something went wrong. Please try again.'
}
