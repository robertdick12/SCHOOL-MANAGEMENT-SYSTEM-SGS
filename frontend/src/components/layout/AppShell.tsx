import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { NAV_BY_ROLE, ROLE_HOME, ROLE_LABEL } from './nav-config'
import type { Role } from '@/types/auth'
import { cn, initials } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

function activeRoleFromPath(pathname: string, roles: [Role, ...Role[]]): Role {
  const match = roles.find((role) => pathname.startsWith(ROLE_HOME[role]))
  return match ?? roles[0]
}

export function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  if (!user) return null

  const activeRole = activeRoleFromPath(location.pathname, user.roles)
  const navItems = NAV_BY_ROLE[activeRole]

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={() => setMobileNavOpen(false)}
          className={({ isActive }) =>
            cn(
              'focus-ring rounded-md px-3 py-2 text-sm font-medium',
              isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-200 px-4 py-4">
          <p className="text-sm font-semibold text-slate-900">Ghana Int&apos;l Academy</p>
          <p className="text-xs text-slate-500">School Management System</p>
        </div>
        {nav}
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Menu</p>
              <button
                className="focus-ring rounded-md p-1 text-slate-500"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <button
            className="focus-ring rounded-md p-2 text-slate-600 md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-500">{ROLE_LABEL[activeRole]} portal</p>
          </div>

          <div className="flex items-center gap-3">
            {user.roles.length > 1 && (
              <select
                className="focus-ring rounded-md border border-slate-300 py-1.5 pl-2 pr-8 text-sm text-slate-700"
                value={activeRole}
                onChange={(event) => navigate(ROLE_HOME[event.target.value as Role])}
                aria-label="Switch portal"
              >
                {user.roles.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {initials(user.name)}
              </span>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user.name}</span>
            </div>

            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Log out
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
