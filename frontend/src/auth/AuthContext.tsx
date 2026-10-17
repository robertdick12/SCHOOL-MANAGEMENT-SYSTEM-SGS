import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { api, ensureCsrfCookie } from '@/api/client'
import type { AuthUser, Role } from '@/types/auth'

interface LoginPayload {
  email: string
  password: string
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  hasRole: (role: Role) => boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const { data } = await api.get<AuthUser>('/me')
    return data
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      await ensureCsrfCookie()
      await api.post('/login', payload)
      const me = await fetchMe()
      if (!me) throw new Error('Login succeeded but profile could not be loaded.')
      return me
    },
    onSuccess: (me) => {
      queryClient.setQueryData(['auth', 'me'], me)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/logout')
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null)
      queryClient.clear()
    },
  })

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated: !!user,
      hasRole: (role) => !!user?.roles.includes(role),
      login: (payload) => loginMutation.mutateAsync(payload),
      logout: () => logoutMutation.mutateAsync(),
    }),
    [user, isLoading, loginMutation, logoutMutation],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
