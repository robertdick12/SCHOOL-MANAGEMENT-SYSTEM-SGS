import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Role } from '@/types/auth'

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

  return <Outlet />
}

export function RequireRole({ allow }: { allow: Role[] }) {
  const { user } = useAuth()
  if (!user) return null

  const hasAccess = user.roles.some((role) => allow.includes(role))
  if (!hasAccess) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}
