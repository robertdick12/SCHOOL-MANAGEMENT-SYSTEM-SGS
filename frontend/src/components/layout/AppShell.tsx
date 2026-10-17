import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { NAV_BY_ROLE, ROLE_HOME, ROLE_LABEL } from './nav-config'
import type { Role } from '@/types/auth'
import { cn, initials } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

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
              isActive
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.school?.name ?? 'Platform Admin'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">School Management System</p>
        </div>
        {nav}
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Menu</p>
              <button
                className="focus-ring rounded-md p-1 text-slate-500 dark:text-slate-400"
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
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6 dark:border-slate-800 dark:bg-slate-900">
          <button
            className="focus-ring rounded-md p-2 text-slate-600 md:hidden dark:text-slate-400"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{ROLE_LABEL[activeRole]} portal</p>
          </div>

          <div className="flex items-center gap-3">
            {user.roles.length > 1 && (
              <select
                className="focus-ring rounded-md border border-slate-300 py-1.5 pl-2 pr-8 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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

            <ThemeToggle />

            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                {initials(user.name)}
              </span>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline dark:text-slate-300">{user.name}</span>
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
