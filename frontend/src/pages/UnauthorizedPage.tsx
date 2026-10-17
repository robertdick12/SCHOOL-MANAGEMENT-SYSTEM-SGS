import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { ROLE_HOME } from '@/components/layout/nav-config'

export function UnauthorizedPage() {
  const { user } = useAuth()
  const homeHref = user ? ROLE_HOME[user.roles[0]] : '/login'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <p className="text-sm font-semibold text-red-600">403</p>
      <h1 className="text-xl font-semibold text-slate-900">You don&apos;t have access to this page</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Your account doesn&apos;t have the permissions required to view this resource.
      </p>
      <Link to={homeHref}>
        <Button>Go to my dashboard</Button>
      </Link>
    </div>
  )
}
